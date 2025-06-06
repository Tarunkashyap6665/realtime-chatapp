export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
  thumbnailUrl?: string;
}

export const ALLOWED_FILE_TYPES = {
  image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  audio: ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg", "audio/m4a"],
  video: [
    "video/mp4",
    "video/webm",
    "video/mov",
    "video/avi",
    "video/quicktime",
  ],
  file: [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function getFileType(
  mimeType: string
): "image" | "audio" | "video" | "file" {
  if (ALLOWED_FILE_TYPES.image.includes(mimeType)) return "image";
  if (ALLOWED_FILE_TYPES.audio.includes(mimeType)) return "audio";
  if (ALLOWED_FILE_TYPES.video.includes(mimeType)) return "video";
  return "file";
}

export function isFileTypeAllowed(mimeType: string): boolean {
  return Object.values(ALLOWED_FILE_TYPES).some((types) =>
    types.includes(mimeType)
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  // Validate file type
  if (!isFileTypeAllowed(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Upload failed" }));
    throw new Error(errorData.error || "Upload failed");
  }

  return response.json();
}

export function createThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("video/")) {
      reject(new Error("Not a video file"));
      return;
    }

    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.onloadedmetadata = () => {
      canvas.width = 320;
      canvas.height = (video.videoHeight / video.videoWidth) * 320;
      video.currentTime = 1; // Seek to 1 second
    };

    video.onseeked = () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      }
    };

    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");

    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };

    audio.onerror = reject;
    audio.src = URL.createObjectURL(file);
  });
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    video.onloadedmetadata = () => {
      resolve(video.duration);
    };

    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}
