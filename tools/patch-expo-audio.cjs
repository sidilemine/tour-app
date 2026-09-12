// Narrow Android adapter patch for expo-audio 57.0.5. Fails closed on an SDK change.
// Keep lock-screen intent observable and never resume automatically on focus return.
const fs = require('node:fs');
const root = 'node_modules/expo-audio';
const version = JSON.parse(fs.readFileSync(`${root}/package.json`, 'utf8')).version;
if (version !== '57.0.5') throw new Error(`Review the tour audio patch for expo-audio ${version}`);
function patch(file, before, after, marker = after) {
  const name = `${root}/android/src/main/java/expo/modules/audio/${file}`;
  let text = fs.readFileSync(name, 'utf8');
  if (text.includes(marker)) return;
  if (!text.includes(before)) throw new Error(`Audio patch anchor missing: ${file}`);
  text = text.replace(before, after); fs.writeFileSync(name, text);
}
patch('AudioModule.kt', '              playable.play()\n', '              // Tour policy: explicit user resume is required after an interruption.\n');
patch('AudioPlayer.kt', '  var preservesPitch = true', `  // Tour controls flow through the durable JS coordinator, even during silence.
  fun notifyTourCommand(command: String) {
    sendStatusUpdate(mapOf("tourCommand" to command))
  }

  var preservesPitch = true`, '  fun notifyTourCommand(command: String)');
patch('service/AudioControlsService.kt', `    if (!isLive) {
      return player.ref
    }

    return object : ForwardingPlayer(player.ref) {
      override fun getAvailableCommands(): Player.Commands {
        return super.getAvailableCommands().buildUpon()`, `    return object : ForwardingPlayer(player.ref) {
      override fun play() { player.notifyTourCommand("play") }
      override fun pause() {
        super.pause()
        player.notifyTourCommand("pause")
      }
      override fun setPlayWhenReady(playWhenReady: Boolean) {
        if (playWhenReady) play() else pause()
      }
      override fun getAvailableCommands(): Player.Commands {
        if (!isLive) return super.getAvailableCommands()
        return super.getAvailableCommands().buildUpon()`);
// Notification buttons must use the same wrapper as media/headset controllers.
patch('service/AudioControlsService.kt',
  '    val currentPlayerRef = currentPlayer?.ref',
  '    val currentPlayerRef = mediaSession?.player ?: currentPlayer?.ref');
console.log('expo-audio: explicit resume and observable remote intent patch verified');
patch('AudioPlayer.kt', '  init {\n    installPlayerListeners()', '  init {\n    // Pause rather than move a walking story onto the speaker unexpectedly.\n    ref.setHandleAudioBecomingNoisy(true)\n    installPlayerListeners()');
patch('AudioPlayer.kt', '  var preservesPitch = true', '  var tourGeneration: Int = 0\n  var preservesPitch = true');
patch('AudioPlayer.kt', '  fun setMediaSource(source: MediaSource) {\n    previousPlaybackState', '  fun setMediaSource(source: MediaSource) {\n    tourGeneration++\n    previousPlaybackState');
patch('AudioPlayer.kt', '      "id" to id,', '      "tourGeneration" to tourGeneration,\n      "id" to id,');

patch('AudioPlayer.kt', '      "tourGeneration" to tourGeneration,', '      "tourAdapterVersion" to 1,\n      "tourGeneration" to tourGeneration,');
