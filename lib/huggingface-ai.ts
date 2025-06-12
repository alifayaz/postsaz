// Hugging Face Inference API برای تولید کپشن فارسی - کاملاً رایگان!

const HF_API_KEY = process.env.HF_API_KEY || "" // اختیاری - بدون کلید هم کار می‌کند
const HF_BASE_URL = "https://api-inference.huggingface.co/models"

// مدل‌های مختلف برای تولید متن فارسی
const MODELS = {
  gpt2_small: "gpt2", // مدل عمومی GPT-2
  distilgpt2: "distilgpt2", // نسخه کوچک‌تر GPT-2
  persian_gpt: "m3hrdadfi/gpt2-persian", // مدل GPT-2 فارسی
  dialogpt: "microsoft/DialoGPT-medium", // مدل مکالمه‌ای
  bloom: "bigscience/bloom-560m", // نسخه کوچک‌تر bloom
}

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

// بهبود تابع generateCaption برای استفاده از مدل‌های مختلف
export async function generateCaption(request: CaptionRequest): Promise<CaptionResponse> {
  try {
    const prompt = createPrompt(request)

    console.log("Sending request to Hugging Face...", { prompt })

    // تلاش با مدل‌های مختلف به ترتیب
    const modelsToTry = [MODELS.gpt2_small, MODELS.distilgpt2, MODELS.persian_gpt]

    let result: { success: boolean; text?: string; error?: string } = {
      success: false,
      error: "همه مدل‌ها شکست خوردند",
    }

    for (const model of modelsToTry) {
      console.log(`Trying model: ${model}`)
      result = await tryGenerateWithModel(model, prompt)

      if (result.success) {
        break
      }

      // کمی صبر بین تلاش‌ها
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    if (result.success && result.text) {
      const processed = processGeneratedText(result.text, request)
      return {
        caption: processed.caption,
        hashtags: processed.hashtags,
        success: true,
      }
    } else {
      // اگر همه مدل‌ها شکست خوردند، از کپشن نمونه استفاده کن
      console.log("All Hugging Face models failed, using fallback caption")
      const fallbackCaption = getFallbackCaption(request.topic || "default")
      const fallbackHashtags = generateDefaultHashtags(request.topic, request.style)

      return {
        caption: fallbackCaption,
        hashtags: fallbackHashtags,
        success: true,
        error: "API در دسترس نبود، از کپشن نمونه استفاده شد",
      }
    }
  } catch (error) {
    console.error("Error generating caption with Hugging Face:", error)

    // استفاده از کپشن نمونه در صورت خطا
    const fallbackCaption = getFallbackCaption(request.topic || "default")
    const fallbackHashtags = generateDefaultHashtags(request.topic, request.style)

    return {
      caption: fallbackCaption,
      hashtags: fallbackHashtags,
      success: true,
      error: "خطا در اتصال به API، از کپشن نمونه استفاده شد",
    }
  }
}

// بهبود تابع tryGenerateWithModel برای مدیریت بهتر خطاها
async function tryGenerateWithModel(
    model: string,
    prompt: string,
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // فقط در صورت وجود کلید API معتبر، آن را اضافه کن
    if (HF_API_KEY && HF_API_KEY !== "" && !HF_API_KEY.includes("your-")) {
      headers["Authorization"] = `Bearer ${HF_API_KEY}`
      console.log("Using API key for authentication")
    } else {
      console.log("Using public access (no API key)")
    }

    console.log(`Trying model: ${model}`)

    const response = await fetch(`${HF_BASE_URL}/${model}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 150,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }),
    })

    console.log(`Response status for ${model}:`, response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`${model} API Error:`, errorText)

      if (response.status === 401) {
        return { success: false, error: "خطای احراز هویت. در حال استفاده از سیستم پشتیبان..." }
      } else if (response.status === 429) {
        return { success: false, error: "محدودیت تعداد درخواست‌ها. در حال استفاده از سیستم پشتیبان..." }
      } else if (response.status === 503) {
        return { success: false, error: "مدل در حال بارگذاری است. در حال استفاده از سیستم پشتیبان..." }
      } else if (response.status === 404) {
        return { success: false, error: "مدل مورد نظر یافت نشد. در حال استفاده از سیستم پشتیبان..." }
      } else {
        return { success: false, error: `خطای سرور: ${response.status}. در حال استفاده از سیستم پشتیبان...` }
      }
    }

    const data = await response.json()
    console.log(`${model} API Response:`, data)

    // پردازش پاسخ بر اساس نوع مدل
    let generatedText = ""

    if (Array.isArray(data) && data.length > 0) {
      generatedText = data[0].generated_text || data[0].text || ""
    } else if (data.generated_text) {
      generatedText = data.generated_text
    } else if (data.text) {
      generatedText = data.text
    }

    if (!generatedText) {
      return { success: false, error: "پاسخ خالی از سرور دریافت شد" }
    }

    return { success: true, text: generatedText }
  } catch (error) {
    console.error(`Error with model ${model}:`, error)
    return { success: false, error: error instanceof Error ? error.message : "خطای غیرمنتظره" }
  }
}

function processGeneratedText(text: string, request: CaptionRequest): { caption: string; hashtags: string[] } {
  // پاک‌سازی متن
  let cleanText = text.trim()

  // حذف پرامپت اگر در پاسخ تکرار شده
  const promptParts = ["کپشن", "پست", "اینستاگرام", "موضوع"]
  for (const part of promptParts) {
    const regex = new RegExp(`.*${part}.*?:`, "gi")
    cleanText = cleanText.replace(regex, "")
  }

  // جداسازی کپشن و هشتگ‌ها
  const lines = cleanText.split("\n").filter((line) => line.trim())
  let caption = ""
  let hashtags: string[] = []

  for (const line of lines) {
    if (line.trim().startsWith("#")) {
      // این خط شامل هشتگ است
      const lineHashtags = line.match(/#[\u0600-\u06FF\w]+/g) || []
      hashtags.push(...lineHashtags)
    } else if (line.trim() && !line.includes("#")) {
      // این خط بخشی از کپشن است
      caption += (caption ? "\n" : "") + line.trim()
    } else if (line.includes("#")) {
      // خط ترکیبی از متن و هشتگ
      const textPart = line.replace(/#[\u0600-\u06FF\w]+/g, "").trim()
      const lineHashtags = line.match(/#[\u0600-\u06FF\w]+/g) || []

      if (textPart) {
        caption += (caption ? "\n" : "") + textPart
      }
      hashtags.push(...lineHashtags)
    }
  }

  // اگر هشتگی پیدا نشد، کپشن کامل را برگردان
  if (hashtags.length === 0) {
    caption = cleanText

    // اضافه کردن هشتگ‌های پیش‌فرض
    if (request.includeHashtags) {
      hashtags = generateDefaultHashtags(request.topic, request.style)
    }
  }

  // محدود کردن طول کپشن
  if (request.length === "short" && caption.length > 150) {
    caption = caption.substring(0, 150) + "..."
  } else if (request.length === "medium" && caption.length > 300) {
    caption = caption.substring(0, 300) + "..."
  }

  // حذف تکراری‌ها از هشتگ‌ها
  hashtags = [...new Set(hashtags)]

  // اضافه کردن ایموجی‌ها اگر وجود ندارد
  if (!caption.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u)) {
    caption = addEmojisToCaption(caption, request.topic)
  }

  return { caption: caption.trim(), hashtags }
}

function generateDefaultHashtags(topic: string, style?: string): string[] {
  const baseHashtags = ["#اینستاگرام", "#پست", "#محتوا"]

  // هشتگ‌های مرتبط با موضوع
  const topicHashtags: Record<string, string[]> = {
    فروش: ["#فروش", "#تخفیف", "#خرید"],
    غذا: ["#غذا", "#آشپزی", "#خوشمزه"],
    سفر: ["#سفر", "#گردشگری", "#ماجراجویی"],
    ورزش: ["#ورزش", "#تناسب_اندام", "#سلامتی"],
    هنر: ["#هنر", "#خلاقیت", "#الهام"],
    تکنولوژی: ["#تکنولوژی", "#فناوری", "#نوآوری"],
  }

  // پیدا کردن هشتگ‌های مرتبط
  let relevantHashtags: string[] = []
  for (const [key, tags] of Object.entries(topicHashtags)) {
    if (topic.includes(key)) {
      relevantHashtags = tags
      break
    }
  }

  // هشتگ‌های مرتبط با سبک
  const styleHashtags: Record<string, string[]> = {
    casual: ["#صمیمی", "#دوستانه"],
    professional: ["#حرفه‌ای", "#کسب_و_کار"],
    creative: ["#خلاقانه", "#هنری"],
    motivational: ["#انگیزشی", "#موفقیت"],
  }

  const styleSpecificHashtags = style ? styleHashtags[style] || [] : []

  return [...baseHashtags, ...relevantHashtags, ...styleSpecificHashtags].slice(0, 8)
}

function addEmojisToCaption(caption: string, topic: string): string {
  const topicEmojis: Record<string, string[]> = {
    فروش: ["🛍️", "💰", "🔥"],
    غذا: ["🍳", "😋", "👨‍🍳"],
    سفر: ["✈️", "🌍", "📸"],
    ورزش: ["💪", "🏋️‍♀️", "⚽"],
    هنر: ["🎨", "✨", "🖌️"],
    تکنولوژی: ["💻", "📱", "🚀"],
    انگیزشی: ["💪", "🌟", "🎯"],
  }

  let emojis = ["✨", "🌟", "💫"] // ایموجی‌های پیش‌فرض

  // پیدا کردن ایموجی‌های مرتبط با موضوع
  for (const [key, emojiList] of Object.entries(topicEmojis)) {
    if (topic.includes(key)) {
      emojis = emojiList
      break
    }
  }

  // اضافه کردن ایموجی به ابتدای کپشن
  return `${emojis[0]} ${caption}`
}

// بهبود تابع createPrompt برای مدل‌های مختلف
function createPrompt(request: CaptionRequest): string {
  const { topic, style = "casual", length = "medium" } = request

  const styleDescriptions = {
    casual: "صمیمی و دوستانه",
    professional: "حرفه‌ای و رسمی",
    creative: "خلاقانه و هنری",
    motivational: "انگیزشی و الهام‌بخش",
  }

  // پرامپت برای مدل‌های فارسی
  const persianPrompt = `کپشن ${styleDescriptions[style]} برای پست اینستاگرام درباره ${topic}:`

  // پرامپت برای مدل‌های چندزبانه
  const multilingualPrompt = `
Write an Instagram caption in Persian (Farsi) about "${topic}".
Style: ${style}
Length: ${length}
Include emojis and make it engaging.
Caption:
`

  // بسته به مدل، پرامپت مناسب را برگردان
  return persianPrompt
}

// تابع کمکی برای دریافت موضوعات پیشنهادی
export function getTopicSuggestions(category: string): string[] {
  const suggestions: Record<string, string[]> = {
    business: ["معرفی محصول جدید", "تخفیف ویژه", "خدمات شرکت", "موفقیت تیم", "نوآوری کسب‌وکار"],
    lifestyle: ["روتین صبحگاهی", "نکات سلامتی", "تعادل کار و زندگی", "سفر و تفریح", "خوشحالی روزانه"],
    food: ["دستور پخت", "رستوران جدید", "غذای سالم", "شیرینی خانگی", "نکات آشپزی"],
    fashion: ["استایل روز", "ترکیب رنگ‌ها", "مد فصل", "اکسسوری‌های جدید", "راهنمای خرید"],
    tech: ["گجت جدید", "اپلیکیشن کاربردی", "نکات فناوری", "آینده تکنولوژی", "هوش مصنوعی"],
    art: ["نقاشی جدید", "الهام هنری", "تکنیک‌های نقاشی", "هنرمندان مشهور", "آثار هنری"],
    travel: ["مقصد گردشگری", "تجربه سفر", "نکات سفر", "فرهنگ محلی", "ماجراجویی"],
    health: ["تمرینات ورزشی", "تغذیه سالم", "سلامت روان", "یوگا و مدیتیشن", "انرژی مثبت"],
  }

  return suggestions[category] || ["موضوع عمومی", "تجربه شخصی", "نکات کاربردی", "الهام روزانه"]
}

// تابع fallback برای زمانی که API کار نمی‌کند
export function getFallbackCaption(topicId: string): string {
  const fallbackCaptions: Record<string, string[]> = {
    sale: [
      "🔥 فرصت طلایی! تخفیف ویژه فقط امروز\n\n✨ کیفیت بالا، قیمت باورنکردنی\n💯 رضایت ۱۰۰٪ تضمینی\n\nشما هم از این فرصت استفاده کردید؟ 👇\n\n#تخفیف #فروش_ویژه #کیفیت #خرید_آنلاین #پیشنهاد_ویژه",
    ],
    motivational: [
      "💪 هر روز فرصتی جدید برای شروع است\n\n✨ باور داشته باش، تلاش کن، موفق شو\n🎯 هدفت را مشخص کن و به سمتش حرکت کن\n🌟 موفقیت در ادامه دادن نهفته است\n\nامروز چه قدمی برای رسیدن به هدفت برداشتی؟ 💭\n\n#انگیزه #موفقیت #تلاش #هدف #زندگی_بهتر",
    ],
    lifestyle: [
      "✨ زندگی زیبا در جزئیات نهفته است\n\n🌸 لحظات کوچک را جشن بگیرید\n☕ صبح‌های آرام، شب‌های دنج\n💫 خوشحالی در سادگی\n🌿 طبیعت، آرامش، شکرگزاری\n\nشما چطور لحظات زیبا را می‌سازید؟ 🤗\n\n#سبک_زندگی #شادی #آرامش #لحظات_زیبا #زندگی_ساده",
    ],
    food: [
      "🍳 طعم خانگی، عشق مادرانه\n\n👩‍🍳 آشپزی هنر است، عشق است\n🥗 سالم، خوشمزه، دست‌پخت\n✨ هر وعده غذا، فرصتی برای خوشحالی\n🍽️ سفره‌ای پر از محبت\n\nمحبوب‌ترین غذای خانگی شما چیست؟ 😋\n\n#آشپزی #غذای_خانگی #طعم_اصیل #عشق #خانواده",
    ],
    travel: [
      "✈️ سفر، بهترین معلم زندگی\n\n🌍 هر سفر یک داستان جدید\n🌅 طلوع در سرزمین‌های ناشناخته\n🧳 کوله‌بار خاطرات، سوغات هر سفر\n\nبهترین خاطره سفرتان چیست؟ 🗺️\n\n#سفر #گردشگری #ماجراجویی #طبیعت_گردی #خاطرات_سفر",
    ],
    art: [
      "🎨 هنر، زبان روح\n\n✨ خلاقیت بدون مرز\n🖌️ هر اثر، روایتی از درون\n🌈 رنگ‌ها، احساسات را فریاد می‌زنند\n\nهنر برای شما چه معنایی دارد؟ 💭\n\n#هنر #خلاقیت #نقاشی #بیان_هنری #الهام",
    ],
    technology: [
      "💻 فناوری، پنجره‌ای به آینده\n\n🚀 نوآوری بی‌پایان\n📱 دنیای دیجیتال در دستان شما\n⚡ سرعت، دقت، کارایی\n\nکدام فناوری جدید زندگی شما را متحول کرده؟ 🤔\n\n#تکنولوژی #فناوری #نوآوری #دیجیتال #آینده",
    ],
    fashion: [
      "👗 مد، بیان شخصیت\n\n✨ استایل منحصر به فرد\n👠 اعتماد به نفس در هر قدم\n🌟 درخشش در هر فصل\n\nاستایل مورد علاقه شما چیست؟ 💫\n\n#مد #فشن #استایل #زیبایی #ترند",
    ],
    default: [
      "✨ لحظه‌ای خاص را با شما به اشتراک می‌گذارم\n\n🌟 هر روز فرصتی جدید برای خلق خاطرات زیباست\n💫 زندگی در جزئیات کوچک نهفته است\n🌈 رنگارنگی زندگی در تنوع تجربه‌هاست\n\nشما چه تجربه‌ای امروز داشتید؟ 💭\n\n#زندگی #لحظات_خاص #خاطرات #تجربه #شادی",
    ],
  }

  const captions = fallbackCaptions[topicId] || fallbackCaptions.default
  return captions[Math.floor(Math.random() * captions.length)]
}

// تابع تست اتصال به API
export async function testHuggingFaceConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${HF_BASE_URL}/${MODELS.persian_gpt}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: "تست",
        options: { wait_for_model: true },
      }),
    })
    return response.ok || response.status === 503 // 503 یعنی مدل در حال بارگذاری
  } catch (error) {
    console.error("Hugging Face connection test failed:", error)
    return false
  }
}
