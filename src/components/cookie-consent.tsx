import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik"
import { LuCookie, LuX, LuSettings, LuCheck } from "@qwikest/icons/lucide"
import type { CookieConsent } from "~/lib/gdpr"
import { DEFAULT_CONSENT } from "~/lib/gdpr"

/**
 * Cookie Consent Banner Component
 * GDPR-compliant cookie consent management
 */
export const CookieConsentBanner = component$(() => {
  const showBanner = useSignal(false)
  const showSettings = useSignal(false)
  const consent = useSignal<CookieConsent>(DEFAULT_CONSENT)

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // Check if consent has been given
    const savedConsent = localStorage.getItem("cookie-consent")
    if (!savedConsent) {
      showBanner.value = true
    } else {
      try {
        consent.value = JSON.parse(savedConsent)
      } catch (e) {
        console.error("Error parsing consent:", e)
        showBanner.value = true
      }
    }
  })

  const saveConsent = $((newConsent: CookieConsent) => {
    consent.value = newConsent
    localStorage.setItem("cookie-consent", JSON.stringify(newConsent))
    
    // Set cookie
    document.cookie = `cookie-consent=${encodeURIComponent(JSON.stringify(newConsent))}; max-age=31536000; path=/; SameSite=Strict; Secure`
    
    showBanner.value = false
    showSettings.value = false
  })

  const acceptAll = $(() => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    })
  })

  const acceptNecessary = $(() => {
    saveConsent(DEFAULT_CONSENT)
  })

  const toggleSetting = $((key: keyof CookieConsent) => {
    if (key === "necessary") return // Can't disable necessary cookies
    consent.value = {
      ...consent.value,
      [key]: !consent.value[key],
    }
  })

  if (!showBanner.value) return null

  return (
    <div class="fixed inset-x-0 bottom-0 z-50 pb-4 sm:pb-6">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-900/10">
          {/* Main Banner */}
          {!showSettings.value && (
            <>
              <div class="flex items-start gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-pink-100">
                  <LuCookie class="h-6 w-6 text-pink-600" />
                </div>
                
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">
                    Kami Menggunakan Cookie
                  </h3>
                  <p class="mt-2 text-sm text-gray-600">
                    Kami menggunakan cookie untuk meningkatkan pengalaman Anda di website undangan pernikahan kami. 
                    Cookie membantu kami mengingat preferensi Anda dan menganalisis performa website.
                  </p>
                  
                  <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      onClick$={acceptAll}
                      class="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-pink-700 transition-colors"
                    >
                      <LuCheck class="h-4 w-4" />
                      Terima Semua
                    </button>
                    
                    <button
                      onClick$={acceptNecessary}
                      class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      Hanya Yang Diperlukan
                    </button>
                    
                    <button
                      onClick$={() => (showSettings.value = true)}
                      class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <LuSettings class="h-4 w-4" />
                      Pengaturan
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Settings Panel */}
          {showSettings.value && (
            <>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">
                  Pengaturan Cookie
                </h3>
                <button
                  onClick$={() => (showSettings.value = false)}
                  class="text-gray-400 hover:text-gray-600"
                >
                  <LuX class="h-5 w-5" />
                </button>
              </div>

              <div class="space-y-4">
                {/* Necessary Cookies */}
                <div class="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h4 class="font-medium text-gray-900">Cookie Yang Diperlukan</h4>
                      <span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Wajib
                      </span>
                    </div>
                    <p class="mt-1 text-sm text-gray-600">
                      Cookie esensial untuk fungsi dasar website seperti navigasi dan akses ke area aman.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked
                    disabled
                    class="h-5 w-5 rounded border-gray-300 text-pink-600"
                  />
                </div>

                {/* Analytics Cookies */}
                <div class="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">Cookie Analitik</h4>
                    <p class="mt-1 text-sm text-gray-600">
                      Membantu kami memahami bagaimana pengunjung berinteraksi dengan website untuk meningkatkan pengalaman.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.value.analytics}
                    onClick$={() => toggleSetting("analytics")}
                    class="h-5 w-5 rounded border-gray-300 text-pink-600 cursor-pointer"
                  />
                </div>

                {/* Preferences Cookies */}
                <div class="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">Cookie Preferensi</h4>
                    <p class="mt-1 text-sm text-gray-600">
                      Mengingat pilihan Anda seperti bahasa dan region untuk memberikan pengalaman yang dipersonalisasi.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.value.preferences}
                    onClick$={() => toggleSetting("preferences")}
                    class="h-5 w-5 rounded border-gray-300 text-pink-600 cursor-pointer"
                  />
                </div>

                {/* Marketing Cookies */}
                <div class="flex items-start justify-between rounded-lg border border-gray-200 p-4">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">Cookie Marketing</h4>
                    <p class="mt-1 text-sm text-gray-600">
                      Digunakan untuk menampilkan konten yang relevan dengan minat Anda.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent.value.marketing}
                    onClick$={() => toggleSetting("marketing")}
                    class="h-5 w-5 rounded border-gray-300 text-pink-600 cursor-pointer"
                  />
                </div>
              </div>

              <div class="mt-6 flex gap-3">
                <button
                  onClick$={() => saveConsent(consent.value)}
                  class="flex-1 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-pink-700 transition-colors"
                >
                  Simpan Pengaturan
                </button>
                <button
                  onClick$={acceptAll}
                  class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Terima Semua
                </button>
              </div>
            </>
          )}

          {/* Privacy Policy Link */}
          <p class="mt-4 text-center text-xs text-gray-500">
            Dengan melanjutkan, Anda menyetujui{" "}
            <a href="/privacy" class="text-pink-600 hover:text-pink-700 underline">
              Kebijakan Privasi
            </a>{" "}
            kami
          </p>
        </div>
      </div>
    </div>
  )
})
