import { generateCaption as avalGenerateCaption, testAvalAI } from "./aval-ai"

// انواع مختلف سرویس‌های AI
export type AIProvider = "aval" | "gemini" | "huggingface" | "offline"

// تنظیمات تولید کپشن
export interface SmartCaptionOptions {
    topic: string
    style?: "casual" | "professional" | "creative" | "motivational"
    language?: "fa" | "en"
    length?: "short" | "medium" | "long"
    provider?: AIProvider
    fallbackToOffline?: boolean
}

// نتیجه تولید کپشن
export interface CaptionResult {
    caption: string
    provider: AIProvider
    success: boolean
    error?: string
    generationTime: number
}

// کلاس اصلی برای تولید هوشمند کپشن
export class SmartCaptionGenerator {
    private static readonly DEFAULT_OPTIONS: Partial<SmartCaptionOptions> = {
        style: "casual",
        language: "fa",
        length: "medium",
        provider: "aval",
        fallbackToOffline: true,
    }

    // تولید کپشن با سیستم fallback
    static async generateCaption(options: SmartCaptionOptions): Promise<CaptionResult> {
        const startTime = Date.now()
        const finalOptions = { ...this.DEFAULT_OPTIONS, ...options }

        console.log("🧠 SmartCaptionGenerator started with options:", finalOptions)

        // تعیین ترتیب سرویس‌ها بر اساس اولویت
        const providers = this.getProviderPriority(finalOptions.provider!)

        for (const provider of providers) {
            try {
                console.log(`🔄 Trying provider: ${provider}`)

                const caption = await this.generateWithProvider(provider, finalOptions)
                const generationTime = Date.now() - startTime

                console.log(`✅ Caption generated successfully with ${provider} in ${generationTime}ms`)

                return {
                    caption,
                    provider,
                    success: true,
                    generationTime,
                }
            } catch (error) {
                console.warn(`⚠️ Provider ${provider} failed:`, error)
                continue
            }
        }

        // اگر همه سرویس‌ها شکست خوردند
        const generationTime = Date.now() - startTime
        const fallbackCaption = this.getFallbackCaption(finalOptions.topic, finalOptions.style!)

        console.log("❌ All providers failed, using fallback caption")

        return {
            caption: fallbackCaption,
            provider: "offline",
            success: false,
            error: "All AI providers failed",
            generationTime,
        }
    }

    // تولید کپشن با سرویس مشخص
    private static async generateWithProvider(provider: AIProvider, options: SmartCaptionOptions): Promise<string> {
        switch (provider) {
            case "aval":
                console.log("🔄 Trying Aval AI...")
                try {
                    const result = await avalGenerateCaption({
                        topic: options.topic,
                        style: options.style,
                        language: options.language,
                        length: options.length,
                    })
                    console.log("✅ Aval AI succeeded")
                    return result
                } catch (error) {
                    console.error("❌ Aval AI failed:", error)
                    throw error
                }

            case "gemini":
                console.log("🔄 Trying Gemini...")
                // اگر gemini موجود باشد
                throw new Error("Gemini provider not implemented yet")

            case "huggingface":
                console.log("🔄 Trying Hugging Face...")
                // اگر huggingface موجود باشد
                throw new Error("Huggingface provider not implemented yet")

            case "offline":
                console.log("🔄 Using offline generation...")
                return this.generateOfflineCaption(options.topic, options.style || "casual")

            default:
                throw new Error(`Unknown provider: ${provider}`)
        }
    }

