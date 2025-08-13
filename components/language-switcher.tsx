"use client"

import React, { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { locales, localeNames, localeFlags, type Locale } from "@/lib/i18n/config"
import { addLocaleToPathname, removeLocaleFromPathname } from "@/lib/i18n"

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLocaleChange = (newLocale: Locale) => {
    const cleanPathname = removeLocaleFromPathname(pathname)
    const newPathname = addLocaleToPathname(cleanPathname, newLocale)

    // Store locale preference
    localStorage.setItem("preferred-locale", newLocale)

    router.push(newPathname)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          {localeFlags[currentLocale]}
          <span className="hidden sm:inline">
            {localeFlags[currentLocale]} {localeNames[currentLocale]}
          </span>
          <span className="sm:hidden">
            <img
                src={`${currentLocale === 'en' ? '/flags/us.png' : '/flags/ir.png'}`}
                alt="postsazAI"
                className="max-w-full h-3 mx-auto object-cover"
            />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
            <DropdownMenuItem
                key={locale}
                onClick={() => handleLocaleChange(locale)}
            className={`gap-2 ${currentLocale === locale ? "bg-accent" : ""}`}
          >
            <span>
              <img
                  src={`${locale === 'en' ? '/flags/us.png' : '/flags/ir.png'}`}
                  alt="postsazAI"
                  className="max-w-full h-3 mx-auto object-cover"
              />
            </span>
            <span>{localeNames[locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
