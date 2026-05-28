"use client";

import React, { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";

type Props = {
  defaultUrl?: string | null;
  name?: string;
  tenantId: string;
};

export function ImageUploadField({ defaultUrl = null, name = "image_url", tenantId }: Props) {
  const [preview, setPreview] = useState<string | null>(defaultUrl);
  const [uploading, setUploading] = useState(false);
  const [storedUrl, setStoredUrl] = useState<string | null>(defaultUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setPreview(e.target.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const sb = getBrowserClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${tenantId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await sb.storage.from("menu-images").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw error;
      const { data } = sb.storage.from("menu-images").getPublicUrl(path);
      setStoredUrl(data.publicUrl);
      toast.success("Image uploaded");
    } catch (err: any) {
      // Storage upload failed — fall back to base64 data URL stored in DB.
      // This happens when the bucket doesn't exist yet or RLS blocks the upload.
      toast.error("Upload failed — image will be stored as data URL");
      setStoredUrl(preview); // use the base64 preview as fallback
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    setStoredUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {/* The hidden input carries the final URL (Storage URL or base64 fallback) */}
      <input type="hidden" name={name} value={storedUrl ?? ""} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />

      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border border-admin-line-2 bg-admin-bg-2 aspect-video flex items-center justify-center max-w-md shadow-sm">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
            </div>
          )}
          {!uploading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-lg bg-white/90 text-neutral-900 text-[12px] font-medium hover:bg-white transition-colors cursor-pointer"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 max-w-md flex flex-col items-center justify-center gap-2 bg-admin-bg-card hover:bg-admin-bg-2/30 ${
            isDragging ? "border-admin-lime bg-admin-lime-soft/10" : "border-admin-line-2 hover:border-admin-line-3"
          }`}
        >
          <div className="h-10 w-10 rounded-full bg-admin-bg-2 flex items-center justify-center text-admin-ink-3">
            <Upload size={16} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[13.5px] font-medium text-admin-ink font-sans">Click to upload or drag & drop</p>
            <p className="text-[11.5px] text-admin-ink-3">PNG, JPG, WEBP or GIF · max 2 MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
