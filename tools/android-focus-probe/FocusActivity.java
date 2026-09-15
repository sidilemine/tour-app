package uk.sidi.walkingtour.focusprobe;

import android.app.Activity;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Engineer-only companion: actual Android transient focus, never player events. */
public final class FocusActivity extends Activity {
  private final Handler handler = new Handler(Looper.getMainLooper());
  private AudioManager audio;
  private AudioFocusRequest request;
  private ToneGenerator tone;
  private TextView status;
  private boolean held;

  private void record(String message) {
    Log.i("TourFocusProbe", System.currentTimeMillis() + " " + message);
    status.setText(message);
  }

  @Override public void onCreate(Bundle saved) {
    super.onCreate(saved);
    audio = (AudioManager) getSystemService(AUDIO_SERVICE);
    LinearLayout layout = new LinearLayout(this);
    layout.setOrientation(LinearLayout.VERTICAL);
    layout.setPadding(32, 120, 32, 32);
    status = new TextView(this);
    status.setText("Engineer test. Play tour narration first. This temporarily takes audio focus for eight seconds, then returns it. No tour controls or data are accessed.");
    layout.addView(status);
    Button take = new Button(this);
    take.setText("Interrupt for 8 seconds");
    take.setOnClickListener(v -> acquire());
    layout.addView(take);
    Button release = new Button(this);
    release.setText("Release now");
    release.setOnClickListener(v -> release());
    layout.addView(release);
    setContentView(layout);
  }

  private void acquire() {
    if (held) return;
    request = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
        .setAudioAttributes(new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
        .setOnAudioFocusChangeListener(change -> record("focus callback " + change), handler)
        .build();
    int result = audio.requestAudioFocus(request);
    held = result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED;
    record("transient request result=" + result + "; held=" + held);
    if (!held) return;
    // A brief audible marker; the eight-second focus interval is not a silent
    // audio loop and is never used to keep the walking app alive.
    try {
      tone = new ToneGenerator(AudioManager.STREAM_MUSIC, 20);
      tone.startTone(ToneGenerator.TONE_PROP_BEEP, 300);
    } catch (RuntimeException error) {
      record("marker unavailable: " + error.getClass().getSimpleName());
    }
    handler.postDelayed(this::release, 8000);
  }

  private void release() {
    handler.removeCallbacksAndMessages(null);
    if (held) {
      int result = audio.abandonAudioFocusRequest(request);
      held = false;
      record("focus abandoned result=" + result + "; tour must stay paused");
    }
    if (tone != null) { tone.release(); tone = null; }
  }

  @Override public void onDestroy() {
    release();
    super.onDestroy();
  }
}
