"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCanvas, type PostCanvasRef } from "@/components/post-canvas"
import { SmartCaptionGenerator, type SmartCaptionOptions } from "@/lib/smart-caption-generator"
import { generateImage, type ImageGenerationOptions, testAvalAI } from "@/lib/aval-ai"
import {
  Wand2,
  Download,
  Save,
  Copy,
  Check,
  Loader2,
  ImageIcon,
  Type,
  Palette,
  Sparkles,
  AlertCircle,
} from "lucide-react"

// قالب‌های پست
const templates = [
  { id: "modern", name: "مدرن", preview: "🎨" },
  { id: "minimal", name: "مینیمال", preview: "⚪" },
  { id: "colorful", name: "رنگارنگ", preview: "🌈" },
  { id: "elegant", name: "شیک", preview: "✨" },
  { id: "bold", name: "پررنگ", preview: "🔥" },
  { id: "nature", name: "طبیعی", preview: "🌿" },
]

// سبک‌های کپشن
const captionStyles = [
  { value: "casual", label: "صمیمی", icon: "😊" },
  { value: "professional", label: "حرفه‌ای", icon: "💼" },
  { value: "creative", label: "خلاقانه", icon: "🎨" },
  { value: "motivational", label: "انگیزشی", icon: "💪" },
]

// سبک‌های تصویر
const imageStyles = [
  { value: "realistic", label: "واقع‌گرایانه", icon: "📷" },
  { value: "artistic", label: "هنری", icon: "🎨" },
  { value: "cartoon", label: "کارتونی", icon: "🎭" },
  { value: "abstract", label: "انتزاعی", icon: "🌀" },
]

