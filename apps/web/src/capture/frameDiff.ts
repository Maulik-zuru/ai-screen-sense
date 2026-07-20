/**
 * Cheap perceptual diff: downscale to a tiny thumbnail, compare grayscale
 * pixel values against the last-sent frame, and only forward the full frame
 * if the mean absolute difference exceeds a threshold. This is the main lever
 * for controlling both latency and the user's own BYOK API spend (doc §6.3).
 */

const THUMB_SIZE = 32;

export class FrameDiffer {
  private lastThumb: Uint8ClampedArray | null = null;

  constructor(private readonly threshold = 8) {}

  /** Returns true if this frame differs enough from the last sent frame to warrant sending. */
  shouldSend(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): boolean {
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = THUMB_SIZE;
    thumbCanvas.height = THUMB_SIZE;
    const thumbCtx = thumbCanvas.getContext("2d")!;
    thumbCtx.drawImage(canvas, 0, 0, THUMB_SIZE, THUMB_SIZE);
    const { data } = thumbCtx.getImageData(0, 0, THUMB_SIZE, THUMB_SIZE);

    const grayscale = new Uint8ClampedArray(THUMB_SIZE * THUMB_SIZE);
    for (let i = 0; i < grayscale.length; i++) {
      const o = i * 4;
      grayscale[i] = Math.round(0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]);
    }

    if (!this.lastThumb) {
      this.lastThumb = grayscale;
      return true;
    }

    let totalDiff = 0;
    for (let i = 0; i < grayscale.length; i++) {
      totalDiff += Math.abs(grayscale[i] - this.lastThumb[i]);
    }
    const meanDiff = totalDiff / grayscale.length;

    if (meanDiff >= this.threshold) {
      this.lastThumb = grayscale;
      return true;
    }
    return false;
  }
}
