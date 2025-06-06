"use client";

import type React from "react";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Paperclip, ImageIcon, Music, Video, FileText } from "lucide-react";
import {
  getFileType,
  formatFileSize,
  MAX_FILE_SIZE,
  createThumbnail,
  getAudioDuration,
  getVideoDuration,
  isFileTypeAllowed,
} from "@/lib/file-upload";
import MediaPreview from "./media-preview";

interface FileUploadProps {
  onFileSelect: (file: File, mediaData: any, caption?: string) => void;
  disabled?: boolean;
}

export default function FileUpload({
  onFileSelect,
  disabled,
}: FileUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaData, setMediaData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (acceptedTypes: string[]) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptedTypes.join(",");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isFileTypeAllowed(file.type)) {
      alert(`File type ${file.type} is not supported`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    setProcessing(true);
    setIsOpen(false);

    try {
      const fileType = getFileType(file.type);
      const mediaData: any = {
        type: fileType,
        name: file.name,
        size: file.size,
      };

      // Get additional metadata for media files
      if (fileType === "audio") {
        try {
          mediaData.duration = await getAudioDuration(file);
        } catch (error) {
          console.warn("Could not get audio duration:", error);
        }
      } else if (fileType === "video") {
        try {
          mediaData.duration = await getVideoDuration(file);
          mediaData.thumbnail = await createThumbnail(file);
        } catch (error) {
          console.warn("Could not get video metadata:", error);
        }
      }

      setSelectedFile(file);
      setMediaData(mediaData);
      setProcessing(false);
    } catch (error) {
      console.error("File processing failed:", error);
      alert("Failed to process file. Please try again.");
      setProcessing(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMedia = async (caption?: string) => {
    if (!selectedFile || !mediaData) return;

    try {
      // Upload the file first
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const uploadResult = await response.json();
      const finalMediaData = {
        ...mediaData,
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      };

      onFileSelect(selectedFile, finalMediaData, caption);
      setSelectedFile(null);
      setMediaData(null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    setMediaData(null);
  };

  const uploadOptions = [
    {
      icon: ImageIcon,
      label: "Image",
      accept: ["image/*"],
      color: "text-green-600",
    },
    {
      icon: Music,
      label: "Audio",
      accept: ["audio/*"],
      color: "text-blue-600",
    },
    {
      icon: Video,
      label: "Video",
      accept: ["video/*"],
      color: "text-purple-600",
    },
    {
      icon: FileText,
      label: "Document",
      accept: [".pdf", ".doc", ".docx", ".txt"],
      color: "text-orange-600",
    },
  ];

  return (
    <>
      <div className="relative">
        <Button
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || processing}
          className="p-2 bg-pink-600 hover:bg-pink-600/90 rounded-tr-[50%] rounded-bl-[50%]"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 mb-2 z-50"
            >
              <Card className="p-2 shadow-lg border">
                <div className="grid grid-cols-2 gap-2 w-48">
                  {uploadOptions.map((option) => (
                    <Button
                      key={option.label}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileSelect(option.accept)}
                      disabled={processing}
                      className="flex flex-col items-center p-3 h-auto space-y-1"
                    >
                      <option.icon className={`w-5 h-5 ${option.color}`} />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Indicator */}
        <AnimatePresence>
          {processing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            >
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Processing file...</span>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Media Preview Modal */}
      <AnimatePresence>
        {selectedFile && mediaData && (
          <MediaPreview
            file={selectedFile}
            mediaData={mediaData}
            onSend={handleSendMedia}
            onCancel={handleCancelPreview}
          />
        )}
      </AnimatePresence>
    </>
  );
}
