const AVAL_AI_API_KEY = process.env.AVAL_AI_API_KEY || "aa-zKzABN9gxN6BA5hw7pnGJM14Q5tHOkUiPCbg8WCaurt2kmlr"
const AVAL_AI_BASE_URL = "https://api.avalapis.ir/v1"

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
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
                request.language === "en"
                    ? "You are an expert Instagram content creator who writes engaging and creative captions in English."
                    : "شما یک متخصص تولید محتوای اینستاگرام هستید که کپشن‌های جذاب و خلاقانه به زبان فارسی می‌نویسید.",
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

      const errorMessages = {
        fa: {
          429: "محدودیت تعداد درخواست‌ها. لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید.",
          401: "کلید API نامعتبر است",
          403: "دسترسی مجاز نیست",
          default: "خطای سرور",
        },
        en: {
          429: "Rate limit exceeded. Please wait a few minutes and try again.",
          401: "Invalid API key",
          403: "Access denied",
          default: "Server error",
        },
      }

      const lang = request.language || "fa"
      const messages = errorMessages[lang]

      if (response.status === 429) {
        throw new Error(messages[429])
      } else if (response.status === 401) {
        throw new Error(messages[401])
      } else if (response.status === 403) {
        throw new Error(messages[403])
      } else {
        throw new Error(`${messages.default}: ${response.status}`)
      }
    }

    const data = await response.json()
    console.log("API Response:", data)

    const generatedText = data.choices?.[0]?.message?.content || ""

    if (!generatedText) {
      const emptyResponseMessage =
          request.language === "en" ? "Empty response received from server" : "پاسخ خالی از سرور دریافت شد"
      throw new Error(emptyResponseMessage)
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
    const unexpectedErrorMessage = request.language === "en" ? "Unexpected error occurred" : "خطای غیرمنتظره"

    return {
      caption: "",
      success: false,
      error: error instanceof Error ? error.message : unexpectedErrorMessage,
    }
  }
}

function createPrompt(request: CaptionRequest): string {
  const { topic, style = "casual", length = "medium", includeHashtags = true, language = "fa" } = request

  if (language === "en") {
    const styleDescriptions = {
      casual: "casual and friendly",
      professional: "professional and formal",
      creative: "creative and artistic",
      motivational: "motivational and inspiring",
    }

    const lengthDescriptions = {
      short: "short (maximum 50 words)",
      medium: "medium (50 to 100 words)",
      long: "long (100 to 150 words)",
    }

    let prompt = `Write a ${styleDescriptions[style]} and ${lengthDescriptions[length]} Instagram caption about "${topic}".`

    prompt += `\n\nRequired features:`
    prompt += `\n- Language: English`
    prompt += `\n- Style: ${styleDescriptions[style]}`
    prompt += `\n- Length: ${lengthDescriptions[length]}`
    prompt += `\n- Use appropriate emojis`
    prompt += `\n- Engaging and interactive`

    if (includeHashtags) {
      prompt += `\n- Include 5 to 10 relevant hashtags at the end of the caption`
    }

    prompt += `\n\nPlease write the caption naturally and engagingly to encourage audience interaction.`

    return prompt
  } else {
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
}

// تابع کمکی برای دریافت موضوعات پیشنهادی
export function getTopicSuggestions(category: string, language: "fa" | "en" = "fa"): string[] {
  if (language === "en") {
    const suggestions: Record<string, string[]> = {
      business: ["New Product Launch", "Special Discount", "Company Services", "Team Success"],
      lifestyle: ["Morning Routine", "Health Tips", "Work-Life Balance", "Travel & Fun"],
      food: ["Recipe Tutorial", "New Restaurant", "Healthy Food", "Homemade Dessert"],
      fashion: ["Daily Style", "Color Combinations", "Seasonal Fashion", "New Accessories"],
      tech: ["New Gadget", "Useful App", "Tech Tips", "Future Technology"],
      art: ["New Painting", "Artistic Inspiration", "Painting Techniques", "Famous Artists"],
      travel: ["Tourist Destination", "Travel Experience", "Travel Tips", "Local Culture"],
    }
    return suggestions[category] || ["General Topic", "Personal Experience", "Useful Tips"]
  } else {
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
}

// تابع fallback برای زمانی که API کار نمی‌کند
export function getFallbackCaption(topicId: string, language: "fa" | "en" = "fa"): string {
  if (language === "en") {
    const fallbackCaptions: Record<string, string[]> = {
      sale: [
        "🔥 Golden opportunity! Special discount today only\n\n✨ High quality, unbelievable price\n💯 100% satisfaction guaranteed\n\n#discount #specialsale #quality",
      ],
      motivational: [
        "💪 Every day is a new opportunity to start\n\n✨ Believe, try, succeed\n🎯 Set your goal and move towards it\n\n#motivation #success #effort",
      ],
      lifestyle: [
        "✨ Beautiful life lies in the details\n\n🌸 Celebrate small moments\n☕ Calm mornings, cozy nights\n💫 Happiness in simplicity\n\n#lifestyle #happiness #peace",
      ],
      default: [
        "✨ Sharing a special moment with you\n\n🌟 Every day is a new opportunity to create beautiful memories\n💫 Life lies in small details\n\n#life #specialmoments #memories",
      ],
    }
    const captions = fallbackCaptions[topicId] || fallbackCaptions.default
    return captions[Math.floor(Math.random() * captions.length)]
  } else {
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
}
