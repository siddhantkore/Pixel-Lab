import { useCallback, useRef, useState } from "react";
import type { Operation } from "../types";

/**
 * Keeps two canvases:
 *  - originalRef: pristine copy of the loaded image (never modified)
 *  - workingRef:  the canvas shown to the user & processed by operations
 *
 * After `loadImage`, we wait for React to render the <canvas> elements
 * (via a tick) before painting, so refs are guaranteed to exist.
 */
export function useImageProcessor(initialSrc?: string) {
  const [sourceLoaded, setSourceLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const originalRef = useRef<HTMLCanvasElement | null>(null);
  const workingRef = useRef<HTMLCanvasElement | null>(null);
  const currentSrcRef = useRef<string | undefined>(initialSrc);

  /** Paint a source (dataURL or URL) onto both canvases */
  const loadImage = useCallback(async (src: string) => {
    currentSrcRef.current = src;

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = src;
    });

    // Wait one animation frame to ensure canvas refs are mounted
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    const orig = originalRef.current;
    const work = workingRef.current;
    if (!orig || !work) {
      // If refs aren't ready, try again on next frame
      await new Promise((r) => setTimeout(r, 30));
    }
    const o = originalRef.current!;
    const w = workingRef.current!;
    o.width = img.width;
    o.height = img.height;
    o.getContext("2d")!.drawImage(img, 0, 0);

    w.width = img.width;
    w.height = img.height;
    w.getContext("2d")!.drawImage(img, 0, 0);

    setSourceLoaded(true);
  }, []);

  const resetWorking = useCallback(() => {
    const o = originalRef.current;
    const w = workingRef.current;
    if (!o || !w) return;
    w.width = o.width;
    w.height = o.height;
    w.getContext("2d")!.drawImage(o, 0, 0);
  }, []);

  const applyOperation = useCallback(
    async (op: Operation, params: Record<string, any>, fresh = true) => {
      const w = workingRef.current;
      if (!w) return;
      setIsProcessing(true);
      if (fresh) resetWorking();
      try {
        await op.apply(w, params);
      } finally {
        setIsProcessing(false);
      }
    },
    [resetWorking]
  );

  return {
    originalRef,
    workingRef,
    loadImage,
    resetWorking,
    applyOperation,
    isProcessing,
    sourceLoaded,
  };
}