export default function CreatePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const canvasRef = useRef<PostCanvasRef>(null)

  // State ها
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [topic, setTopic] = useState("")
  const [caption, setCaption] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string>("")
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [avalStatus, setAvalStatus] = useState<boolean | null>(null)

  // تنظیمات پیشرفته
  const [captionStyle, setCaptionStyle] = useState<"casual" | "professional" | "creative" | "motivational">("casual")
  const [imageStyle, setImageStyle] = useState<"realistic" | "artistic" | "cartoon" | "abstract">("realistic")
  const [captionLength, setCaptionLength] = useState<"short" | "medium" | "long">("medium")

  // بررسی احراز هویت
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // بررسی وضعیت Aval AI
  useEffect(() => {
    const checkAvalStatus = async () => {
      try {
        const status = await testAvalAI()
        setAvalStatus(status)
        console.log("🔍 Aval AI status:", status)
      } catch (error) {
        console.error("Error checking Aval AI status:", error)
        setAvalStatus(false)
      }
    }

    checkAvalStatus()
  }, [])

  // تولید کپشن
  const handleGenerateCaption = async () => {
    if (!topic.trim()) {
      alert("لطفاً موضوع پست را وارد کنید")
      return
    }

    setIsGeneratingCaption(true)
    try {
      console.log("🔄 Generating caption for topic:", topic)

      const options: SmartCaptionOptions = {
        topic: topic.trim(),
        style: captionStyle,
        language: "fa",
        length: captionLength,
        provider: avalStatus ? "aval" : "offline", // اگر Aval در دسترس نباشد، از offline استفاده کن
        fallbackToOffline: true,
      }

      const result = await SmartCaptionGenerator.generateCaption(options)

      if (result.success) {
        setCaption(result.caption)
        alert(`✅ کپشن با ${result.provider} تولید شد`)
      } else {
        setCaption(result.caption) // fallback caption
        alert(`⚠️ از کپشن پیش‌فرض استفاده شد (${result.provider})`)
      }
    } catch (error) {
      console.error("Caption generation error:", error)
      alert("❌ خطا در تولید کپشن")
    } finally {
      setIsGeneratingCaption(false)
    }
  }

  // تولید تصویر
  const handleGenerateImage = async () => {
    if (!topic.trim()) {
      alert("لطفاً موضوع پست را وارد کنید")
      return
    }

    if (!avalStatus) {
      alert("⚠️ سرویس تولید تصویر در دسترس نیست")
      return
    }

    setIsGeneratingImage(true)
    try {
      console.log("🎨 Generating image for topic:", topic)

      const options: ImageGenerationOptions = {
        prompt: `${topic} - high quality, professional, Instagram post style`,
        style: imageStyle,
        size: "1024x1024",
        quality: "hd",
      }

      const imageUrl = await generateImage(options)
      setGeneratedImage(imageUrl)
      alert("✅ تصویر با موفقیت تولید شد")
    } catch (error) {
      console.error("Image generation error:", error)
      alert("❌ خطا در تولید تصویر")
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // کپی کپشن
  const handleCopyCaption = async () => {
    if (!caption) {
      alert("کپشنی برای کپی کردن وجود ندارد")
      return
    }

    try {
      await navigator.clipboard.writeText(caption)
      setCopied(true)
      alert("✅ کپشن کپی شد")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
      alert("❌ خطا در کپی کردن")
    }
  }

  // ذخیره پست
  const handleSavePost = async () => {
    if (!user) {
      alert("لطفاً وارد حساب کاربری خود شوید")
      return
    }

    if (!topic.trim() || !caption.trim()) {
      alert("لطفاً موضوع و کپشن را تکمیل کنید")
      return
    }

    setIsSaving(true)
    try {
      console.log("💾 Saving post...")

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: topic.trim(),
          template_id: selectedTemplate,
          image_url: generatedImage || null,
          caption: caption.trim(),
          topic: topic.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "خطا در ذخیره پست")
      }

      const savedPost = await response.json()
      console.log("✅ Post saved:", savedPost)

      alert("✅ پست با موفقیت ذخیره شد")

      // هدایت به صفحه پست‌ها
      setTimeout(() => {
        router.push("/posts")
      }, 1000)
    } catch (error) {
      console.error("Save post error:", error)
      alert(error instanceof Error ? error.message : "❌ خطا در ذخیره پست")
    } finally {
      setIsSaving(false)
    }
  }

  // دانلود تصویر
  const handleDownloadImage = () => {
    if (canvasRef.current) {
      canvasRef.current.downloadImage()
      alert("✅ تصویر دانلود شد")
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  if (!user) {
    return null
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">پُست‌ساز هوشمند ✨</h1>
            <p className="text-gray-600">پست اینستاگرام خود را با هوش مصنوعی بسازید</p>

            {/* نمایش وضعیت سرویس */}
            <div className="mt-4 flex justify-center">
              <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      avalStatus === null
                          ? "bg-gray-100 text-gray-600"
                          : avalStatus
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {avalStatus === null ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      در حال بررسی سرویس...
                    </>
                ) : avalStatus ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      سرویس AI آنلاین
                    </>
                ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      حالت آفلاین (فقط کپشن)
                    </>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* پنل تنظیمات */}
            <div className="space-y-6">
              {/* انتخاب قالب */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    انتخاب قالب
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {templates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                selectedTemplate === template.id
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <div className="text-2xl mb-2">{template.preview}</div>
                          <div className="text-sm font-medium">{template.name}</div>
                        </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* موضوع پست */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    موضوع پست
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="topic">موضوع</Label>
                    <Input
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="مثال: سفر به شمال، آشپزی، ورزش..."
                        className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* تولید محتوا */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    تولید محتوا
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="caption" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="caption">کپشن</TabsTrigger>
                      <TabsTrigger value="image" disabled={!avalStatus}>
                        تصویر {!avalStatus && "(غیرفعال)"}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="caption" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>سبک کپشن</Label>
                          <Select value={captionStyle} onValueChange={(value: any) => setCaptionStyle(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {captionStyles.map((style) => (
                                  <SelectItem key={style.value} value={style.value}>
                                    {style.icon} {style.label}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>طول کپشن</Label>
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
                      </div>

                      <Button
                          onClick={handleGenerateCaption}
                          disabled={isGeneratingCaption || !topic.trim()}
                          className="w-full"
                      >
                        {isGeneratingCaption ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              در حال تولید...
                            </>
                        ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              تولید کپشن {!avalStatus && "(آفلاین)"}
                            </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="image" className="space-y-4">
                      {avalStatus ? (
                          <>
                            <div>
                              <Label>سبک تصویر</Label>
                              <Select value={imageStyle} onValueChange={(value: any) => setImageStyle(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {imageStyles.map((style) => (
                                      <SelectItem key={style.value} value={style.value}>
                                        {style.icon} {style.label}
                                      </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Button
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage || !topic.trim()}
                                className="w-full"
                            >
                              {isGeneratingImage ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    در حال تولید...
                                  </>
                              ) : (
                                  <>
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    تولید تصویر
                                  </>
                              )}
                            </Button>
                          </>
                      ) : (
                          <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>سرویس تولید تصویر در دسترس نیست</p>
                            <p className="text-sm">لطفاً کلید API را بررسی کنید</p>
                          </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* کپشن */}
              {caption && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>کپشن تولید شده</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyCaption}
                            className="flex items-center gap-2 bg-transparent"
                        >
                          {copied ? (
                              <>
                                <Check className="h-4 w-4" />
                                کپی شد
                              </>
                          ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                کپی کپشن
                              </>
                          )}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          rows={6}
                          className="resize-none"
                      />
                    </CardContent>
                  </Card>
              )}
            </div>

            {/* پیش‌نمایش */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>پیش‌نمایش پست</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[1080/1350] bg-gray-100 rounded-lg overflow-hidden">
                    <PostCanvas
                        ref={canvasRef}
                        template={selectedTemplate}
                        topic={topic || "موضوع پست"}
                        caption={caption}
                        imageUrl={generatedImage}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* دکمه‌های عملیات */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={handleDownloadImage}
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  دانلود تصویر
                </Button>

                <Button
                    onClick={handleSavePost}
                    disabled={isSaving || !topic.trim() || !caption.trim()}
                    className="flex items-center gap-2"
                >
                  {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        در حال ذخیره...
                      </>
                  ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        ذخیره پست
                      </>
                  )}
                </Button>
              </div>

              {/* آمار و وضعیت */}
              <Card>
                <CardHeader>
                  <CardTitle>وضعیت پروژه</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">قالب انتخابی:</span>
                    <Badge variant="secondary">{templates.find((t) => t.id === selectedTemplate)?.name}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">سرویس AI:</span>
                    <Badge variant={avalStatus ? "default" : "secondary"}>{avalStatus ? "آنلاین" : "آفلاین"}</Badge>
                  </div>

                  {topic && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">موضوع:</span>
                        <Badge variant="outline">{topic}</Badge>
                      </div>
                  )}

                  {caption && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">کپشن:</span>
                        <Badge variant="secondary">{caption.length} کاراکتر</Badge>
                      </div>
                  )}

                  {generatedImage && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">تصویر:</span>
                        <Badge variant="secondary">تولید شده</Badge>
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  )
}
