import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
    title: " پست ساز | هوش مصنوعی ساخت پست  - ابزار تولید پست اینستاگرام",
    description: "با پُست‌ساز به راحتی پست‌های زیبا و حرفه‌ای برای اینستاگرام بسازید",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    const google = process.env.NODE_ENV === "production"
    return (
        <html lang="fa" dir="rtl">
        <head>
            <meta name="google-site-verification" content="qq4zUcYEqYDO0PX5NJuJUwRgIvpLEtOJ9UpLR9URa2o" />
        </head>
        <body>
        <AuthProvider>{children}</AuthProvider>
        </body>
        {google && <GoogleAnalytics gaId='G-4RFLC0QEH5' />}
        </html>
    )
}
