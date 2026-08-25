'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Home } from 'lucide-react'

export function PageHeader({
  title,
  showBack = true,
  showHome = false,
}: {
  title: string
  showBack?: boolean
  showHome?: boolean
}) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
      <div className="relative mx-auto flex h-16 max-w-[1400px] items-center justify-center px-6">
        {showBack && (
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="absolute left-6 flex size-9 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-100"
          >
            <ChevronLeft className="size-5" strokeWidth={2.5} />
          </button>
        )}

        {showHome && (
          <button
            onClick={() => router.push('/')}
            aria-label="Voltar ao início"
            className="absolute left-6 flex size-9 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-100"
          >
            <Home className="size-5" strokeWidth={2.5} />
          </button>
        )}

        <h1 className="text-lg font-bold text-neutral-900">{title}</h1>
      </div>
    </header>
  )
}