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
        model: "gpt-4.1-mini",
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
