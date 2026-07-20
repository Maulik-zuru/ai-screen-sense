import { useCallback, useRef, useState } from "react";
import { FrameDiffer } from "./frameDiff.js";

export interface CapturedFrame {
  imageBase64: string;
  mimeType: "image/jpeg";
  width: number;
  height: number;
}

interface UseScreenCaptureOptions {
  onFrame: (frame: CapturedFrame) => void;
  sampleIntervalMs?: number;
}

export function useScreenCapture({ onFrame, sampleIntervalMs = 1500 }: UseScreenCaptureOptions) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [framesSampled, setFramesSampled] = useState(0);
  const [framesSent, setFramesSent] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const differRef = useRef(new FrameDiffer());

  const stop = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCapturing(false);
  }, []);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 5 },
      audio: false,
    });
    streamRef.current = stream;

    const video = document.createElement("video");
    video.srcObject = stream;
    await video.play();
    videoRef.current = video;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;

    stream.getVideoTracks()[0].addEventListener("ended", stop);

    setIsCapturing(true);
    setFramesSampled(0);
    setFramesSent(0);
    differRef.current = new FrameDiffer();

    intervalRef.current = window.setInterval(() => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setFramesSampled((n) => n + 1);

      if (!differRef.current.shouldSend(canvas, ctx)) return;

      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const imageBase64 = dataUrl.split(",")[1];
      setFramesSent((n) => n + 1);
      onFrame({
        imageBase64,
        mimeType: "image/jpeg",
        width: canvas.width,
        height: canvas.height,
      });
    }, sampleIntervalMs);
  }, [onFrame, sampleIntervalMs, stop]);

  return { start, stop, isCapturing, framesSampled, framesSent };
}
