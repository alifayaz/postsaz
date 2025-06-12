"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Instagram, Upload, Wand2, Download, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { generateCaption, getFallbackCaption } from "@/lib/aval-ai"

const templates = [
  {
    id: "modern",
    name: "مدرن",
    preview: "bg-gradient-to-br from-blue-500 to-purple-600",
    style: "modern",
  },
  {
    id: "minimal",
    name: "مینیمال",
    preview: "bg-gradient-to-br from-gray-100 to-gray-200",
    style: "minimal",
  },
  {
    id: "vibrant",
    name: "پرانرژی",
    preview: "bg-gradient-to-br from-orange-400 to-pink-500",
    style: "vibrant",
  },
]

const topics = [
  // فروش و بازاریابی
  { id: "sale", name: "فروش و تخفیف", emoji: "🛍️", category: "business" },
  { id: "marketing", name: "بازاریابی", emoji: "📈", category: "business" },
  { id: "product", name: "معرفی محصول", emoji: "📦", category: "business" },
  { id: "service", name: "معرفی خدمات", emoji: "🔧", category: "business" },

  // انگیزشی و الهام‌بخش
  { id: "motivational", name: "انگیزشی", emoji: "💪", category: "inspiration" },
  { id: "quotes", name: "جملات حکیمانه", emoji: "💭", category: "inspiration" },
  { id: "success", name: "موفقیت", emoji: "🏆", category: "inspiration" },
  { id: "mindset", name: "طرز فکر مثبت", emoji: "🧠", category: "inspiration" },

  // آموزشی
  { id: "educational", name: "آموزشی", emoji: "📚", category: "education" },
  { id: "tutorial", name: "آموزش گام به گام", emoji: "📝", category: "education" },
  { id: "tips", name: "نکات و ترفندها", emoji: "💡", category: "education" },
  { id: "howto", name: "چگونه انجام دهیم", emoji: "🔍", category: "education" },

  // سبک زندگی
  { id: "lifestyle", name: "سبک زندگی", emoji: "✨", category: "lifestyle" },
  { id: "daily", name: "زندگی روزمره", emoji: "🌅", category: "lifestyle" },
  { id: "wellness", name: "سلامت و تندرستی", emoji: "🧘‍♀️", category: "lifestyle" },
  { id: "selfcare", name: "مراقبت از خود", emoji: "💆‍♀️", category: "lifestyle" },

  // غذا و آشپزی
  { id: "food", name: "غذا و آشپزی", emoji: "🍳", category: "food" },
  { id: "recipe", name: "دستور پخت", emoji: "👩‍🍳", category: "food" },
  { id: "healthy-food", name: "غذای سالم", emoji: "🥗", category: "food" },
  { id: "dessert", name: "شیرینی و دسر", emoji: "🍰", category: "food" },

  // سفر و گردشگری
  { id: "travel", name: "سفر و گردشگری", emoji: "✈️", category: "travel" },
  { id: "destination", name: "معرفی مقصد", emoji: "🏖️", category: "travel" },
  { id: "adventure", name: "ماجراجویی", emoji: "🏔️", category: "travel" },
  { id: "culture", name: "فرهنگ و سنت", emoji: "🏛️", category: "travel" },

  // مد و زیبایی
  { id: "fashion", name: "مد و پوشاک", emoji: "👗", category: "fashion" },
  { id: "beauty", name: "زیبایی و آرایش", emoji: "💄", category: "fashion" },
  { id: "skincare", name: "مراقبت از پوست", emoji: "🧴", category: "fashion" },
  { id: "style", name: "استایل شخصی", emoji: "👠", category: "fashion" },

  // ورزش و تناسب اندام
  { id: "fitness", name: "تناسب اندام", emoji: "🏋️‍♀️", category: "health" },
  { id: "workout", name: "تمرینات ورزشی", emoji: "💪", category: "health" },
  { id: "sports", name: "ورزش", emoji: "⚽", category: "health" },
  { id: "yoga", name: "یوگا و مدیتیشن", emoji: "🧘", category: "health" },

  // تکنولوژی
  { id: "technology", name: "فناوری", emoji: "💻", category: "tech" },
  { id: "apps", name: "اپلیکیشن‌ها", emoji: "📱", category: "tech" },
  { id: "gadgets", name: "گجت‌ها", emoji: "⌚", category: "tech" },
  { id: "ai", name: "هوش مصنوعی", emoji: "🤖", category: "tech" },

  // کسب و کار
  { id: "business", name: "کسب و کار", emoji: "💼", category: "business" },
  { id: "entrepreneurship", name: "کارآفرینی", emoji: "🚀", category: "business" },
  { id: "investment", name: "سرمایه‌گذاری", emoji: "💰", category: "business" },
  { id: "leadership", name: "رهبری", emoji: "👑", category: "business" },

  // هنر و خلاقیت
  { id: "art", name: "هنر", emoji: "🎨", category: "creative" },
  { id: "photography", name: "عکاسی", emoji: "📸", category: "creative" },
  { id: "design", name: "طراحی", emoji: "🎭", category: "creative" },
  { id: "music", name: "موسیقی", emoji: "🎵", category: "creative" },
]

