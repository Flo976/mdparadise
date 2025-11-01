"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/provider";
import { locales, localeNames, localeFlagCodes, type Locale } from "@/lib/i18n/config";

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        title="Change language"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`fi fi-${localeFlagCodes[locale]} text-xl rounded shadow-sm`}></span>
        <span className="sr-only">Change language</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[150px] rounded-md border bg-popover p-1 shadow-md">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocale(loc as Locale);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-sm hover:bg-accent transition-colors ${
                  locale === loc ? "bg-accent" : ""
                }`}
              >
                <span className={`fi fi-${localeFlagCodes[loc]} rounded shadow-sm`}></span>
                <span>{localeNames[loc]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
