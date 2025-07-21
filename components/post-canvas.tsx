"use client"

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react"

interface PostCanvasProps {
  template: string
  topic: string
  caption: string
  imageUrl?: string
}

export interface PostCanvasRef {
  downloadImage: () => void
  getCanvas: () => HTMLCanvasElement | null
}

export const PostCanvas = forwardRef<PostCanvasRef, PostCanvasProps>(({ template, topic, caption, imageUrl }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => ({
    downloadImage: () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const link = document.createElement("a")
      link.download = `post-${Date.now()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    },
    getCanvas: () => canvasRef.current,
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // تنظیم اندازه canvas برای اینستاگرام (1080x1350)
    canvas.width = 1080
    canvas.height = 1350

    // پاک کردن canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // رسم پس‌زمینه
    drawBackground(ctx, template, canvas.width, canvas.height)

    // رسم تصویر اگر موجود باشد
    if (imageUrl) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // رسم تصویر در قسمت بالایی (1080x1080)
        const imageSize = 1080
        const aspectRatio = img.width / img.height
        let drawWidth = imageSize
        let drawHeight = imageSize
        let offsetX = 0
        let offsetY = 0

        if (aspectRatio > 1) {
          // تصویر عرضی
          drawHeight = imageSize / aspectRatio
          offsetY = (imageSize - drawHeight) / 2
        } else if (aspectRatio < 1) {
          // تصویر طولی
          drawWidth = imageSize * aspectRatio
          offsetX = (imageSize - drawWidth) / 2
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

        // رسم کپشن در قسمت پایینی
        drawCaption(ctx, caption, canvas.width, canvas.height)

        // اضافه کردن watermark
        addWatermark(ctx, canvas.width, canvas.height)
      }
      img.onerror = () => {
        console.error("Error loading image")
        // در صورت خطا، فقط پس‌زمینه و کپشن
        drawCaption(ctx, caption, canvas.width, canvas.height)
        addWatermark(ctx, canvas.width, canvas.height)
      }
      img.src = imageUrl
    } else {
      // اگر تصویری نیست، فقط پس‌زمینه و کپشن
      drawPlaceholder(ctx, template, topic, 1080)
      drawCaption(ctx, caption, canvas.width, canvas.height)
      addWatermark(ctx, canvas.width, canvas.height)
    }
  }, [template, topic, caption, imageUrl])

  return (
      <div className="w-full h-full flex items-center justify-center">
        <canvas
            ref={canvasRef}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ aspectRatio: "1080/1350" }}
        />
      </div>
  )
})

PostCanvas.displayName = "PostCanvas"

function drawBackground(ctx: CanvasRenderingContext2D, template: string, width: number, height: number) {
  // پس‌زمینه سفید برای کل canvas
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, width, height)

  // پس‌زمینه قالب فقط برای قسمت تصویر (1080x1080)
  switch (template) {
    case "modern":
      const modernGradient = ctx.createLinearGradient(0, 0, width, 1080)
      modernGradient.addColorStop(0, "#3B82F6") // blue-500
      modernGradient.addColorStop(1, "#8B5CF6") // purple-500
      ctx.fillStyle = modernGradient
      break

    case "minimal":
      const minimalGradient = ctx.createLinearGradient(0, 0, width, 1080)
      minimalGradient.addColorStop(0, "#F3F4F6") // gray-100
      minimalGradient.addColorStop(1, "#E5E7EB") // gray-200
      ctx.fillStyle = minimalGradient
      break

    case "colorful":
      const colorfulGradient = ctx.createLinearGradient(0, 0, width, 1080)
      colorfulGradient.addColorStop(0, "#FB923C") // orange-400
      colorfulGradient.addColorStop(1, "#EC4899") // pink-500
      ctx.fillStyle = colorfulGradient
      break

    case "elegant":
      const elegantGradient = ctx.createLinearGradient(0, 0, width, 1080)
      elegantGradient.addColorStop(0, "#1F2937") // gray-800
      elegantGradient.addColorStop(1, "#374151") // gray-700
      ctx.fillStyle = elegantGradient
      break

    case "bold":
      const boldGradient = ctx.createLinearGradient(0, 0, width, 1080)
      boldGradient.addColorStop(0, "#DC2626") // red-600
      boldGradient.addColorStop(1, "#7C2D12") // orange-900
      ctx.fillStyle = boldGradient
      break

    case "nature":
      const natureGradient = ctx.createLinearGradient(0, 0, width, 1080)
      natureGradient.addColorStop(0, "#059669") // emerald-600
      natureGradient.addColorStop(1, "#065F46") // emerald-800
      ctx.fillStyle = natureGradient
      break

    default:
      ctx.fillStyle = "#F8F9FA"
  }

  // رسم پس‌زمینه قالب فقط در قسمت تصویر
  ctx.fillRect(0, 0, width, 1080)
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, template: string, topic: string, size: number) {
  // اگر تصویری نیست، placeholder نمایش دهید
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
  ctx.fillRect(size / 2 - 200, size / 2 - 100, 400, 200)

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
  ctx.font = "bold 48px Arial"
  ctx.textAlign = "center"
  ctx.fillText("پُست‌ساز", size / 2, size / 2 - 20)

  if (topic) {
    ctx.font = "32px Arial"
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.fillText(topic, size / 2, size / 2 + 40)
  }
}

function drawCaption(ctx: CanvasRenderingContext2D, caption: string, width: number, height: number) {
  if (!caption) return

  const captionArea = {
    x: 40,
    y: 1120, // شروع از پایین تصویر
    width: width - 80,
    height: height - 1120 - 40,
  }

  // پس‌زمینه سفید برای کپشن
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 1080, width, height - 1080)

  // تنظیم فونت برای کپشن
  ctx.fillStyle = "#1F2937" // gray-800
  ctx.font = "28px Arial"
  ctx.textAlign = "right"
  ctx.direction = "rtl"

  // تقسیم کپشن به خطوط
  const lines = wrapText(ctx, caption, captionArea.width)
  const lineHeight = 40
  let currentY = captionArea.y + 40

  // رسم هر خط
  lines.forEach((line) => {
    if (currentY + lineHeight <= captionArea.y + captionArea.height - 60) {
      // بررسی اینکه آیا خط هشتگ است یا نه
      if (line.trim().startsWith("#")) {
        ctx.fillStyle = "#3B82F6" // آبی برای هشتگ‌ها
        ctx.font = "24px Arial"
      } else {
        ctx.fillStyle = "#1F2937" // خاکستری تیره برای متن عادی
        ctx.font = "28px Arial"
      }

      ctx.fillText(line, captionArea.x + captionArea.width - 20, currentY)
      currentY += lineHeight
    }
  })
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  const paragraphs = text.split("\n")

  paragraphs.forEach((paragraph) => {
    if (paragraph.trim() === "") {
      lines.push("")
      return
    }

    const words = paragraph.split(" ")
    let currentLine = ""

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? " " : "") + word
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }
  })

  return lines
}

function addWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Watermark در گوشه پایین راست
  ctx.fillStyle = "rgba(107, 114, 128, 0.6)" // gray-500 with opacity
  ctx.font = "18px Arial"
  ctx.textAlign = "left"
  ctx.fillText("ساخته شده با پُست‌ساز", 40, height - 20)
}
