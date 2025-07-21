// سیستم تولید کپشن آفلاین با استفاده از الگوهای از پیش تعریف شده

interface OfflineCaptionOptions {
  topic: string
  style: "casual" | "professional" | "creative" | "motivational"
  length: "short" | "medium" | "long"
  includeHashtags: boolean
}

// مجموعه کپشن‌های آماده برای موضوعات مختلف
const captionTemplates: Record<string, string[]> = {
  // موضوعات کسب و کار
  business: [
    "🚀 [موضوع] ما را متمایز می‌کند\n\n✨ کیفیت، تعهد و نوآوری\n💼 راه‌حل‌های حرفه‌ای برای نیازهای شما\n📈 همراه با شما در مسیر موفقیت\n\nنظر شما درباره [موضوع] چیست؟ 💭\n\n#کسب_و_کار #موفقیت #نوآوری #حرفه‌ای #رشد",
    "💡 ایده‌های نو برای [موضوع]\n\n🔍 نگاهی متفاوت به کسب و کار\n🎯 هدف‌گذاری هوشمندانه\n🤝 همکاری برد-برد\n\nشما چه راهکاری برای بهبود [موضوع] دارید؟ 👇\n\n#ایده_نو #استراتژی #کسب_و_کار #موفقیت #رشد",
  ],

  // موضوعات سبک زندگی
  lifestyle: [
    "✨ [موضوع] بخشی از سبک زندگی سالم\n\n🌿 تعادل در زندگی روزمره\n🧘‍♀️ آرامش درون، شادی بیرون\n💫 لذت بردن از لحظات کوچک\n\nشما چطور [موضوع] را در زندگی خود جای می‌دهید؟ 🤗\n\n#سبک_زندگی #آرامش #تعادل #شادی #زندگی_سالم",
    "🌈 رنگارنگی زندگی با [موضوع]\n\n🌞 هر روز، فرصتی برای تجربه‌های جدید\n💭 ذهن آرام، زندگی شاد\n✨ جادوی لحظات ساده\n\nبهترین تجربه شما از [موضوع] چیست؟ 💫\n\n#زندگی_زیبا #لحظات_ناب #شادی #آرامش #تجربه_جدید",
  ],

  // موضوعات غذا
  food: [
    "😋 لذت [موضوع] در هر لقمه\n\n👨‍🍳 هنر آشپزی با عشق\n🍽️ طعم‌های به یادماندنی\n🌿 مواد تازه، طعم اصیل\n\nشما هم عاشق [موضوع] هستید؟ 🤤\n\n#غذای_خوشمزه #آشپزی #لذت_غذا #طعم_خاص #دستپخت",
    "🍳 رازهای [موضوع] خوشمزه\n\n✨ ترکیب طعم‌های بی‌نظیر\n🌶️ چاشنی عشق در هر وعده\n🍽️ تجربه‌ای فراتر از یک غذا\n\nبهترین خاطره شما از [موضوع] چیست؟ 👇\n\n#آشپزی #غذای_خانگی #دستور_پخت #خوشمزه #هنر_آشپزی",
  ],

  // موضوعات سفر
  travel: [
    "✈️ سفر به [موضوع]، رویایی که به حقیقت پیوست\n\n🌍 کشف مکان‌های ناشناخته\n📸 ثبت لحظات ماندگار\n🧳 کوله‌باری از خاطرات\n\nمقصد رویایی بعدی شما کجاست؟ 🗺️\n\n#سفر #ماجراجویی #گردشگری #طبیعت_گردی #خاطرات_سفر",
    "🏞️ زیبایی‌های پنهان [موضوع]\n\n🌅 طلوع در سرزمین‌های دور\n🚶‍♀️ قدم زدن در مسیرهای ناشناخته\n✨ جادوی لحظات سفر\n\nکدام گوشه از [موضوع] شما را مجذوب کرد؟ 💫\n\n#سفرنامه #طبیعت_گردی #ماجراجویی #کشف_دنیا #لذت_سفر",
  ],

  // موضوعات هنری
  art: [
    "🎨 هنر [موضوع]، بیان احساسات درونی\n\n✨ خلاقیت بی‌پایان\n🖌️ رنگ‌ها حرف می‌زنند\n💫 الهام از دنیای اطراف\n\nهنر برای شما چه معنایی دارد؟ 💭\n\n#هنر #خلاقیت #بیان_هنری #الهام #آفرینش",
    "🖼️ دنیای رنگارنگ [موضوع]\n\n🌈 هر اثر، داستانی دارد\n✨ جادوی آفرینش\n🎭 بیان بی‌واسطه احساسات\n\nکدام سبک هنری شما را بیشتر مجذوب می‌کند؟ 🤔\n\n#هنرمند #خلاقیت #آثار_هنری #الهام_بخش #بیان_هنری",
  ],

  // موضوعات انگیزشی
  motivational: [
    "💪 [موضوع]، کلید موفقیت\n\n🌟 باور به توانایی‌های خود\n🚀 هر شکست، پلی به سوی پیروزی\n✨ رویاهایت را دنبال کن\n\nبزرگترین چالش شما در مسیر موفقیت چیست؟ 💭\n\n#انگیزه #موفقیت #پشتکار #هدف #رشد_فردی",
    "🔥 با [موضوع] به اوج برسید\n\n⚡ قدرت اراده\n🎯 تمرکز بر هدف\n💫 هر روز، یک قدم به جلو\n\nچه چیزی به شما انگیزه می‌دهد؟ 💪\n\n#انگیزشی #موفقیت #تلاش #پیشرفت #اراده_قوی",
  ],

  // موضوعات تکنولوژی
  technology: [
    "💻 [موضوع]، انقلابی در دنیای فناوری\n\n🚀 نوآوری بی‌پایان\n⚡ سرعت، دقت، کارایی\n🔍 نگاهی به آینده\n\nنظر شما درباره تأثیر [موضوع] بر زندگی روزمره چیست؟ 🤔\n\n#تکنولوژی #نوآوری #دیجیتال #پیشرفت #آینده",
    "📱 [موضوع]، تحولی در دنیای دیجیتال\n\n💡 ایده‌های نوآورانه\n🔄 تغییر مداوم\n⚙️ کارایی هوشمندانه\n\nچطور از [موضوع] در زندگی روزمره استفاده می‌کنید؟ 💭\n\n#فناوری #دیجیتال #هوشمند #نوآوری #تحول_دیجیتال",
  ],

  // موضوعات عمومی
  default: [
    "✨ [موضوع]، تجربه‌ای متفاوت\n\n🌟 لحظات خاص زندگی\n💫 کشف دنیای جدید\n🌈 رنگارنگی تجربه‌ها\n\nنظر شما درباره [موضوع] چیست؟ 💭\n\n#تجربه_جدید #لحظات_خاص #زندگی #کشف #اشتراک_گذاری",
    "💫 جادوی [موضوع] در زندگی روزمره\n\n✨ لذت کشف لحظات خاص\n🌿 آرامش در سادگی\n🌈 رنگ‌های زندگی\n\nچه چیزی در [موضوع] توجه شما را جلب می‌کند؟ 👇\n\n#زندگی #لحظات_ناب #تجربه #کشف #اشتراک",
  ],
}

