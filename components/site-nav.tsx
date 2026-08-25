'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export function SiteNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="absolute inset-0 h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />

      <div className="relative mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5 md:px-0">
        <Image
          src="/images/logo.png"
          alt="Maranhão Pedágios"
          width={170}
          height={60}
          priority
          className="h-auto w-[140px] object-contain md:w-[200px] lg:w-[260px]"
        />

     
        <nav className="hidden items-center gap-3 sm:flex">
          <button className="hidden cursor-pointer rounded-md px-3 py-2 text-md font-regular text-white/90 transition hover:bg-white/10 hover:text-white sm:block">
            Fazer Login
          </button>
          <button className="hidden cursor-pointer rounded-md px-3 py-2 text-md font-regular text-white/90 transition hover:bg-white/10 hover:text-white md:block">
            Perguntas frequentes
          </button>
          <button className="hidden cursor-pointer rounded-md px-3 py-2 text-md font-regular text-white/90 transition hover:bg-white/10 hover:text-white md:block">
            Solicitar recibo
          </button>
          <button className="cursor-pointer rounded-lg border border-white/60 px-5 py-2.5 text-sm font-regular text-white transition hover:bg-white/10 hover:text-white">
            Criar Conta
          </button>
        </nav>

       
        <button
          className="flex items-center justify-center text-white sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      
      {open && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white backdrop-blur-sm px-6 py-4 flex flex-col gap-1">
          <button className="w-full rounded-md px-3 py-3 text-center text-black/90 transition hover:bg-white/10">
            Fazer Login
          </button>
          <button className="w-full rounded-md px-3 py-3 text-center text-black/90 transition hover:bg-white/10">
            Perguntas frequentes
          </button>
          <button className="w-full rounded-md px-3 py-3 text-center text-black/90 transition hover:bg-white/10">
            Solicitar recibo
          </button>
          
        </div>
      )}
    </header>
  )
}