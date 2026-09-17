import React, { useCallback, useRef, useState } from "react";
import { Upload, Image as ImageIcon, Link2, X } from "lucide-react";
import { Button } from "../common/Button";

type Props = {
  onUpload: (dataUrl: string) => void | Promise<void>;
  sampleSrc?: string;
  onUseSample?: () => void | Promise<void>;
};

export const ImageUploader: React.FC<Props> = ({
  onUpload,
  sampleSrc,
  onUseSample,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = async () => {
        await onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          // reset value so the same file can be picked again
          e.currentTarget.value = "";
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`rounded-lg border-2 border-dashed p-3 transition-colors ${
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload size={14} /> Upload
          </Button>

          {sampleSrc && onUseSample && (
            <Button variant="secondary" size="sm" onClick={() => onUseSample()}>
              <ImageIcon size={14} /> Use sample
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setUrlOpen((v) => !v)}
            aria-expanded={urlOpen}
          >
            <Link2 size={14} /> From URL
          </Button>

          <span className="text-xs text-slate-500 ml-auto hidden sm:inline">
            Drag & drop an image here
          </span>
        </div>

        {urlOpen && (
          <div className="mt-3 flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <Button
              size="sm"
              onClick={async () => {
                if (!url) return;
                await onUpload(url);
                setUrl("");
                setUrlOpen(false);
              }}
            >
              Load
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setUrlOpen(false)}>
              <X size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};