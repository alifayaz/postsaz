import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { GoogleAnalytics } from '@next/third-parties/google';
import { defaultLocale } from "@/lib/i18n/config"
import { createTranslator } from "@/lib/i18n"

const { t } = createTranslator(defaultLocale)

export const metadata: Metadata = {
    title: t("home.title") + " - " + t("home.subtitle"),
    description: t("home.hero.subtitle"),
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    const google = process.env.NODE_ENV === "production"
    return (
        <html>
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
