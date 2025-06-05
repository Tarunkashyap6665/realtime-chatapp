"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Send, FileText, Music, Video, ImageIcon } from "lucide-react"
import { formatFileSize, formatDuration } from "@/lib/file-upload"

interface MediaPreviewProps {
  file: File
  mediaData: any
  onSend: (caption?: string) => void
  onCancel: () => void
}

export default function MediaPreview({ file, mediaData, onSend, onCancel }: MediaPreviewProps) {
  const [caption, setCaption] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)

  const getMediaIcon = () => {
    switch (mediaData.type) {
      case "image":
        return <ImageIcon className="w-6 h-6" />
      case "audio":
        return <Music className="w-6 h-6" />
      case "video":
        return <Video className="w-6 h-6" />
      default:
        return <FileText className="w-6 h-6" />
    }
  }

  const renderPreview = () => {
    const fileUrl = URL.createObjectURL(file)

    switch (mediaData.type) {
      case "image":
        return (
          <div className="relative">
            <img
              src={fileUrl || "/placeholder.svg"}
              alt={file.name}
              className="max-w-full max-h-80 rounded-lg object-contain"
              onLoad={() => URL.revokeObjectURL(fileUrl)}
            />
          </div>
        )

      case "video":
        return (
          <div className="relative">
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-80 rounded-lg"
              poster={mediaData.thumbnail}
              onLoadedData={() => URL.revokeObjectURL(fileUrl)}
            />
            {mediaData.duration && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {formatDuration(mediaData.duration)}
              </div>
            )}
          </div>
        )

      case "audio":
        return (
          <Card className="p-4 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Music className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{mediaData.duration ? formatDuration(mediaData.duration) : "0:00"}</span>
                  <span>•</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
              </div>
            </div>
            <audio
              src={fileUrl}
              controls
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedData={() => URL.revokeObjectURL(fileUrl)}
            />
          </Card>
        )

      default:
        return (
          <Card className="p-4 w-full max-w-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">{getMediaIcon()}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
          </Card>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Send Media</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Preview Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-center mb-4">{renderPreview()}</div>
        </div>

        {/* Caption Input */}
        <div className="p-4 border-t">
          <div className="space-y-3">
            <Label htmlFor="caption">Add a caption (optional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Type a caption..."
              maxLength={200}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{caption.length}/200</span>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={() => onSend(caption.trim() || undefined)} className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
