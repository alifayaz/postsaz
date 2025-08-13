"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Instagram, Upload, Wand2, Download, Loader2, ImageIcon, Save, Home, User } from "lucide-react"
import Link from "next/link"
import { generateCaption as generateAvalCaption } from "@/lib/aval-ai"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Locale } from "@/lib/i18n/config"

interface CreatePageProps {
  params: { locale: Locale }
}

const templates = [
  {
    id: "modern",
    name: "modern",
    preview: "bg-gradient-to-br from-blue-500 to-purple-600",
    style: "modern",
  },
  {
    id: "minimal",
    name: "minimal",
    preview: "bg-gradient-to-br from-gray-100 to-gray-200",
    style: "minimal",
  },
  {
    id: "vibrant",
    name: "vibrant",
    preview: "bg-gradient-to-br from-orange-400 to-pink-500",
    style: "vibrant",
  },
]

export default function CreatePage({ params }: CreatePageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [selectedTopic, setSelectedTopic] = useState("")
  const [customTopic, setCustomTopic] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [captionStyle, setCaptionStyle] = useState<"casual" | "professional" | "creative" | "motivational">("casual")
  const [captionLength, setCaptionLength] = useState<"short" | "medium" | "long">("medium")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t, isRTL } = useTranslation(params.locale)

  const getLocalizedPath = (path: string) => {
    return params.locale === "fa" ? path : `/${params.locale}${path}`
  }

  // تولید لیست موضوعات با ترجمه
  const topics = [
    // فروش و بازاریابی
    { id: "sale", name: t("topics.business.sale"), emoji: "🛍️", category: "business" },
    { id: "marketing", name: t("topics.business.marketing"), emoji: "📈", category: "business" },
    { id: "product", name: t("topics.business.product"), emoji: "📦", category: "business" },
    { id: "service", name: t("topics.business.service"), emoji: "🔧", category: "business" },

    // انگیزشی و الهام‌بخش
    { id: "motivational", name: t("topics.inspiration.motivational"), emoji: "💪", category: "inspiration" },
    { id: "quotes", name: t("topics.inspiration.quotes"), emoji: "💭", category: "inspiration" },
    { id: "success", name: t("topics.inspiration.success"), emoji: "🏆", category: "inspiration" },
    { id: "mindset", name: t("topics.inspiration.mindset"), emoji: "🧠", category: "inspiration" },

    // آموزشی
    { id: "educational", name: t("topics.education.educational"), emoji: "📚", category: "education" },
    { id: "tutorial", name: t("topics.education.tutorial"), emoji: "📝", category: "education" },
    { id: "tips", name: t("topics.education.tips"), emoji: "💡", category: "education" },
    { id: "howto", name: t("topics.education.howto"), emoji: "🔍", category: "education" },

    // سبک زندگی
    { id: "lifestyle", name: t("topics.lifestyle.lifestyle"), emoji: "✨", category: "lifestyle" },
    { id: "daily", name: t("topics.lifestyle.daily"), emoji: "🌅", category: "lifestyle" },
    { id: "wellness", name: t("topics.lifestyle.wellness"), emoji: "🧘‍♀️", category: "lifestyle" },
    { id: "selfcare", name: t("topics.lifestyle.selfcare"), emoji: "💆‍♀️", category: "lifestyle" },

    // غذا و آشپزی
    { id: "food", name: t("topics.food.food"), emoji: "🍳", category: "food" },
    { id: "recipe", name: t("topics.food.recipe"), emoji: "👩‍🍳", category: "food" },
    { id: "healthy-food", name: t("topics.food.healthyFood"), emoji: "🥗", category: "food" },
    { id: "dessert", name: t("topics.food.dessert"), emoji: "🍰", category: "food" },

    // سفر و گردشگری
    { id: "travel", name: t("topics.travel.travel"), emoji: "✈️", category: "travel" },
    { id: "destination", name: t("topics.travel.destination"), emoji: "🏖️", category: "travel" },
    { id: "adventure", name: t("topics.travel.adventure"), emoji: "🏔️", category: "travel" },
    { id: "culture", name: t("topics.travel.culture"), emoji: "🏛️", category: "travel" },

    // مد و زیبایی
    { id: "fashion", name: t("topics.fashion.fashion"), emoji: "👗", category: "fashion" },
    { id: "beauty", name: t("topics.fashion.beauty"), emoji: "💄", category: "fashion" },
    { id: "skincare", name: t("topics.fashion.skincare"), emoji: "🧴", category: "fashion" },
    { id: "style", name: t("topics.fashion.style"), emoji: "👠", category: "fashion" },

    // ورزش و تناسب اندام
    { id: "fitness", name: t("topics.health.fitness"), emoji: "🏋️‍♀️", category: "health" },
    { id: "workout", name: t("topics.health.workout"), emoji: "💪", category: "health" },
    { id: "sports", name: t("topics.health.sports"), emoji: "⚽", category: "health" },
    { id: "yoga", name: t("topics.health.yoga"), emoji: "🧘", category: "health" },

    // تکنولوژی
    { id: "technology", name: t("topics.tech.technology"), emoji: "💻", category: "tech" },
    { id: "apps", name: t("topics.tech.apps"), emoji: "📱", category: "tech" },
    { id: "gadgets", name: t("topics.tech.gadgets"), emoji: "⌚", category: "tech" },
    { id: "ai", name: t("topics.tech.ai"), emoji: "🤖", category: "tech" },

    // کسب و کار
    { id: "business", name: t("topics.business.business"), emoji: "💼", category: "business" },
    { id: "entrepreneurship", name: t("topics.business.entrepreneurship"), emoji: "🚀", category: "business" },
    { id: "investment", name: t("topics.business.investment"), emoji: "💰", category: "business" },
    { id: "leadership", name: t("topics.business.leadership"), emoji: "👑", category: "business" },

    // هنر و خلاقیت
    { id: "art", name: t("topics.creative.art"), emoji: "🎨", category: "creative" },
    { id: "photography", name: t("topics.creative.photography"), emoji: "📸", category: "creative" },
    { id: "design", name: t("topics.creative.design"), emoji: "🎭", category: "creative" },
    { id: "music", name: t("topics.creative.music"), emoji: "🎵", category: "creative" },
  ]

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
      alert(t("messages.errors.selectTopic"))
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateAvalCaption({
        topic,
        style: captionStyle,
        length: captionLength,
        includeHashtags: true,
        language: params.locale
      })

      if (result.success) {
        const fullCaption =
          result.hashtags && result.hashtags.length > 0
            ? `${result.caption}\n\n${result.hashtags.join(" ")}`
            : result.caption
        setCaption(fullCaption)
      } else {
        alert(t("messages.errors.unexpected"))
      }
    } catch (error) {
      console.error("Caption generation error:", error)
      alert(t("messages.errors.unexpected"))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSavePost = async () => {
    if (!user) {
      if (confirm(t("messages.errors.loginRequired"))) {
        router.push(getLocalizedPath("/login"))
      }
      return
    }

    const topic = customTopic || topics.find((t) => t.id === selectedTopic)?.name || ""

    if (!topic.trim() || !caption.trim()) {
      alert(t("messages.errors.completeForm"))
      return
    }

    setIsSaving(true)
    try {
      console.log("💾 Saving post directly to Supabase...")

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          title: topic.trim(),
          template_id: selectedTemplate.id,
          image_url: uploadedImage || null,
          caption: caption.trim(),
          topic: topic.trim(),
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Supabase error:", error)
        throw new Error(error.message)
      }

      console.log("✅ Post saved successfully:", post.id)
      setSaveSuccess(true)
      alert(t("messages.success.postSaved"))

      // پاک کردن فرم بعد از 2 ثانیه
      setTimeout(() => {
        setSelectedTopic("")
        setCustomTopic("")
        setCaption("")
        setUploadedImage(null)
        setSaveSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Save post error:", error)
      alert(error instanceof Error ? error.message : t("messages.errors.unexpected"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadImageOnly = async () => {
    if (!uploadedImage) {
      alert(t("messages.errors.uploadImage"))
      return
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1080

    switch (selectedTemplate.id) {
      case "modern":
        const modernGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        modernGradient.addColorStop(0, "#3B82F6")
        modernGradient.addColorStop(1, "#8B5CF6")
        ctx.fillStyle = modernGradient
        break
      case "minimal":
        const minimalGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        minimalGradient.addColorStop(0, "#F3F4F6")
        minimalGradient.addColorStop(1, "#E5E7EB")
        ctx.fillStyle = minimalGradient
        break
      case "vibrant":
        const vibrantGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        vibrantGradient.addColorStop(0, "#FB923C")
        vibrantGradient.addColorStop(1, "#EC4899")
        ctx.fillStyle = vibrantGradient
        break
      default:
        ctx.fillStyle = "#FFFFFF"
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const aspectRatio = img.width / img.height
      let drawWidth = canvas.width
      let drawHeight = canvas.height
      let offsetX = 0
      let offsetY = 0

      if (aspectRatio > 1) {
        drawHeight = canvas.width / aspectRatio
        offsetY = (canvas.height - drawHeight) / 2
      } else if (aspectRatio < 1) {
        drawWidth = canvas.height * aspectRatio
        offsetX = (canvas.width - drawWidth) / 2
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

      canvas.toBlob(
        (blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `image-only-${Date.now()}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        },
        "image/png",
        1.0,
      )
    }
    img.src = uploadedImage
  }

  const handleDownloadCaption = () => {
    if (!caption) {
      alert(t("messages.errors.generateCaption"))
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""} ${user ? 'flex-col' : 'flex-row'}`}>
            <div className={`flex items-center gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Link
                  href={getLocalizedPath("/")}
                  className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <img
                    src="/logo.svg"
                    alt="postsazAI"
                    className="max-w-full h-9 mx-auto object-cover"
                />
              </Link>

              {/*<nav className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Link
                    href={getLocalizedPath("/")}
                    className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Home className="h-4 w-4" />
                  {t("nav.home")}
                </Link>
                <Link
                  href={getLocalizedPath("/dashboard")}
                  className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <User className="h-4 w-4" />
                  {t("nav.dashboard")}
                </Link>
              </nav>*/}
            </div>

            <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <LanguageSwitcher currentLocale={params.locale} />
              {loading ? (
                <div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div>
              ) : user ? (
                <>
                  <span className="text-gray-600">
                    {t("dashboard.welcome")}, {user?.user_metadata?.first_name || user?.email}
                  </span>
                  {saveSuccess && (
                    <Badge variant="default" className="bg-green-500">
                      ✅ {t("messages.success.postSaved")}
                    </Badge>
                  )}
                </>
              ) : (
                <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Button asChild>
                    <Link href={getLocalizedPath("/login")} className="text-gray-600 hover:text-gray-900">
                      {t("nav.login")}
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={getLocalizedPath("/signup")} className="text-gray-600 hover:text-gray-900">
                      {t("nav.signup")}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("create.title")}</h1>
            <p className="text-gray-600">{t("create.subtitle")}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Settings */}
            <div className="space-y-6">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("create.template.title")}</CardTitle>
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
                        <p className="text-sm font-medium">{t(`create.template.${template.name}`)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("create.image.title")}</CardTitle>
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
                        <p className="text-gray-600 mb-2">{t("create.image.dragDrop")}</p>
                        <p className="text-sm text-gray-500">{t("create.image.formats")}</p>
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
                  <CardTitle>{t("create.topic.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="topic-select">{t("create.topic.fromList")}</Label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("create.topic.placeholder")} />
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

                  <div className="text-center text-gray-500">{params.locale === "fa" ? "یا" : "or"}</div>

                  <div>
                    <Label htmlFor="custom-topic">{t("create.topic.custom")}</Label>
                    <Input
                      id="custom-topic"
                      placeholder={t("create.topic.customPlaceholder")}
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Caption Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("create.caption.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="caption-style">{t("create.caption.style")}</Label>
                    <Select value={captionStyle} onValueChange={(value: any) => setCaptionStyle(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">{t("create.caption.styles.casual")}</SelectItem>
                        <SelectItem value="professional">{t("create.caption.styles.professional")}</SelectItem>
                        <SelectItem value="creative">{t("create.caption.styles.creative")}</SelectItem>
                        <SelectItem value="motivational">{t("create.caption.styles.motivational")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="caption-length">{t("create.caption.length")}</Label>
                    <Select value={captionLength} onValueChange={(value: any) => setCaptionLength(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">{t("create.caption.lengths.short")}</SelectItem>
                        <SelectItem value="medium">{t("create.caption.lengths.medium")}</SelectItem>
                        <SelectItem value="long">{t("create.caption.lengths.long")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleGenerateCaption} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("create.caption.generating")}
                      </>
                    ) : (
                      <>
                        <Wand2 className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("create.caption.generate")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Caption Editor */}
              {caption && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("create.caption.edit")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      rows={6}
                      placeholder={t("create.caption.placeholder")}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={handleDownloadCaption} variant="outline" className="bg-transparent">
                        <Download className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("create.actions.downloadCaption")}
                      </Button>
                      <Button onClick={handleSavePost} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                        {isSaving ? (
                          <>
                            <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />
                            {t("create.actions.saving")}
                          </>
                        ) : user ? (
                          <>
                            <Save className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                            {t("create.actions.savePost")}
                          </>
                        ) : (
                          <>
                            <Save className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                            {t("create.actions.saveWithoutLogin")}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardHeader>
                  <CardTitle>{t("create.preview.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg shadow-lg max-w-sm mx-auto">
                    {/* Instagram Header */}
                    <div className={`flex items-center p-3 border-b ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Instagram className="h-4 w-4 text-white" />
                      </div>
                      <span className={`font-semibold text-sm ${isRTL ? "mr-3" : "ml-3"}`}>
                        {t("create.preview.account")}
                      </span>
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
                          <p className="text-sm opacity-75">{t("create.image.placeholder")}</p>
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="p-3">
                      <div className={`flex items-center gap-4 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      </div>

                      {/* Caption */}
                      {caption && (
                        <div className="text-sm">
                          <span className="font-semibold">{t("create.preview.account")}</span>
                          <span className={`${isRTL ? "mr-2" : "ml-2"}`}>
                            {caption.substring(0, 100)}
                            {caption.length > 100 ? "..." : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Download Buttons */}
                  <div className="mt-6 space-y-3">
                    {uploadedImage && (
                      <Button
                        onClick={handleDownloadImageOnly}
                        variant="outline"
                        size="lg"
                        className="w-full bg-transparent"
                      >
                        <ImageIcon className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                        {t("create.actions.downloadImage")}
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
