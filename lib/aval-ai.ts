const AVAL_AI_API_KEY = process.env.AVAL_AI_API_KEY || "aa-zKzABN9gxN6BA5hw7pnGJM14Q5tHOkUiPCbg8WCaurt2kmlr"
const AVAL_AI_BASE_URL = "https://api.avalai.ir/v1"

export interface CaptionRequest {
  topic: string
  style?: "casual" | "professional" | "creative" | "motivational"
  length?: "short" | "medium" | "long"
  includeHashtags?: boolean
  language?: string
}

export interface CaptionResponse {
  caption: string
  hashtags?: string[]
  success: boolean
  error?: string
}

export interface ImageRequest {
  prompt: string
  style?: "realistic" | "artistic" | "cartoon" | "abstract"
  size?: "1024x1024" | "512x512" | "256x256"
}

export interface ImageResponse {
  imageUrl: string
  success: boolean
  error?: string
}

export async function generateCaption(request: CaptionRequest): Promise<CaptionResponse> {
  try {
    const prompt = createPrompt(request)

    console.log("Sending request to Aval AI...", { prompt })

    const response = await fetch(`${AVAL_AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AVAL_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "شما یک متخصص تولید محتوای اینستاگرام هستید که کپشن‌های جذاب و خلاقانه به زبان فارسی می‌نویسید.",
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

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error:", errorText)

      if (response.status === 429) {
        throw new Error("محدودیت تعداد درخواست‌ها. لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید.")
      } else if (response.status === 401) {
        throw new Error("کلید API نامعتبر است")
      } else if (response.status === 403) {
        throw new Error("دسترسی مجاز نیست")
      } else {
        throw new Error(`خطای سرور: ${response.status}`)
      }
    }

    const data = await response.json()
    console.log("API Response:", data)

    const generatedText = data.choices?.[0]?.message?.content || ""

    if (!generatedText) {
      throw new Error("پاسخ خالی از سرور دریافت شد")
    }

    // جداسازی کپشن و هشتگ‌ها
    const parts = generatedText.split("#")
    const caption = parts[0].trim()
    const hashtags = parts
        .slice(1)
        .map((tag:any) => "#" + tag.trim())
        .filter((tag:any) => tag.length > 1)

    return {
      caption,
      hashtags,
      success: true,
    }
  } catch (error) {
    console.error("Error generating caption:", error)
    return {
      caption: "",
      success: false,
      error: error instanceof Error ? error.message : "خطای غیرمنتظره",
    }
  }
}

export async function generateImage(request: ImageRequest): Promise<ImageResponse> {
  try {
    const enhancedPrompt = createImagePrompt(request.prompt, request.style)

    console.log("🖼️ Sending image generation request to Aval AI...")
    console.log("📝 Enhanced prompt:", enhancedPrompt)
    console.log("🎨 Style:", request.style)
    console.log("📏 Size:", request.size)

    const response = await fetch(`${AVAL_AI_BASE_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AVAL_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: request.size || "1024x1024",
        quality: "standard",
        response_format: "url",
      }),
    })

    console.log("📡 Image generation response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Image API Error:", errorText)

      if (response.status === 429) {
        throw new Error("محدودیت تعداد درخواست‌ها. لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید.")
      } else if (response.status === 401) {
        throw new Error("کلید API نامعتبر است")
      } else if (response.status === 403) {
        throw new Error("دسترسی مجاز نیست")
      } else {
        throw new Error(`خطای سرور: ${response.status}`)
      }
    }

    const data = await response.json()
    console.log("📡 Full Image API Response:", JSON.stringify(data, null, 2))

    // بررسی ساختارهای مختلف پاسخ
    let imageUrl = ""

    // حالت اول: OpenAI standard format
    if (data.data && Array.isArray(data.data) && data.data[0]?.url) {
      imageUrl = data.data[0].url
      console.log("✅ Found image URL in data.data[0].url:", imageUrl)
    }
    // حالت دوم: Direct URL in response
    else if (data.url) {
      imageUrl = data.url
      console.log("✅ Found image URL in data.url:", imageUrl)
    }
    // حالت سوم: Image field
    else if (data.image) {
      imageUrl = data.image
      console.log("✅ Found image URL in data.image:", imageUrl)
    }
    // حالت چهارم: Result field
    else if (data.result) {
      imageUrl = data.result
      console.log("✅ Found image URL in data.result:", imageUrl)
    }
    // حالت پنجم: Images array
    else if (data.images && Array.isArray(data.images) && data.images[0]) {
      imageUrl = data.images[0]
      console.log("✅ Found image URL in data.images[0]:", imageUrl)
    }

    console.log("🔍 Final extracted imageUrl:", imageUrl)

    if (!imageUrl) {
      console.error("❌ No image URL found in response")
      console.error("📋 Available keys in response:", Object.keys(data))
      throw new Error("تصویر تولید نشد - URL یافت نشد")
    }

    // بررسی معتبر بودن URL
    if (!imageUrl.startsWith("http")) {
      console.error("❌ Invalid URL format:", imageUrl)
      throw new Error("فرمت URL تصویر نامعتبر است")
    }

    console.log("🔄 Attempting to download and convert image to base64...")

    // تلاش برای دانلود و تبدیل تصویر به base64
    try {
      const imageResponse = await fetch(imageUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "image/*",
        },
      })

      console.log("📡 Image download response status:", imageResponse.status)

      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob()
        console.log("✅ Image downloaded successfully, size:", imageBlob.size)

        // تبدیل blob به base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(imageBlob)
        })

        console.log("✅ Image converted to base64 successfully")
        console.log("📏 Base64 length:", base64.length)

        return {
          imageUrl: base64,
          success: true,
        }
      } else {
        console.warn("⚠️ Direct download failed, returning original URL")
        return {
          imageUrl,
          success: true,
        }
      }
    } catch (downloadError) {
      console.warn("⚠️ Download failed, returning original URL:", downloadError)
      return {
        imageUrl,
        success: true,
      }
    }
  } catch (error) {
    console.error("❌ Error generating image:", error)
    return {
      imageUrl: "",
      success: false,
      error: error instanceof Error ? error.message : "خطای غیرمنتظره در تولید تصویر",
    }
  }
}

