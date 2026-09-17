import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "../common/Button";

export const ImageUploader: React.FC<{
  onUpload: (dataUrl: string) => void;
  onUseSample?: () => void;
  sampleSrc?: string;
}> = ({ onUpload, onUseSample, sampleSrc }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
        <Upload size={14} /> Upload image
      </Button>
      {sampleSrc && onUseSample && (
        <Button variant="secondary" size="sm" onClick={onUseSample}>
          Use sample
        </Button>
      )}
    </div>
  );
};