    // تولید کپشن آفلاین
    private static generateOfflineCaption(topic: string, style: string): string {
        const fallbackCaptions = {
            casual: [
                `${topic} 🌟\n\nامروز روز خوبی برای شروع چیزهای جدید است! ✨\n\n#${topic.replace(/\s+/g, "_")} #انگیزه #زندگی`,
                `درباره ${topic} 💭\n\nگاهی کوچک‌ترین چیزها بزرگ‌ترین تأثیر را دارند 🌱\n\n#الهام #${topic.replace(/\s+/g, "_")}`,
                `${topic} در زندگی روزمره 🌈\n\nهر روز فرصت جدیدی برای یادگیری است 📚\n\n#یادگیری #${topic.replace(/\s+/g, "_")}`,
            ],
            professional: [
                `${topic}: نگاهی حرفه‌ای 💼\n\nموفقیت نتیجه برنامه‌ریزی دقیق و اجرای مستمر است.\n\n#حرفه‌ای #${topic.replace(/\s+/g, "_")} #موفقیت`,
                `تحلیل ${topic} 📊\n\nدر دنیای امروز، دانش قدرت است و به‌روزرسانی مستمر ضروری.\n\n#تحلیل #${topic.replace(/\s+/g, "_")} #دانش`,
            ],
            creative: [
                `${topic} از نگاه هنری 🎨\n\nخلاقیت مرز ندارد، فقط باید جرأت کشف کردن داشته باشیم! ✨\n\n#خلاقیت #هنر #${topic.replace(/\s+/g, "_")}`,
                `الهام از ${topic} 🌟\n\nهر چیز می‌تواند منبع الهام باشد، کافی است با چشم‌های باز نگاه کنیم 👁️\n\n#الهام #${topic.replace(/\s+/g, "_")}`,
            ],
            motivational: [
                `${topic} و قدرت اراده 💪\n\nهیچ رؤیایی بزرگ‌تر از توان تو نیست! امروز قدم اول را بردار 🚀\n\n#انگیزه #موفقیت #${topic.replace(/\s+/g, "_")}`,
                `مسیر ${topic} 🛤️\n\nهر قدم کوچک، تو را به هدف بزرگت نزدیک‌تر می‌کند. ادامه بده! ⭐\n\n#مسیر_موفقیت #${topic.replace(/\s+/g, "_")}`,
            ],
        }

        const captions = fallbackCaptions[style as keyof typeof fallbackCaptions] || fallbackCaptions.casual
        return captions[Math.floor(Math.random() * captions.length)]
    }

    // تعیین اولویت سرویس‌ها
    private static getProviderPriority(preferredProvider: AIProvider): AIProvider[] {
        // اولویت: ابتدا سرویس انتخابی، سپس offline
        const priority: AIProvider[] = []

        // اضافه کردن سرویس انتخابی
        priority.push(preferredProvider)

        // اضافه کردن offline اگر قبلاً اضافه نشده
        if (preferredProvider !== "offline") {
            priority.push("offline")
        }

        return priority
    }

    // کپشن پیش‌فرض در صورت شکست همه سرویس‌ها
    private static getFallbackCaption(topic: string, style: string): string {
        return this.generateOfflineCaption(topic, style)
    }

    // بررسی وضعیت سرویس‌ها
    static async checkProvidersStatus(): Promise<Record<AIProvider, boolean>> {
        const status: Record<AIProvider, boolean> = {
            aval: false,
            gemini: false,
            huggingface: false,
            offline: true, // همیشه در دسترس است
        }

        // تست Aval AI
        try {
            console.log("🔄 Testing Aval AI connection...")
            status.aval = await testAvalAI()
            console.log("✅ Aval AI status:", status.aval)
        } catch (error) {
            console.warn("⚠️ Aval AI test failed:", error)
            status.aval = false
        }

        return status
    }

    // دریافت آمار استفاده
    static getUsageStats(): {
        totalGenerations: number
        successRate: number
        averageTime: number
        providerStats: Record<AIProvider, number>
    } {
        // این آمار می‌تواند از دیتابیس یا localStorage خوانده شود
        return {
            totalGenerations: 0,
            successRate: 0,
            averageTime: 0,
            providerStats: {
                aval: 0,
                gemini: 0,
                huggingface: 0,
                offline: 0,
            },
        }
    }
}

// Export تابع ساده برای استفاده آسان
export async function generateSmartCaption(topic: string, options?: Partial<SmartCaptionOptions>): Promise<string> {
    const result = await SmartCaptionGenerator.generateCaption({
        topic,
        ...options,
    })

    return result.caption
}

// Export پیش‌فرض
export default SmartCaptionGenerator