function createPrompt(request: CaptionRequest): string {
  const { topic, style = "casual", length = "medium", includeHashtags = true } = request

  const styleDescriptions = {
    casual: "صمیمی و دوستانه",
    professional: "حرفه‌ای و رسمی",
    creative: "خلاقانه و هنری",
    motivational: "انگیزشی و الهام‌بخش",
  }

  const lengthDescriptions = {
    short: "کوتاه (حداکثر ۵۰ کلمه)",
    medium: "متوسط (۵۰ تا ۱۰۰ کلمه)",
    long: "بلند (۱۰۰ تا ۱۵۰ کلمه)",
  }

  let prompt = `یک کپشن ${styleDescriptions[style]} و ${lengthDescriptions[length]} برای پست اینستاگرام با موضوع "${topic}" بنویسید.`

  prompt += `\n\nویژگی‌های مورد نظر:`
  prompt += `\n- زبان: فارسی`
  prompt += `\n- سبک: ${styleDescriptions[style]}`
  prompt += `\n- طول: ${lengthDescriptions[length]}`
  prompt += `\n- استفاده از ایموجی مناسب`
  prompt += `\n- جذاب و قابل تعامل`

  if (includeHashtags) {
    prompt += `\n- شامل ۵ تا ۱۰ هشتگ مرتبط در انتهای کپشن`
  }

  prompt += `\n\nلطفاً کپشن را به صورت طبیعی و جذاب بنویسید که مخاطبان را تشویق به تعامل کند.`

  return prompt
}

function createImagePrompt(userPrompt: string, style?: string): string {
  const stylePrompts = {
    realistic: "photorealistic, high quality, detailed, professional photography",
    artistic: "artistic, creative, beautiful composition, aesthetic",
    cartoon: "cartoon style, colorful, fun, animated style",
    abstract: "abstract art, creative, modern, artistic interpretation",
  }

  const basePrompt = `Create a high-quality image for Instagram post: ${userPrompt}`
  const styleAddition =
      style && stylePrompts[style as keyof typeof stylePrompts]
          ? `, ${stylePrompts[style as keyof typeof stylePrompts]}`
          : ", high quality, Instagram-ready, visually appealing"

  return `${basePrompt}${styleAddition}, square aspect ratio, vibrant colors, social media optimized`
}

