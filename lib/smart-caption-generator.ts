// سیستم هوشمند تولید کپشن که از چندین منبع استفاده می‌کند

import { generateCaption as generateAvalCaption } from "@/lib/aval-ai"
import { generateCaption as generateFallbackCaption } from "@/lib/fallback-caption-generator"

export interface CaptionRequest {
  topic: string
  style?: "casual" | "professional" | "creative" | "motivational"
  length?: "short" | "medium" | "long"
  includeHashtags?: boolean
  language?: "fa" | "en"
}

export interface CaptionResponse {
  caption: string
  hashtags?: string[]
  success: boolean
  error?: string
  source?: "huggingface" | "fallback" | "offline"
}

// تابع اصلی که بهترین منبع را انتخاب می‌کند
export async function generateSmartCaption(request: CaptionRequest): Promise<CaptionResponse> {
  console.log("Starting smart caption generation for:", request.topic)

  // مرحله 1: تلاش با Aval AI
  try {
    console.log("Trying Aval AI API...")
    const avalResult = await generateAvalCaption(request)

    if (avalResult.success && avalResult.caption && avalResult.caption.length > 20) {
      console.log("Aval AI API succeeded")
      return {
        ...avalResult,
        source: "aval" as any,
      }
    } else {
      console.log("Aval AI API failed or returned poor result:", avalResult.error)
    }
  } catch (error) {
    console.log("Aval AI API threw error:", error)
  }

  // مرحله 2: استفاده از سیستم پشتیبان
  console.log("Using fallback caption generator...")
  try {
    const fallbackResult = await generateFallbackCaption(request)

    if (fallbackResult.success) {
      console.log("Fallback caption generator succeeded")
      return {
        ...fallbackResult,
        source: "fallback",
        error: "API در دسترس نبود، از سیستم پشتیبان استفاده شد",
      }
    }
  } catch (error) {
    console.log("Fallback caption generator failed:", error)
  }

  // مرحله 3: کپشن‌های از پیش تعریف شده (آخرین راه‌حل)
  console.log("Using predefined captions as last resort...")
  const predefinedCaptions = getPredefinedCaptions(request.topic)
  const randomCaption = predefinedCaptions[Math.floor(Math.random() * predefinedCaptions.length)]

  return {
    caption: randomCaption.caption,
    hashtags: randomCaption.hashtags,
    success: true,
    source: "offline",
    error: "همه سیستم‌ها ناموفق، از کپشن از پیش تعریف شده استفاده شد",
  }
}

// کپشن‌های از پیش تعریف شده برای موارد اضطراری
function getPredefinedCaptions(topic: string): Array<{ caption: string; hashtags: string[] }> {
  const baseCaptions = [
    {
      caption:
        "✨ لحظه‌ای خاص را با شما به اشتراک می‌گذارم\n\n🌟 هر روز فرصتی جدید برای خلق خاطرات زیباست\n💫 زندگی در جزئیات کوچک نهفته است\n\nشما چه تجربه‌ای امروز داشتید؟ 💭",
      hashtags: ["#زندگی", "#لحظات_خاص", "#خاطرات", "#تجربه", "#شادی"],
    },
    {
      caption:
        "🌈 رنگارنگی زندگی در تنوع تجربه‌هاست\n\n✨ هر لحظه، فرصتی برای یادگیری\n🌟 هر روز، شانسی برای رشد\n💫 هر تجربه، پلی به سوی آینده بهتر\n\nامروز چه چیز جدیدی یاد گرفتید؟ 🤔",
      hashtags: ["#یادگیری", "#رشد", "#تجربه", "#زندگی", "#پیشرفت"],
    },
    {
      caption:
        "💪 هر روز فرصتی جدید برای شروع است\n\n🎯 هدف‌هایتان را مشخص کنید\n✨ به توانایی‌هایتان باور داشته باشید\n🚀 قدم به قدم به سمت موفقیت حرکت کنید\n\nبزرگترین هدف شما چیست؟ 💭",
      hashtags: ["#انگیزه", "#موفقیت", "#هدف", "#پیشرفت", "#باور"],
    },
  ]

  // اگر موضوع خاصی داده شده، سعی کن کپشن مرتبط ایجاد کن
  if (topic) {
    const topicCaption = {
      caption: `✨ ${topic} - تجربه‌ای که ارزش به اشتراک گذاشتن دارد\n\n🌟 هر تجربه جدید، فرصتی برای رشد\n💫 هر لحظه، یادگیری جدید\n🌈 زندگی در تنوع و تجربه زیباست\n\nنظر شما درباره ${topic} چیست؟ 💭`,
      hashtags: ["#تجربه", "#یادگیری", "#زندگی", "#اشتراک_گذاری", `#${topic.replace(/\s+/g, "_")}`],
    }
    return [topicCaption, ...baseCaptions]
  }

  return baseCaptions
}

// تابع کمکی برای بررسی وضعیت API ها
export async function checkAPIStatus(): Promise<{
  huggingface: boolean
  fallback: boolean
}> {
  const status = {
    huggingface: false,
    fallback: true, // سیستم پشتیبان همیشه در دسترس است
  }

  // بررسی Aval AI
  try {
    const testResult = await generateAvalCaption({
      topic: "تست",
      style: "casual",
      length: "short",
      includeHashtags: false,
    })
    status.huggingface = testResult.success
  } catch (error) {
    console.log("Aval AI API test failed:", error)
  }

  return status
}
