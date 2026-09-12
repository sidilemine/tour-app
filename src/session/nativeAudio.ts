// Source-patched expo-audio must be present in the installed binary, not just node_modules.
export function nativeAudioGeneration(status: unknown): number {
  const value = status as { tourAdapterVersion?: unknown; tourGeneration?: unknown } | null;
  if (value?.tourAdapterVersion !== 1 || !Number.isInteger(value.tourGeneration) || Number(value.tourGeneration) < 1) {
    throw Error('This APK is missing the required audio adapter. Rebuild with expo-audio in Android buildFromSource, then reinstall. Playback has been stopped.');
  }
  return value.tourGeneration as number;
}