// تابع کمکی برای دریافت موضوعات پیشنهادی
export function getTopicSuggestions(category: string): string[] {
  const suggestions: Record<string, string[]> = {
    business: ["معرفی محصول جدید", "تخفیف ویژه", "خدمات شرکت", "موفقیت تیم"],
    lifestyle: ["روتین صبحگاهی", "نکات سلامتی", "تعادل کار و زندگی", "سفر و تفریح"],
    food: ["دستور پخت", "رستوران جدید", "غذای سالم", "شیرینی خانگی"],
    fashion: ["استایل روز", "ترکیب رنگ‌ها", "مد فصل", "اکسسوری‌های جدید"],
    tech: ["گجت جدید", "اپلیکیشن کاربردی", "نکات فناوری", "آینده تکنولوژی"],
    art: ["نقاشی جدید", "الهام هنری", "تکنیک‌های نقاشی", "هنرمندان مشهور"],
    travel: ["مقصد گردشگری", "تجربه سفر", "نکات سفر", "فرهنگ محلی"],
  }

  return suggestions[category] || ["موضوع عمومی", "تجربه شخصی", "نکات کاربردی"]
}

// پیشنهادات تولید تصویر
export function getImagePromptSuggestions(topic: string): string[] {
  const suggestions: Record<string, string[]> = {
    sale: ["محصولات زیبا روی میز چوبی با نور طبیعی", "فروشگاه مدرن با محصولات رنگارنگ", "تخفیف و برچسب قیمت جذاب"],
    food: ["غذای خوشمزه روی بشقاب زیبا", "آشپزخانه مدرن با مواد غذایی تازه", "میز شام رومانتیک با شمع"],
    lifestyle: ["فضای آرام و مینیمال برای مدیتیشن", "صبحانه سالم روی تخت", "ورزش در طبیعت زیبا"],
    travel: ["منظره زیبای طبیعی با آسمان آبی", "شهر قدیمی با معماری سنتی", "ساحل آرام با آب شفاف"],
    fashion: ["لباس‌های شیک روی آویز", "اکسسوری‌های زیبا روی میز مرمری", "استایل خیابانی مدرن"],
  }

  return suggestions[topic] || ["تصویر زیبا و الهام‌بخش", "طراحی مدرن و رنگارنگ", "فضای خلاقانه و هنری"]
}

// تابع fallback برای زمانی که API کار نمی‌کند
export function getFallbackCaption(topicId: string): string {
  const fallbackCaptions: Record<string, string[]> = {
    sale: [
      "🔥 فرصت طلایی! تخفیف ویژه فقط امروز\n\n✨ کیفیت بالا، قیمت باورنکردنی\n💯 رضایت ۱۰۰٪ تضمینی\n\n#تخفیف #فروش_ویژه #کیفیت",
    ],
    motivational: [
      "💪 هر روز فرصتی جدید برای شروع است\n\n✨ باور داشته باش، تلاش کن، موفق شو\n🎯 هدفت را مشخص کن و به سمتش حرکت کن\n\n#انگیزه #موفقیت #تلاش",
    ],
    lifestyle: [
      "✨ زندگی زیبا در جزئیات نهفته است\n\n🌸 لحظات کوچک را جشن بگیرید\n☕ صبح‌های آرام، شب‌های دنج\n💫 خوشحالی در سادگی\n\n#سبک_زندگی #شادی #آرامش",
    ],
    default: [
      "✨ لحظه‌ای خاص را با شما به اشتراک می‌گذارم\n\n🌟 هر روز فرصتی جدید برای خلق خاطرات زیباست\n💫 زندگی در جزئیات کوچک نهفته است\n\n#زندگی #لحظات_خاص #خاطرات",
    ],
  }

  const captions = fallbackCaptions[topicId] || fallbackCaptions.default
  return captions[Math.floor(Math.random() * captions.length)]
}
