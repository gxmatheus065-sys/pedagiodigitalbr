'use client'

import { useState } from 'react'
import { ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react'

export function CentralAtendimento() {
  const [open, setOpen] = useState(false)

  return (
    <section className="bg-neutral-800 text-white">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between py-6 text-left"
          aria-expanded={open}
        >
          <span className="text-lg font-semibold">Central de atendimento</span>
          <ChevronDown
            className={`size-5 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="grid gap-4 pb-8 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-neutral-700/60 p-4">
              <Phone className="size-5 text-lime" />
              <div>
                <p className="text-sm text-white/60">Telefone</p>
                <p className="text-sm font-medium">0800 000 0000</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-neutral-700/60 p-4">
              <MessageCircle className="size-5 text-lime" />
              <div>
                <p className="text-sm text-white/60">WhatsApp</p>
                <p className="text-sm font-medium">(11) 90000-0000</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-neutral-700/60 p-4">
              <Mail className="size-5 text-lime" />
              <div>
                <p className="text-sm text-white/60">E-mail</p>
                <p className="text-sm font-medium">contato@maranhaopedagios.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
