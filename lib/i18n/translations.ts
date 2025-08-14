export const translations = {
  fa: {
    // Navigation
    nav: {
      home: "خانه",
      dashboard: "داشبورد",
      create: "ساخت پست",
      login: "ورود",
      signup: "ثبت نام",
      logout: "خروج",
      settings: "تنظیمات",
    },

    // Common
    common: {
      loading: "در حال بارگذاری...",
      save: "ذخیره",
      cancel: "لغو",
      delete: "حذف",
      edit: "ویرایش",
      copy: "کپی",
      download: "دانلود",
      upload: "آپلود",
      search: "جستجو",
      filter: "فیلتر",
      close: "بستن",
      back: "بازگشت",
      next: "بعدی",
      previous: "قبلی",
      submit: "ارسال",
      confirm: "تأیید",
      error: "خطا",
      success: "موفقیت",
      warning: "هشدار",
      info: "اطلاعات",
    },

    // Home Page
    home: {
      title: "پُست‌ساز",
      subtitle: "ابزار هوشمند تولید پست اینستاگرام",
      hero: {
        title: "پست اینستاگرام خود را در چند ثانیه بسازید",
        subtitle:
            "با پُست‌ساز، قالب‌های زیبا انتخاب کنید، عکس آپلود کنید و کپشن‌های جذاب دریافت کنید. همه چیز آماده برای انتشار در اینستاگرام!",
        cta: "شروع رایگان",
        ctaLoggedIn: "رفتن به داشبورد",
      },
      features: {
        title: "چرا پُست‌ساز؟",
        templates: {
          title: "قالب‌های آماده",
          description: "از قالب‌های طراحی شده و حرفه‌ای استفاده کنید",
        },
        captions: {
          title: "کپشن هوشمند",
          description: "کپشن‌های جذاب و متناسب با موضوع دریافت کنید",
        },
        download: {
          title: "دانلود آسان",
          description: "پست نهایی را دانلود کنید و در اینستاگرام منتشر کنید",
        },
      },
      cta: {
        title: "آماده برای شروع هستید؟",
        subtitle: "همین الان اولین پست خود را بسازید",
        button: "شروع کنید",
      },
    },

    // Auth
    auth: {
      login: {
        title: "ورود به حساب کاربری",
        subtitle: "به پنل کاربری خود دسترسی پیدا کنید",
        email: "ایمیل",
        password: "رمز عبور",
        submit: "ورود",
        loading: "در حال ورود...",
        forgotPassword: "رمز عبور را فراموش کرده‌اید؟",
        resendConfirmation: "ارسال مجدد ایمیل تأیید",
        noAccount: "حساب کاربری ندارید؟",
        signupLink: "ثبت نام کنید",
        continueWithoutSignup: "ادامه بدون ثبت نام",
      },
      signup: {
        title: "ایجاد حساب کاربری",
        subtitle: "به جمع کاربران پُست‌ساز بپیوندید",
        firstName: "نام",
        lastName: "نام خانوادگی",
        email: "ایمیل",
        password: "رمز عبور",
        confirmPassword: "تکرار رمز عبور",
        acceptTerms: "با قوانین و مقررات موافقم",
        submit: "ثبت نام",
        loading: "در حال ثبت نام...",
        hasAccount: "قبلاً حساب کاربری دارید؟",
        loginLink: "وارد شوید",
      },
      forgotPassword: {
        title: "بازیابی رمز عبور",
        subtitle: "ایمیل خود را وارد کنید",
        submit: "ارسال لینک بازیابی",
        loading: "در حال ارسال...",
        backToLogin: "بازگشت به ورود",
      },
      callback: {
        title: "تأیید ایمیل",
        processing: "در حال تأیید ایمیل شما...",
        success: "ایمیل با موفقیت تأیید شد! 🎉",
        successMessage: "حساب کاربری شما فعال شد. در حال انتقال به داشبورد...",
        error: "خطا در تأیید ایمیل",
        goToDashboard: "رفتن به داشبورد",
        goToLogin: "رفتن به صفحه ورود",
        backToHome: "بازگشت به خانه",
      },
    },

    // Dashboard
    dashboard: {
      title: "داشبورد کاربری",
      subtitle: "مدیریت پست‌ها و مشاهده آمار",
      welcome: "خوش آمدید",
      stats: {
        totalPosts: "کل پست‌ها",
        thisWeek: "این هفته",
        thisMonth: "این ماه",
      },
      quickActions: {
        createPost: {
          title: "ساخت پست جدید",
          description: "پست اینستاگرام جدید با AI بسازید",
        },
        settings: {
          title: "تنظیمات",
          description: "تنظیمات حساب کاربری",
        },
      },
      posts: {
        title: "پست‌های ذخیره شده",
        empty: {
          title: "هنوز پستی نساخته‌اید",
          description: "اولین پست اینستاگرام خود را بسازید",
          cta: "ساخت اولین پست",
        },
        actions: {
          copy: "کپی",
          copied: "کپی شد",
          download: "دانلود",
          delete: "حذف",
        },
        meta: {
          characters: "کاراکتر",
          withImage: "تصویر",
        },
      },
    },

    // Create Post
    create: {
      title: "ساخت پست اینستاگرام",
      subtitle: "پست زیبا و حرفه‌ای خود را در چند مرحله ساده بسازید",
      template: {
        title: "انتخاب قالب",
        modern: "مدرن",
        minimal: "مینیمال",
        vibrant: "پرانرژی",
      },
      image: {
        title: "آپلود تصویر",
        dragDrop: "تصویر خود را اینجا بکشید یا کلیک کنید",
        formats: "JPG, PNG, GIF تا 10MB",
        placeholder: "تصویر خود را آپلود کنید",
      },
      topic: {
        title: "انتخاب موضوع",
        fromList: "موضوع از لیست",
        placeholder: "موضوعی انتخاب کنید",
        custom: "موضوع دلخواه",
        customPlaceholder: "موضوع خود را وارد کنید",
      },
      caption: {
        title: "تنظیمات کپشن",
        style: "سبک کپشن",
        styles: {
          casual: "صمیمی و دوستانه",
          professional: "حرفه‌ای و رسمی",
          creative: "خلاقانه و هنری",
          motivational: "انگیزشی و الهام‌بخش",
        },
        length: "طول کپشن",
        lengths: {
          short: "کوتاه",
          medium: "متوسط",
          long: "بلند",
        },
        generate: "تولید کپشن هوشمند",
        generating: "در حال تولید...",
        edit: "ویرایش کپشن",
        placeholder: "کپشن خود را اینجا وارد کنید",
      },
      preview: {
        title: "پیش‌نمایش پست",
        account: "your_account",
      },
      actions: {
        downloadImage: "دانلود فقط تصویر",
        downloadCaption: "دانلود کپشن",
        savePost: "ذخیره پست",
        saving: "در حال ذخیره...",
        saveWithoutLogin: "ذخیره پست (نیاز به ورود)",
      },
    },

    // Topics
    topics: {
      business: {
        sale: "فروش و تخفیف",
        marketing: "بازاریابی",
        product: "معرفی محصول",
        service: "معرفی خدمات",
        business: "کسب و کار",
        entrepreneurship: "کارآفرینی",
        investment: "سرمایه‌گذاری",
        leadership: "رهبری",
      },
      inspiration: {
        motivational: "انگیزشی",
        quotes: "جملات حکیمانه",
        success: "موفقیت",
        mindset: "طرز فکر مثبت",
      },
      education: {
        educational: "آموزشی",
        tutorial: "آموزش گام به گام",
        tips: "نکات و ترفندها",
        howto: "چگونه انجام دهیم",
      },
      lifestyle: {
        lifestyle: "سبک زندگی",
        daily: "زندگی روزمره",
        wellness: "سلامت و تندرستی",
        selfcare: "مراقبت از خود",
      },
      food: {
        food: "غذا و آشپزی",
        recipe: "دستور پخت",
        healthyFood: "غذای سالم",
        dessert: "شیرینی و دسر",
      },
      travel: {
        travel: "سفر و گردشگری",
        destination: "معرفی مقصد",
        adventure: "ماجراجویی",
        culture: "فرهنگ و سنت",
      },
      fashion: {
        fashion: "مد و پوشاک",
        beauty: "زیبایی و آرایش",
        skincare: "مراقبت از پوست",
        style: "استایل شخصی",
      },
      health: {
        fitness: "تناسب اندام",
        workout: "تمرینات ورزشی",
        sports: "ورزش",
        yoga: "یوگا و مدیتیشن",
      },
      tech: {
        technology: "فناوری",
        apps: "اپلیکیشن‌ها",
        gadgets: "گجت‌ها",
        ai: "هوش مصنوعی",
      },
      creative: {
        art: "هنر",
        photography: "عکاسی",
        design: "طراحی",
        music: "موسیقی",
      },
    },

    // Messages
    messages: {
      errors: {
        required: "این فیلد الزامی است",
        invalidEmail: "فرمت ایمیل نامعتبر است",
        passwordTooShort: "رمز عبور باید حداقل ۶ کاراکتر باشد",
        passwordMismatch: "رمز عبور و تکرار آن یکسان نیستند",
        acceptTerms: "لطفاً قوانین و مقررات را بپذیرید",
        selectTopic: "لطفاً موضوعی انتخاب کنید یا وارد کنید",
        uploadImage: "ابتدا تصویری آپلود کنید",
        generateCaption: "ابتدا کپشنی تولید کنید",
        loginRequired: "برای ذخیره پست باید وارد حساب کاربری شوید. آیا می‌خواهید به صفحه ورود بروید؟",
        completeForm: "لطفاً موضوع و کپشن را تکمیل کنید",
        deleteConfirm: "آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟",
        copyFailed: "خطا در کپی کردن",
        unexpected: "خطای غیرمنتظره رخ داد",
        captionGenerationFailed: "خطا در تولید کپشن",
        apiError: "خطا در ارتباط با سرور",
        rateLimitExceeded: "محدودیت تعداد درخواست‌ها. لطفاً چند دقیقه صبر کنید.",
        invalidApiKey: "کلید API نامعتبر است",
        accessDenied: "دسترسی مجاز نیست",
        serverError: "خطای سرور",
        emptyResponse: "پاسخ خالی از سرور دریافت شد",
      },
      success: {
        postSaved: "پست با موفقیت ذخیره شد!",
        postDeleted: "پست حذف شد",
        emailSent: "ایمیل تأیید مجدداً ارسال شد. لطفاً ایمیل خود را چک کنید.",
        passwordResetSent: "لینک بازیابی رمز عبور به ایمیل شما ارسال شد",
        captionGenerated: "کپشن با موفقیت تولید شد!",
        imageCopied: "تصویر کپی شد",
        captionCopied: "کپشن کپی شد",
      },
    },

    // AI Caption Generation
    ai: {
      generating: "در حال تولید کپشن با هوش مصنوعی...",
      regenerate: "تولید مجدد",
      useThisCaption: "استفاده از این کپشن",
      tryAgain: "تلاش مجدد",
      fallbackMessage: "از کپشن پیش‌فرض استفاده شد",
      noApiKey: "کلید API تنظیم نشده است",
      styles: {
        casual: "صمیمی و دوستانه",
        professional: "حرفه‌ای و رسمی",
        creative: "خلاقانه و هنری",
        motivational: "انگیزشی و الهام‌بخش",
      },
      lengths: {
        short: "کوتاه (حداکثر ۵۰ کلمه)",
        medium: "متوسط (۵۰ تا ۱۰۰ کلمه)",
        long: "بلند (۱۰۰ تا ۱۵۰ کلمه)",
      },
    },
  },

  en: {
    // Navigation
    nav: {
      home: "Home",
      dashboard: "Dashboard",
      create: "Create Post",
      login: "Login",
      signup: "Sign Up",
      logout: "Logout",
      settings: "Settings",
    },

    // Common
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      copy: "Copy",
      download: "Download",
      upload: "Upload",
      search: "Search",
      filter: "Filter",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      confirm: "Confirm",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Info",
    },

    // Home Page
    home: {
      title: "PostSazAI",
      subtitle: "Smart Instagram Post Generator",
      hero: {
        title: "Create Your Instagram Post in Seconds",
        subtitle:
            "With PostSaz, choose beautiful templates, upload photos, and get engaging captions. Everything ready for Instagram publishing!",
        cta: "Start Free",
        ctaLoggedIn: "Go to Dashboard",
      },
      features: {
        title: "Why PostSaz?",
        templates: {
          title: "Ready Templates",
          description: "Use professionally designed templates",
        },
        captions: {
          title: "Smart Captions",
          description: "Get engaging captions tailored to your topic",
        },
        download: {
          title: "Easy Download",
          description: "Download your final post and publish on Instagram",
        },
      },
      cta: {
        title: "Ready to Get Started?",
        subtitle: "Create your first post right now",
        button: "Get Started",
      },
    },

    // Auth
    auth: {
      login: {
        title: "Login to Your Account",
        subtitle: "Access your user panel",
        email: "Email",
        password: "Password",
        submit: "Login",
        loading: "Logging in...",
        forgotPassword: "Forgot your password?",
        resendConfirmation: "Resend confirmation email",
        noAccount: "Don't have an account?",
        signupLink: "Sign up",
        continueWithoutSignup: "Continue without signup",
      },
      signup: {
        title: "Create Account",
        subtitle: "Join PostSaz users",
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        acceptTerms: "I agree to the terms and conditions",
        submit: "Sign Up",
        loading: "Signing up...",
        hasAccount: "Already have an account?",
        loginLink: "Login",
      },
      forgotPassword: {
        title: "Reset Password",
        subtitle: "Enter your email address",
        submit: "Send Reset Link",
        loading: "Sending...",
        backToLogin: "Back to Login",
      },
      callback: {
        title: "Email Verification",
        processing: "Verifying your email...",
        success: "Email verified successfully! 🎉",
        successMessage: "Your account is now active. Redirecting to dashboard...",
        error: "Email verification error",
        goToDashboard: "Go to Dashboard",
        goToLogin: "Go to Login",
        backToHome: "Back to Home",
      },
    },

    // Dashboard
    dashboard: {
      title: "User Dashboard",
      subtitle: "Manage posts and view statistics",
      welcome: "Welcome",
      stats: {
        totalPosts: "Total Posts",
        thisWeek: "This Week",
        thisMonth: "This Month",
      },
      quickActions: {
        createPost: {
          title: "Create New Post",
          description: "Create new Instagram post with AI",
        },
        settings: {
          title: "Settings",
          description: "Account settings",
        },
      },
      posts: {
        title: "Saved Posts",
        empty: {
          title: "You haven't created any posts yet",
          description: "Create your first Instagram post",
          cta: "Create First Post",
        },
        actions: {
          copy: "Copy",
          copied: "Copied",
          download: "Download",
          delete: "Delete",
        },
        meta: {
          characters: "characters",
          withImage: "Image",
        },
      },
    },

    // Create Post
    create: {
      title: "Create Instagram Post",
      subtitle: "Create your beautiful and professional post in simple steps",
      template: {
        title: "Choose Template",
        modern: "Modern",
        minimal: "Minimal",
        vibrant: "Vibrant",
      },
      image: {
        title: "Upload Image",
        dragDrop: "Drag your image here or click",
        formats: "JPG, PNG, GIF up to 10MB",
        placeholder: "Upload your image",
      },
      topic: {
        title: "Choose Topic",
        fromList: "Topic from list",
        placeholder: "Select a topic",
        custom: "Custom topic",
        customPlaceholder: "Enter your topic",
      },
      caption: {
        title: "Caption Settings",
        style: "Caption Style",
        styles: {
          casual: "Casual and friendly",
          professional: "Professional and formal",
          creative: "Creative and artistic",
          motivational: "Motivational and inspiring",
        },
        length: "Caption Length",
        lengths: {
          short: "Short",
          medium: "Medium",
          long: "Long",
        },
        generate: "Generate Smart Caption",
        generating: "Generating...",
        edit: "Edit Caption",
        placeholder: "Enter your caption here",
      },
      preview: {
        title: "Post Preview",
        account: "your_account",
      },
      actions: {
        downloadImage: "Download Image Only",
        downloadCaption: "Download Caption",
        savePost: "Save Post",
        saving: "Saving...",
        saveWithoutLogin: "Save Post (Login Required)",
      },
    },

    // Topics
    topics: {
      business: {
        sale: "Sale & Discount",
        marketing: "Marketing",
        product: "Product Introduction",
        service: "Service Introduction",
        business: "Business",
        entrepreneurship: "Entrepreneurship",
        investment: "Investment",
        leadership: "Leadership",
      },
      inspiration: {
        motivational: "Motivational",
        quotes: "Wise Quotes",
        success: "Success",
        mindset: "Positive Mindset",
      },
      education: {
        educational: "Educational",
        tutorial: "Step-by-step Tutorial",
        tips: "Tips & Tricks",
        howto: "How To",
      },
      lifestyle: {
        lifestyle: "Lifestyle",
        daily: "Daily Life",
        wellness: "Health & Wellness",
        selfcare: "Self Care",
      },
      food: {
        food: "Food & Cooking",
        recipe: "Recipe",
        healthyFood: "Healthy Food",
        dessert: "Dessert",
      },
      travel: {
        travel: "Travel & Tourism",
        destination: "Destination Guide",
        adventure: "Adventure",
        culture: "Culture & Tradition",
      },
      fashion: {
        fashion: "Fashion & Style",
        beauty: "Beauty & Makeup",
        skincare: "Skincare",
        style: "Personal Style",
      },
      health: {
        fitness: "Fitness",
        workout: "Workout",
        sports: "Sports",
        yoga: "Yoga & Meditation",
      },
      tech: {
        technology: "Technology",
        apps: "Apps",
        gadgets: "Gadgets",
        ai: "Artificial Intelligence",
      },
      creative: {
        art: "Art",
        photography: "Photography",
        design: "Design",
        music: "Music",
      },
    },

    // Messages
    messages: {
      errors: {
        required: "This field is required",
        invalidEmail: "Invalid email format",
        passwordTooShort: "Password must be at least 6 characters",
        passwordMismatch: "Passwords do not match",
        acceptTerms: "Please accept the terms and conditions",
        selectTopic: "Please select or enter a topic",
        uploadImage: "Please upload an image first",
        generateCaption: "Please generate a caption first",
        loginRequired: "You need to login to save posts. Would you like to go to the login page?",
        completeForm: "Please complete topic and caption",
        deleteConfirm: "Are you sure you want to delete this post?",
        copyFailed: "Failed to copy",
        unexpected: "An unexpected error occurred",
        captionGenerationFailed: "Failed to generate caption",
        apiError: "Error connecting to server",
        rateLimitExceeded: "Rate limit exceeded. Please wait a few minutes.",
        invalidApiKey: "Invalid API key",
        accessDenied: "Access denied",
        serverError: "Server error",
        emptyResponse: "Empty response received from server",
      },
      success: {
        postSaved: "Post saved successfully!",
        postDeleted: "Post deleted",
        emailSent: "Confirmation email resent. Please check your email.",
        passwordResetSent: "Password reset link sent to your email",
        captionGenerated: "Caption generated successfully!",
        imageCopied: "Image copied",
        captionCopied: "Caption copied",
      },
    },

    // AI Caption Generation
    ai: {
      generating: "Generating AI caption...",
      regenerate: "Regenerate",
      useThisCaption: "Use This Caption",
      tryAgain: "Try Again",
      fallbackMessage: "Using default caption",
      noApiKey: "API key not configured",
      styles: {
        casual: "Casual and friendly",
        professional: "Professional and formal",
        creative: "Creative and artistic",
        motivational: "Motivational and inspiring",
      },
      lengths: {
        short: "Short (maximum 50 words)",
        medium: "Medium (50 to 100 words)",
        long: "Long (100 to 150 words)",
      },
    },
  },
} as const

export type TranslationKey = keyof (typeof translations)["fa"]
