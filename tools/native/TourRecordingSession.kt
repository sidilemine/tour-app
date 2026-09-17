package expo.modules.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaRecorder
import android.os.Build
import android.os.Handler
import android.os.Looper

/** Foreground review capture only. Never plays audio or clears tour pause intent. */
class TourRecordingSession(
  context: Context,
  private val media: () -> MediaRecorder?,
  private val pause: () -> Unit
) {
  private val manager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
  private val handler = Handler(Looper.getMainLooper())
  private var focus: AudioFocusRequest? = null
  private var expected: AudioDeviceInfo? = null
  private var expectedBluetooth = false
  private var previousMode: Int? = null
  private var changedCommunication = false
  private var closed = false
  private var verified = false
  var interruption: String? = null
    private set

  private fun bluetooth(type: Int) = type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO ||
    (Build.VERSION.SDK_INT >= 31 && type == AudioDeviceInfo.TYPE_BLE_HEADSET)
  private fun wired(type: Int) = type == AudioDeviceInfo.TYPE_WIRED_HEADSET || type == AudioDeviceInfo.TYPE_USB_HEADSET
  private fun input() = media()?.routedDevice
  private fun matches(device: AudioDeviceInfo?) = device != null &&
    if (expectedBluetooth) bluetooth(device.type) else device.id == expected?.id

  private val listener = AudioManager.OnAudioFocusChangeListener { change ->
    if (change < 0) interrupt("Another app interrupted recording. Your captured note is being saved.")
  }
  private val monitor = object : Runnable {
    override fun run() {
      if (closed || interruption != null) return
      if (verified && !matches(input())) {
        interrupt("The recording microphone changed or disconnected. Your captured note is being saved.")
      } else handler.postDelayed(this, 250)
    }
  }
  private fun interrupt(message: String) {
    if (closed || interruption != null) return
    interruption = message
    try { pause() } catch (_: Exception) { /* JS still finalises/preserves the file. */ }
  }

  fun begin(preferHeadset: Boolean) {
    check(Build.VERSION.SDK_INT >= 26) { "Verified recording requires Android 8 or newer." }
    val inputs = manager.getDevices(AudioManager.GET_DEVICES_INPUTS).toList()
    val headset = if (preferHeadset) inputs.firstOrNull { wired(it.type) }
      ?: inputs.firstOrNull { bluetooth(it.type) } else null
    // A2DP output alone is not proof that a headset microphone is available.
    if (preferHeadset && headset == null && manager.getDevices(AudioManager.GET_DEVICES_OUTPUTS).any {
        bluetooth(it.type) || wired(it.type) || it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP
      }) error("Headphones are connected but their microphone is unavailable. Choose Phone microphone, or reconnect the headset.")
    expected = headset ?: inputs.firstOrNull { it.type == AudioDeviceInfo.TYPE_BUILTIN_MIC }
      ?: error("No recording microphone is available.")
    expectedBluetooth = bluetooth(expected!!.type)
    val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE)
      .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA)
        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
      .setAcceptsDelayedFocusGain(false).setOnAudioFocusChangeListener(listener, handler).build()
    focus = request
    check(manager.requestAudioFocus(request) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
      "Could not pause other audio for recording. Stop the other app and try again."
    }
    if (expectedBluetooth) {
      check(Build.VERSION.SDK_INT >= 31) { "Choose Phone microphone on this Android version." }
      val device = manager.availableCommunicationDevices.firstOrNull { bluetooth(it.type) }
        ?: error("The headset microphone cannot connect. Choose Phone microphone or reconnect the headset.")
      previousMode = manager.mode
      manager.mode = AudioManager.MODE_IN_COMMUNICATION
      changedCommunication = true
      check(manager.setCommunicationDevice(device)) { "Android could not select the headset microphone." }
      check(media()?.setPreferredDevice(expected) == true) { "Android could not select the headset input." }
      // Android chooses the corresponding input for the communication output.
      // Input/output device IDs differ; do not pass the input to setCommunicationDevice.
    } else {
      check(media()?.setPreferredDevice(expected) == true) { "Android could not select the phone/wired microphone." }
    }
    handler.post(monitor)
  }

  fun status(): Map<String, Any?> {
    val actual = input()
    val ready = interruption == null && matches(actual)
    if (ready) verified = true
    val kind = when {
      actual == null -> "unknown"
      bluetooth(actual.type) -> "headset"
      wired(actual.type) -> "headset"
      actual.type == AudioDeviceInfo.TYPE_BUILTIN_MIC -> "phone"
      else -> "other"
    }
    return mapOf("revision" to 1, "verified" to ready, "kind" to kind,
      "name" to if (kind == "phone") "Phone microphone" else actual?.productName?.toString(),
      "interruption" to interruption)
  }

  fun close() {
    if (closed) return
    closed = true
    handler.removeCallbacks(monitor)
    if (Build.VERSION.SDK_INT >= 31 && changedCommunication) {
      try { manager.clearCommunicationDevice() } catch (_: Exception) {}
      try { previousMode?.let { if (manager.mode == AudioManager.MODE_IN_COMMUNICATION) manager.mode = it } } catch (_: Exception) {}
    }
    if (Build.VERSION.SDK_INT >= 26) try { focus?.let { manager.abandonAudioFocusRequest(it) } } catch (_: Exception) {}
    focus = null
  }
}
