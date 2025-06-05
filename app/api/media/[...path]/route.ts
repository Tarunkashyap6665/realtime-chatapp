import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Optional: Add authentication for media access
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (token) {
      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const filePath = params.path.join("/")
    const fullPath = join(process.cwd(), "public", "uploads", filePath)

    try {
      const fileBuffer = await readFile(fullPath)

      // Determine content type based on file extension
      const extension = filePath.split(".").pop()?.toLowerCase()
      let contentType = "application/octet-stream"

      switch (extension) {
        case "jpg":
        case "jpeg":
          contentType = "image/jpeg"
          break
        case "png":
          contentType = "image/png"
          break
        case "gif":
          contentType = "image/gif"
          break
        case "webp":
          contentType = "image/webp"
          break
        case "mp4":
          contentType = "video/mp4"
          break
        case "webm":
          contentType = "video/webm"
          break
        case "mp3":
          contentType = "audio/mpeg"
          break
        case "wav":
          contentType = "audio/wav"
          break
        case "ogg":
          contentType = "audio/ogg"
          break
        case "pdf":
          contentType = "application/pdf"
          break
      }

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    } catch (fileError) {
      console.error("File not found:", fullPath)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Media retrieval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
