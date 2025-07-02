"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Instagram, Upload, Wand2, Download, ArrowRight, Loader2, Save, Copy, Sparkles, ImageIcon } from "lucide-react"
import Link from "next/link"
import { generateSmartCaption } from "@/lib/smart-caption-generator"
import { generateImage, getImagePromptSuggestions } from "@/lib/aval-ai"
import { useAuth } from "@/contexts/AuthContext"

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
  const { user } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [selectedTopic, setSelectedTopic] = useState("")
  const [customTopic, setCustomTopic] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [postTitle, setPostTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [captionStyle, setCaptionStyle] = useState<"casual" | "professional" | "creative" | "motivational">("casual")
  const [captionLength, setCaptionLength] = useState<"short" | "medium" | "long">("medium")
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")
  const [imagePrompt, setImagePrompt] = useState("")
  const [imageStyle, setImageStyle] = useState<"realistic" | "artistic" | "cartoon" | "abstract">("realistic")
  const [imageMode, setImageMode] = useState<"upload" | "generate">("upload")
  const [imageError, setImageError] = useState("")
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
    const topic = customTopic || topics.find((t) => t.id === selectedTopic)?.name || ""
    if (!topic) {
      alert("لطفاً موضوعی انتخاب کنید یا وارد کنید")
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateSmartCaption({
        topic,
        style: captionStyle,
        length: captionLength,
        includeHashtags: true,
      })

      if (result.success) {
        const fullCaption =
            result.hashtags && result.hashtags.length > 0
                ? `${result.caption}\n\n${result.hashtags.join(" ")}`
                : result.caption
        setCaption(fullCaption)

        // تنظیم عنوان پیش‌فرض اگر خالی باشد
        if (!postTitle) {
          setPostTitle(`پست ${topic}`)
        }

        if (result.source !== "aval-ai" && result.error) {
          console.log("Caption generated using:", result.source, "-", result.error)
        }
      } else {
        alert("خطا در تولید کپشن. لطفاً دوباره تلاش کنید.")
      }
    } catch (error) {
      console.error("Caption generation error:", error)
      alert("خطا در تولید کپشن. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      alert("لطفاً توضیحی برای تصویر وارد کنید")
      return
    }

    console.log("🚀 Starting image generation...")
    console.log("📝 Image prompt:", imagePrompt)
    console.log("🎨 Image style:", imageStyle)

    setIsGeneratingImage(true)
    setImageError("")

    try {
      const result = await generateImage({
        prompt: imagePrompt,
        style: imageStyle,
        size: "1024x1024",
      })

      console.log("📡 Image generation result:", result)

      if (result.success && result.imageUrl) {
        console.log("✅ Image generated and processed successfully!")
        console.log("🖼️ Final image URL/Base64 length:", result.imageUrl.length)

        setUploadedImage(result.imageUrl)
        console.log("✅ Image set in state successfully")
      } else {
        console.error("❌ Image generation failed:", result.error)
        setImageError(result.error || "خطا در تولید تصویر")
        alert(result.error || "خطا در تولید تصویر. لطفاً دوباره تلاش کنید.")
      }
    } catch (error) {
      console.error("❌ Image generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "خطای غیرمنتظره"
      setImageError(errorMessage)
      alert("خطا در تولید تصویر. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleSavePost = async () => {
    console.log("🔄 handleSavePost called")
    console.log("👤 Current user:", user)
    console.log("🎨 Selected template:", selectedTemplate)
    console.log("📝 Caption length:", caption.length)
    console.log("🔍 Detailed validation:")
    console.log("  - User exists:", !!user)
    console.log("  - User ID:", user?.id)
    console.log("  - Template exists:", !!selectedTemplate)
    console.log("  - Template ID:", selectedTemplate?.id)
    console.log("  - Caption exists:", !!caption)
    console.log("  - Caption length:", caption?.length)
    console.log("  - Caption preview:", caption?.substring(0, 100))

    if (!user) {
      console.log("❌ No user logged in")
      alert("برای ذخیره پست ابتدا وارد شوید")
      return
    }

    if (!selectedTemplate) {
      console.log("❌ No template selected")
      alert("لطفاً قالبی انتخاب کنید")
      return
    }

    if (!caption || caption.trim().length === 0) {
      console.log("❌ No caption provided")
      alert("لطفاً ابتدا کپشنی تولید کنید")
      return
    }

    setIsSaving(true)
    setSaveMessage("")
    setSaveError("")

    try {
      const topic = customTopic || topics.find((t) => t.id === selectedTopic)?.name || ""
      const finalTitle = postTitle || `پست ${topic}` || "پست جدید"

      const postData = {
        title: finalTitle,
        template_id: selectedTemplate.id,
        image_url: uploadedImage,
        caption: caption,
        topic: topic,
      }

      console.log("🔄 Saving post with data:", postData)

      console.log("🌐 Making API request to /api/posts")
      console.log("📤 Request payload:", JSON.stringify(postData, null, 2))

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      let data
      try {
        const responseText = await response.text()
        console.log("📡 Raw response:", responseText)
        data = JSON.parse(responseText)
        console.log("📡 Parsed response data:", data)
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError)
        throw new Error("خطا در پردازش پاسخ سرور")
      }

      if (response.ok && data.success) {
        setSaveMessage("پست با موفقیت ذخیره شد! ✅")
        console.log("✅ Post saved successfully:", data.post?.id)

        // پاک کردن فرم بعد از ذخیره موفق
        setTimeout(() => {
          setSaveMessage("")
          // اختیاری: پاک کردن فرم
          // setCaption("")
          // setPostTitle("")
          // setUploadedImage(null)
        }, 3000)
      } else {
        console.error("❌ Save failed:", data.error)
        setSaveError(data.error || "خطا در ذخیره پست")
        setTimeout(() => setSaveError(""), 5000)
      }
    } catch (error: any) {
      console.error("❌ Save post error:", error)
      setSaveError(error.message || "خطا در ذخیره پست")
      setTimeout(() => setSaveError(""), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadCaption = () => {
    if (!caption) {
      alert("ابتدا کپشنی تولید کنید")
      return
    }

    const blob = new Blob([caption], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `caption-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCopyCaption = async () => {
    if (!caption) {
      alert("ابتدا کپشنی تولید کنید")
      return
    }

    try {
      await navigator.clipboard.writeText(caption)
      // نمایش پیام موفقیت موقت
      const button = document.querySelector("[data-copy-button]") as HTMLButtonElement
      if (button) {
        const originalText = button.innerHTML
        button.innerHTML =
            '<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>کپی شد!'
        setTimeout(() => {
          button.innerHTML = originalText
        }, 2000)
      }
    } catch (error) {
      // fallback برای مرورگرهای قدیمی
      const textArea = document.createElement("textarea")
      textArea.value = caption
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      alert("کپشن کپی شد!")
    }
  }

  const getImageSuggestions = () => {
    const topic = selectedTopic || "default"
    return getImagePromptSuggestions(topic)
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
              <div className="flex items-center gap-4">
                {user && (
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                      داشبورد
                    </Link>
                )}
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <ArrowRight className="h-4 w-4" />
                  بازگشت به خانه
                </Link>
              </div>
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
                {/* Post Title */}
                {user && (
                    <Card>
                      <CardHeader>
                        <CardTitle>عنوان پست</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Input
                            placeholder="عنوان پست خود را وارد کنید"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                        />
                      </CardContent>
                    </Card>
                )}

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

                {/* Image Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>تصویر پست</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image Mode Selection */}
                    <div className="flex gap-2">
                      <Button
                          variant={imageMode === "upload" ? "default" : "outline"}
                          onClick={() => setImageMode("upload")}
                          className="flex-1"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        آپلود تصویر
                      </Button>
                      <Button
                          variant={imageMode === "generate" ? "default" : "outline"}
                          onClick={() => setImageMode("generate")}
                          className="flex-1"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        تولید با AI
                      </Button>
                    </div>

                    {imageMode === "upload" ? (
                        /* Upload Mode */
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
                    ) : (
                        /* AI Generation Mode */
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="image-prompt">توضیح تصویر مورد نظر</Label>
                            <Textarea
                                id="image-prompt"
                                placeholder="مثال: یک فنجان قهوه روی میز چوبی با نور طبیعی"
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="image-style">سبک تصویر</Label>
                            <Select value={imageStyle} onValueChange={(value: any) => setImageStyle(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="realistic">واقع‌گرایانه</SelectItem>
                                <SelectItem value="artistic">هنری</SelectItem>
                                <SelectItem value="cartoon">کارتونی</SelectItem>
                                <SelectItem value="abstract">انتزاعی</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Image Error */}
                          {imageError && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 text-sm">{imageError}</p>
                              </div>
                          )}

                          {/* Image Suggestions */}
                          {selectedTopic && (
                              <div>
                                <Label>پیشنهادات:</Label>
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                  {getImageSuggestions().map((suggestion, index) => (
                                      <Button
                                          key={index}
                                          variant="ghost"
                                          size="sm"
                                          className="justify-start text-right h-auto p-2 text-sm"
                                          onClick={() => setImagePrompt(suggestion)}
                                      >
                                        {suggestion}
                                      </Button>
                                  ))}
                                </div>
                              </div>
                          )}

                          <Button
                              onClick={handleGenerateImage}
                              disabled={isGeneratingImage || !imagePrompt.trim()}
                              className="w-full"
                          >
                            {isGeneratingImage ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  در حال تولید تصویر...
                                </>
                            ) : (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  تولید تصویر با AI
                                </>
                            )}
                          </Button>

                          {uploadedImage && (
                              <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">تصویر تولید شده:</p>
                                <img
                                    src={uploadedImage || "/placeholder.svg"}
                                    alt="Generated"
                                    className="max-w-full h-32 mx-auto object-cover rounded border"
                                    onError={(e) => {
                                      console.error("❌ Generated image failed to load")
                                      const target = e.target as HTMLImageElement
                                      target.src = "/placeholder.svg?height=128&width=128"
                                    }}
                                    onLoad={() => {
                                      console.log("✅ Generated image loaded successfully")
                                    }}
                                />
                              </div>
                          )}
                        </div>
                    )}

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
                            تولید کپشن هوشمند
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
                      <CardContent className="space-y-4">
                        <Textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            rows={6}
                            placeholder="کپشن خود را اینجا وارد کنید"
                        />

                        {/* Save Message */}
                        {saveMessage && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-green-600 text-sm">{saveMessage}</p>
                            </div>
                        )}

                        {/* Save Error */}
                        {saveError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-red-600 text-sm">{saveError}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                          {user && (
                              <Button
                                  onClick={handleSavePost}
                                  disabled={isSaving || !caption || caption.trim().length === 0}
                                  className="w-full"
                              >
                                {isSaving ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      در حال ذخیره...
                                    </>
                                ) : (
                                    <>
                                      <Save className="mr-2 h-4 w-4" />
                                      ذخیره پست
                                    </>
                                )}
                              </Button>
                          )}

                          <Button
                              onClick={handleDownloadCaption}
                              variant="outline"
                              className="w-full bg-transparent"
                              disabled={!caption || caption.trim().length === 0}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            دانلود کپشن
                          </Button>
                        </div>

                        {!user && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-blue-600 text-sm">
                                برای ذخیره پست‌ها{" "}
                                <Link href="/login" className="font-semibold underline">
                                  وارد شوید
                                </Link>{" "}
                                یا{" "}
                                <Link href="/signup" className="font-semibold underline">
                                  ثبت نام کنید
                                </Link>
                              </p>
                            </div>
                        )}
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
                        <span className="mr-3 font-semibold text-sm">{user?.first_name || "your_account"}</span>
                      </div>

                      {/* Post Image */}
                      <div className={`aspect-square ${selectedTemplate.preview} flex items-center justify-center`}>
                        {uploadedImage ? (
                            <img
                                src={uploadedImage || "/placeholder.svg"}
                                alt="Post"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error("❌ Image failed to load in preview")
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.svg?height=400&width=400"
                                }}
                                onLoad={() => {
                                  console.log("✅ Image loaded successfully in preview")
                                }}
                            />
                        ) : (
                            <div className="text-white text-center">
                              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm opacity-75">تصویر خود را آپلود کنید یا با AI تولید کنید</p>
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
                              <span className="font-semibold">{user?.first_name || "your_account"}</span>
                              <span className="mr-2">
                            {caption.substring(0, 100)}
                                {caption.length > 100 ? "..." : ""}
                          </span>
                            </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 space-y-3">
                      {caption && (
                          <Button
                              onClick={handleCopyCaption}
                              variant="outline"
                              size="lg"
                              className="w-full bg-transparent"
                              data-copy-button
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            کپی کپشن
                          </Button>
                      )}
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
