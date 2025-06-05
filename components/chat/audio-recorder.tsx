"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Send, Pause, Play, Trash2 } from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { formatDuration } from "@/lib/file-upload";

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export default function AudioRecorder({
  onSendAudio,
  onCancel,
  disabled,
}: AudioRecorderProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    clearRecording,
  } = useAudioRecorder();

  // Handle mouse/touch events for press and hold
  const handlePressStart = () => {
    if (disabled) return;

    setIsPressed(true);
    setPressStartTime(Date.now());

    // Start long press timer (2 seconds)
    longPressTimerRef.current = setTimeout(() => {
      setShowRecordingUI(true);
      startRecording();
    }, 1000);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    setPressStartTime(null);

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If recording was started, stop it
    if (isRecording) {
      stopRecording();
    }
  };

  // Handle sending the recorded audio
  useEffect(() => {
    if (audioBlob && !isRecording && recordingTime > 0) {
      onSendAudio(audioBlob, recordingTime);
      clearRecording();
      setShowRecordingUI(false);
    }
  }, [audioBlob, isRecording, recordingTime, onSendAudio, clearRecording]);

  // Handle canceling recording
  const handleCancel = () => {
    cancelRecording();
    setShowRecordingUI(false);
    if (onCancel) {
      onCancel();
    }
  };

  // Calculate press progress (0-100)
  const pressProgress = pressStartTime
    ? Math.min(((Date.now() - pressStartTime) / 1000) * 100, 100)
    : 0;

  // Recording UI
  if (showRecordingUI) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <Card className="p-6 w-full max-w-md">
          <div className="text-center space-y-4">
            {/* Recording Status */}
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                className="w-4 h-4 bg-red-500 rounded-full"
              />
              <span className="text-lg font-medium">
                {isPaused ? "Recording Paused" : "Recording..."}
              </span>
            </div>

            {/* Timer */}
            <div className="text-3xl font-mono font-bold text-blue-600">
              {formatDuration(recordingTime)}
            </div>

            {/* Waveform Animation */}
            <div className="flex items-center justify-center space-x-1 h-12">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isRecording && !isPaused ? [8, 32, 8] : 8,
                  }}
                  transition={{
                    duration: 0.5 + i * 0.1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="w-1 bg-blue-500 rounded-full"
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Cancel</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="flex items-center space-x-2"
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </Button>

              <Button
                onClick={stopRecording}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* Instructions */}
            <p className="text-xs text-gray-500">
              Tap Send to send the recording, or Cancel to discard it.
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Microphone button with press feedback
  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          size="sm"
          disabled={disabled}
          className={`p-2 relative overflow-hidden rounded-full aspect-square active:bg-white active:border-2 active:border-blue-600 ${
            isPressed ? "bg-blue-100" : ""
          }`}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
        >
          <Mic className={`w-4 h-4  ${isPressed ? "text-blue-600" : ""}`} />

          {/* Press Progress Indicator */}
          {isPressed && (
            <motion.div
              className="absolute inset-0 bg-blue-200 opacity-30"
              initial={{ scale: 0 }}
              animate={{ scale: pressProgress / 100 }}
              style={{ borderRadius: "50%" }}
            />
          )}
        </Button>
      </motion.div>

      {/* Press and Hold Instruction */}
      <AnimatePresence>
        {isPressed && !showRecordingUI && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 z-50"
          >
            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Hold for 1 seconds to record
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && !showRecordingUI && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 z-50"
          >
            <div className="bg-red-600 text-white text-xs px-2 py-1 rounded w-52 max-w-52 text-center">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