// هشتگ‌های پیش‌فرض برای موضوعات مختلف
const defaultHashtags: Record<string, string[]> = {
  business: ["#کسب_و_کار", "#موفقیت", "#استراتژی", "#رشد", "#نوآوری"],
  lifestyle: ["#سبک_زندگی", "#زندگی_سالم", "#آرامش", "#شادی", "#تعادل"],
  food: ["#غذای_خوشمزه", "#آشپزی", "#دستور_پخت", "#خوشمزه", "#غذای_خانگی"],
  travel: ["#سفر", "#گردشگری", "#ماجراجویی", "#طبیعت_گردی", "#خاطرات_سفر"],
  art: ["#هنر", "#خلاقیت", "#الهام", "#آفرینش", "#بیان_هنری"],
  motivational: ["#انگیزه", "#موفقیت", "#پشتکار", "#هدف", "#رشد_فردی"],
  technology: ["#تکنولوژی", "#فناوری", "#نوآوری", "#دیجیتال", "#پیشرفت"],
  fashion: ["#مد", "#استایل", "#فشن", "#زیبایی", "#ترند"],
  health: ["#سلامتی", "#تناسب_اندام", "#ورزش", "#سلامت_روان", "#زندگی_سالم"],
  default: ["#زندگی", "#لحظات_خاص", "#تجربه", "#اشتراک", "#الهام"],
}

