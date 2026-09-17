import { useCallback, useEffect, useRef, useState } from "react";
import type { Operation } from "../types";

export function useImageProcessor(initialSrc: string) {
  const [sourceLoaded, setSourceLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const originalRef = useRef<HTMLCanvasElement | null>(null);
  const workingRef = useRef<HTMLCanvasElement | null>(null);

  /** Store a pristine copy of the image */
  const loadImage = useCallback((src: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const orig = document.createElement("canvas");
      orig.width = img.width;
      orig.height = img.height;
      orig.getContext("2d")!.drawImage(img, 0, 0);
      originalRef.current = orig;

      if (workingRef.current) {
        workingRef.current.width = img.width;
        workingRef.current.height = img.height;
        workingRef.current.getContext("2d")!.drawImage(img, 0, 0);
      }
      setSourceLoaded(true);
    };
    img.src = src;
  }, []);

  const resetWorking = useCallback(() => {
    if (!originalRef.current || !workingRef.current) return;
    const ctx = workingRef.current.getContext("2d")!;
    workingRef.current.width = originalRef.current.width;
    workingRef.current.height = originalRef.current.height;
    ctx.drawImage(originalRef.current, 0, 0);
  }, []);

  const applyOperation = useCallback(
    async (op: Operation, params: Record<string, any>, fresh = true) => {
      if (!workingRef.current) return;
      setIsProcessing(true);
      if (fresh) resetWorking();
      try {
        await op.apply(workingRef.current, params);
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