export default function CreatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [selectedTopic, setSelectedTopic] = useState("")
  const [customTopic, setCustomTopic] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [captionStyle, setCaptionStyle] = useState<"casual" | "professional" | "creative" | "motivational">("casual")
  const [captionLength, setCaptionLength] = useState<"short" | "medium" | "long">("medium")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateCaption = async () => {
    const topic = customTopic || topics.find((t) => t.id === selectedTopic)?.name
    if (!topic) {
      alert("لطفاً موضوعی انتخاب کنید یا وارد کنید")
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateCaption({
        topic,
        style: captionStyle,
        length: captionLength,
        includeHashtags: true,
        language: "fa",
      })

      if (result.success) {
        const fullCaption =
            result.hashtags && result.hashtags.length > 0
                ? `${result.caption}\n\n${result.hashtags.join(" ")}`
                : result.caption
        setCaption(fullCaption)
      } else {
        // در صورت خطا از کپشن نمونه استفاده کنید
        console.warn("AI generation failed, using fallback:", result.error)

        // استفاده از کپشن نمونه
        const fallbackCaption = getFallbackCaption(selectedTopic || "default")
        setCaption(fallbackCaption)

        // نمایش پیام خطا اما ادامه کار
        alert(`خطا در تولید کپشن با AI: ${result.error}\n\nکپشن نمونه نمایش داده شد.`)
      }
    } catch (error) {
      console.error("Caption generation error:", error)

      // استفاده از کپشن نمونه در صورت خطا
      const fallbackCaption = getFallbackCaption(selectedTopic || "default")
      setCaption(fallbackCaption)

      alert("خطا در اتصال به سرویس AI. کپشن نمونه نمایش داده شد.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    // پیاده‌سازی دانلود پست
    alert("قابلیت دانلود به زودی اضافه می‌شود")
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Instagram className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">پُست‌ساز</span>
              </Link>
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowRight className="h-4 w-4" />
                بازگشت به خانه
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ساخت پست اینستاگرام</h1>
              <p className="text-gray-600">پست زیبا و حرفه‌ای خود را در چند مرحله ساده بسازید</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Panel - Settings */}
              <div className="space-y-6">
                {/* Template Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>انتخاب قالب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {templates.map((template) => (
                          <div
                              key={template.id}
                              className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${
                                  selectedTemplate.id === template.id
                                      ? "border-purple-500 bg-purple-50"
                                      : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setSelectedTemplate(template)}
                          >
                            <div className={`w-full h-20 rounded-md mb-2 ${template.preview}`}></div>
                            <p className="text-sm font-medium">{template.name}</p>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Image Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle>آپلود تصویر</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedImage ? (
                          <img
                              src={uploadedImage || "/placeholder.svg"}
                              alt="Uploaded"
                              className="max-w-full h-32 mx-auto object-cover rounded"
                          />
                      ) : (
                          <>
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">تصویر خود را اینجا بکشید یا کلیک کنید</p>
                            <p className="text-sm text-gray-500">JPG, PNG, GIF تا 10MB</p>
                          </>
                      )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                  </CardContent>
                </Card>

                {/* Topic Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>انتخاب موضوع</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="topic-select">موضوع از لیست</Label>
                      <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                        <SelectTrigger>
                          <SelectValue placeholder="موضوعی انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent>
                          {topics.map((topic) => (
                              <SelectItem key={topic.id} value={topic.id}>
                                {topic.emoji} {topic.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-center text-gray-500">یا</div>

                    <div>
                      <Label htmlFor="custom-topic">موضوع دلخواه</Label>
                      <Input
                          id="custom-topic"
                          placeholder="موضوع خود را وارد کنید"
                          value={customTopic}
                          onChange={(e) => setCustomTopic(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Caption Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>تنظیمات کپشن</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="caption-style">سبک کپشن</Label>
                      <Select value={captionStyle} onValueChange={(value: any) => setCaptionStyle(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casual">صمیمی و دوستانه</SelectItem>
                          <SelectItem value="professional">حرفه‌ای و رسمی</SelectItem>
                          <SelectItem value="creative">خلاقانه و هنری</SelectItem>
                          <SelectItem value="motivational">انگیزشی و الهام‌بخش</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="caption-length">طول کپشن</Label>
                      <Select value={captionLength} onValueChange={(value: any) => setCaptionLength(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">کوتاه</SelectItem>
                          <SelectItem value="medium">متوسط</SelectItem>
                          <SelectItem value="long">بلند</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleGenerateCaption} disabled={isGenerating} className="w-full">
                      {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            در حال تولید...
                          </>
                      ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            تولید کپشن با AI
                          </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Caption Editor */}
                {caption && (
                    <Card>
                      <CardHeader>
                        <CardTitle>ویرایش کپشن</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            rows={6}
                            placeholder="کپشن خود را اینجا وارد کنید"
                        />
                      </CardContent>
                    </Card>
                )}
              </div>

              {/* Right Panel - Preview */}
              <div className="lg:sticky lg:top-8">
                <Card>
                  <CardHeader>
                    <CardTitle>پیش‌نمایش پست</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg shadow-lg max-w-sm mx-auto">
                      {/* Instagram Header */}
                      <div className="flex items-center p-3 border-b">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Instagram className="h-4 w-4 text-white" />
                        </div>
                        <span className="mr-3 font-semibold text-sm">your_account</span>
                      </div>

                      {/* Post Image */}
                      <div className={`aspect-square ${selectedTemplate.preview} flex items-center justify-center`}>
                        {uploadedImage ? (
                            <img
                                src={uploadedImage || "/placeholder.svg"}
                                alt="Post"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-white text-center">
                              <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm opacity-75">تصویر خود را آپلود کنید</p>
                            </div>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="p-3">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        </div>

                        {/* Caption */}
                        {caption && (
                            <div className="text-sm">
                              <span className="font-semibold">your_account</span>
                              <span className="mr-2">{caption}</span>
                            </div>
                        )}
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="mt-6 text-center">
                      <Button onClick={handleDownload} size="lg" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        دانلود پست
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