export function generateOfflineCaption(options: OfflineCaptionOptions): { caption: string; hashtags: string[] } {
  const { topic, style, length, includeHashtags } = options

  // تعیین دسته موضوع
  let category = "default"
  if (topic.includes("کسب") || topic.includes("تجارت") || topic.includes("فروش")) category = "business"
  else if (topic.includes("غذا") || topic.includes("آشپزی") || topic.includes("خوراک")) category = "food"
  else if (topic.includes("سفر") || topic.includes("گردش") || topic.includes("طبیعت")) category = "travel"
  else if (topic.includes("هنر") || topic.includes("نقاشی") || topic.includes("خلاقیت")) category = "art"
  else if (topic.includes("انگیزه") || topic.includes("موفقیت") || topic.includes("پیشرفت")) category = "motivational"
  else if (topic.includes("تکنولوژی") || topic.includes("فناوری") || topic.includes("دیجیتال")) category = "technology"
  else if (topic.includes("سبک") || topic.includes("زندگی") || topic.includes("روزمره")) category = "lifestyle"

  // انتخاب قالب کپشن مناسب
  const templates = captionTemplates[category] || captionTemplates.default
  const templateIndex = Math.floor(Math.random() * templates.length)
  let captionTemplate = templates[templateIndex]

  // جایگزینی موضوع در قالب
  captionTemplate = captionTemplate.replace(/\[موضوع\]/g, topic)

  // تنظیم طول کپشن
  if (length === "short") {
    // حذف یک یا دو پاراگراف میانی
    const lines = captionTemplate.split("\n\n")
    if (lines.length > 2) {
      captionTemplate = [lines[0], lines[lines.length - 1]].join("\n\n")
    }
  } else if (length === "long" && captionTemplate.split("\n\n").length < 4) {
    // اضافه کردن محتوای بیشتر برای کپشن‌های بلند
    const extraContent = {
      business: "\n💼 استراتژی‌های هوشمندانه برای رشد\n📊 تحلیل داده‌ها برای تصمیم‌گیری بهتر",
      lifestyle: "\n🧘‍♀️ تمرین ذهن‌آگاهی در زندگی روزمره\n🌱 رشد شخصی در مسیر زندگی",
      food: "\n🍽️ ترکیب طعم‌های منحصر به فرد\n👨‍🍳 تکنیک‌های حرفه‌ای در آشپزی خانگی",
      travel: "\n🗺️ کشف مکان‌های کمتر شناخته شده\n📸 ثبت لحظات ناب سفر",
      art: "\n🎭 بیان احساسات از طریق هنر\n🖌️ تکنیک‌های خلاقانه در آفرینش",
      motivational: "\n🧠 ذهنیت رشد و توسعه فردی\n⏱️ مدیریت زمان برای دستیابی به اهداف",
      technology: "\n💻 آینده فناوری و تأثیر آن بر زندگی\n🔄 سازگاری با تغییرات سریع دنیای دیجیتال",
      default: "\n✨ کشف زیبایی‌های پنهان در زندگی روزمره\n🌈 تجربه‌های متنوع برای رشد شخصی",
    }

    const parts = captionTemplate.split("\n\n")
    const extraPart = extraContent.default
    parts.splice(1, 0, extraPart)
    captionTemplate = parts.join("\n\n")
  }

  // تنظیم سبک کپشن
  switch (style) {
    case "professional":
      captionTemplate = captionTemplate.replace(/😋|🤤|😍/g, "")
      captionTemplate = captionTemplate.replace(/\?|👇/g, ".")
      break
    case "creative":
      // اضافه کردن ایموجی‌های خلاقانه بیشتر
      captionTemplate = captionTemplate.replace(/\n/g, " ✨\n")
      break
    case "motivational":
      // اضافه کردن عبارات انگیزشی
      if (!captionTemplate.includes("می‌توانی")) {
        captionTemplate += "\n\n💫 تو می‌توانی! باور داشته باش و ادامه بده! 💪"
      }
      break
  }

  // انتخاب هشتگ‌ها
  let hashtags: string[] = []
  if (includeHashtags) {
    hashtags = [...(defaultHashtags[category] || defaultHashtags.default)]

    // اضافه کردن هشتگ موضوع
    if (topic && !hashtags.includes(`#${topic}`)) {
      hashtags.push(`#${topic.replace(/\s+/g, "_")}`)
    }

    // اضافه کردن هشتگ‌های مرتبط با سبک
    if (style === "motivational") {
      hashtags.push("#انگیزشی", "#باور_داشته_باش")
    } else if (style === "creative") {
      hashtags.push("#خلاقیت", "#هنرمندانه")
    } else if (style === "professional") {
      hashtags.push("#حرفه‌ای", "#تخصصی")
    }
  }

  return {
    caption: captionTemplate,
    hashtags: hashtags,
  }
}

// تابع اصلی برای استفاده در برنامه
export async function generateCaption(
    options: OfflineCaptionOptions,
): Promise<{ caption: string; hashtags: string[]; success: boolean }> {
  try {
    const result = generateOfflineCaption(options)

    return {
      caption: result.caption,
      hashtags: result.hashtags,
      success: true,
    }
  } catch (error) {
    console.error("Error generating offline caption:", error)
    return {
      caption: "خطا در تولید کپشن. لطفاً دوباره تلاش کنید.",
      hashtags: [],
      success: false,
    }
  }
}
