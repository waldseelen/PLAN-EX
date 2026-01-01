export const toggleWhiteNoise = (ctx: AudioContext | null, isPlaying: boolean): AudioContext | null => {
  if (isPlaying && ctx) {
    ctx.close();
    return null;
  }

  if (!isPlaying) {
    const newCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = 2 * newCtx.sampleRate;
    const noiseBuffer = newCtx.createBuffer(1, bufferSize, newCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i += 1) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noise = newCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const gainNode = newCtx.createGain();
    gainNode.gain.value = 0.15;

    noise.connect(gainNode);
    gainNode.connect(newCtx.destination);
    noise.start();
    return newCtx;
  }

  return null;
};
