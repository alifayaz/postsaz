// کتابخانه برای تولید تصویر و کپشن با Aval AI

interface AvalAIResponse {
  success: boolean
  data?: {
    url?: string
    image_url?: string
    caption?: string
    text?: string
  }
  error?: string
  message?: string
}

interface ImageGenerationOptions {
  prompt: string
  style?: "realistic" | "artistic" | "cartoon" | "abstract"
  size?: "512x512" | "768x768" | "1024x1024"
  quality?: "standard" | "hd"
}

interface CaptionGenerationOptions {
  topic: string
  style?: "casual" | "professional" | "creative" | "motivational"
  language?: "fa" | "en"
  length?: "short" | "medium" | "long"
}

// تبدیل URL به Base64
async function urlToBase64(url: string): Promise<string> {
  try {
    console.log("🔄 Converting URL to base64:", url)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    const mimeType = response.headers.get("content-type") || "image/png"

    const dataUrl = `data:${mimeType};base64,${base64}`
    console.log("✅ Successfully converted to base64, size:", Math.round(base64.length / 1024), "KB")

    return dataUrl
  } catch (error) {
    console.error("❌ Error converting URL to base64:", error)
    throw error
  }
}

// تولید تصویر
export async function generateImage(options: ImageGenerationOptions): Promise<string> {
  const apiKey = process.env.AVAL_AI_API_KEY

  if (!apiKey || apiKey.includes("your-")) {
    console.warn("⚠️ AVAL_AI_API_KEY is not properly configured")
    throw new Error("AVAL_AI_API_KEY is not configured")
  }

  try {
    console.log("🎨 Generating image with Aval AI...")
    console.log("📝 Prompt:", options.prompt)
    console.log("🎭 Style:", options.style || "realistic")

    const response = await fetch("https://api.avalai.ir/v1/images/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: options.prompt,
        style: options.style || "realistic",
        size: options.size || "1024x1024",
        quality: options.quality || "standard",
        response_format: "url",
      }),
    })

    console.log("📡 Aval AI response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Aval AI API error:", response.status, errorText)
      throw new Error(`Aval AI API error: ${response.status} - ${errorText}`)
    }

    const data: AvalAIResponse = await response.json()
    console.log("📦 Aval AI response:", data)

    if (!data.success || !data.data?.url) {
      throw new Error(data.error || data.message || "Failed to generate image")
    }

    const imageUrl = data.data.url
    console.log("🖼️ Generated image URL:", imageUrl)

    // تبدیل به base64 برای نمایش
    try {
      const base64Image = await urlToBase64(imageUrl)
      console.log("✅ Image converted to base64 successfully")
      return base64Image
    } catch (base64Error) {
      console.warn("⚠️ Failed to convert to base64, returning original URL:", base64Error)
      return imageUrl
    }
  } catch (error) {
    console.error("❌ Image generation failed:", error)
    throw new Error(`Image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// تولید کپشن
export async function generateCaption(options: CaptionGenerationOptions): Promise<string> {
  const apiKey = process.env.AVAL_AI_API_KEY

  if (!apiKey || apiKey.includes("your-")) {
    console.warn("⚠️ AVAL_AI_API_KEY is not properly configured")
    throw new Error("AVAL_AI_API_KEY is not configured")
  }

  try {
    console.log("✍️ Generating caption with Aval AI...")
    console.log("📝 Topic:", options.topic)
    console.log("🎭 Style:", options.style || "casual")

    const prompt = createCaptionPrompt(options)
    console.log("📝 Generated prompt:", prompt)

    const response = await fetch("https://api.avalai.ir/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "شما یک متخصص تولید محتوای شبکه‌های اجتماعی هستید که کپشن‌های جذاب و مؤثر برای اینستاگرام می‌نویسید.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    })

    console.log("📡 Aval AI response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Aval AI API error:", response.status, errorText)
      throw new Error(`Aval AI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("📦 Aval AI response:", data)

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from Aval AI")
    }

    const caption = data.choices[0].message.content.trim()
    console.log("✅ Generated caption:", caption.substring(0, 100) + "...")

    return caption
  } catch (error) {
    console.error("❌ Caption generation failed:", error)
    throw new Error(`Caption generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// ایجاد پرامپت برای تولید کپشن
function createCaptionPrompt(options: CaptionGenerationOptions): string {
  const { topic, style = "casual", language = "fa", length = "medium" } = options

  let prompt = ""

  if (language === "fa") {
    prompt = `یک کپشن ${getStyleDescription(style)} برای پست اینستاگرام با موضوع "${topic}" بنویس.`

    switch (length) {
      case "short":
        prompt += " کپشن باید کوتاه و مختصر باشد (حداکثر 2 خط)."
        break
      case "long":
        prompt += " کپشن باید کامل و جامع باشد (3-5 پاراگراف)."
        break
      default:
        prompt += " کپشن باید متوسط باشد (2-3 پاراگراف)."
    }

    prompt += " از هشتگ‌های مناسب و ایموجی‌های جذاب استفاده کن."
  } else {
    prompt = `Write a ${getStyleDescription(style)} Instagram caption about "${topic}".`

    switch (length) {
      case "short":
        prompt += " Keep it short and concise (max 2 lines)."
        break
      case "long":
        prompt += " Make it comprehensive and detailed (3-5 paragraphs)."
        break
      default:
        prompt += " Make it medium length (2-3 paragraphs)."
    }

    prompt += " Include relevant hashtags and engaging emojis."
  }

  return prompt
}

// توضیح سبک‌ها
function getStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    casual: "صمیمی و دوستانه",
    professional: "حرفه‌ای و رسمی",
    creative: "خلاقانه و هنری",
    motivational: "انگیزشی و الهام‌بخش",
  }

  return descriptions[style] || "صمیمی و دوستانه"
}

// تست اتصال API
export async function testAvalAI(): Promise<boolean> {
  const apiKey = process.env.AVAL_AI_API_KEY

  if (!apiKey || apiKey.includes("your-")) {
    console.warn("⚠️ AVAL_AI_API_KEY is not properly configured")
    return false
  }

  try {
    console.log("🔄 Testing Aval AI connection...")

    const response = await fetch("https://api.avalai.ir/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const success = response.ok
    console.log("📡 Aval AI test result:", success ? "✅ Success" : "❌ Failed")

    if (!success) {
      const errorText = await response.text()
      console.error("❌ Aval AI test error:", response.status, errorText)
    }

    return success
  } catch (error) {
    console.error("❌ Aval AI connection test failed:", error)
    return false
  }
}

// Export types
export type { ImageGenerationOptions, CaptionGenerationOptions, AvalAIResponse }
