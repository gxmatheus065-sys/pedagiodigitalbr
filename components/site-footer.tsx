'use client'

import { useState } from 'react'
import Image from 'next/image'

export function SiteFooter() {
  
  const [isOpen, setIsOpen] = useState(false)

  
  const menuItems = [
    'Pedágio Digital',
    'Motiva',
    'EcoRodovias',
    'Concessionária Novo Litoral',
    'Tamoios',
  ]

  return (
    <footer className="w-full flex flex-col font-sans select-none">
      
  
      <div className="w-full bg-[#111111] text-white border-b border-neutral-900">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full mx-auto max-w-[1200px] flex items-center justify-between px-6 py-3.5 cursor-pointer hover:bg-neutral-900 transition-colors focus:outline-none"
        >
          <span className="text-[16px] font-bold tracking-wide">
            Central de atendimento
          </span>
          
          <svg 
            className={`size-6 text-white opacity-80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      
      {isOpen && (
        <div className="w-full bg-[#e9ebf1] text-[#111111]">
          <div className="mx-auto max-w-[1200px] px-6 py-2 flex flex-col">
            {menuItems.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-3.5 border-b border-neutral-300/60 last:border-none cursor-pointer hover:bg-black/5 px-2 transition-colors"
              >
                <span className="text-[16px] font-bold text-black">
                  {item}
                </span>
                <svg 
                  className="size-4 text-neutral-500" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      
      <div className="w-full bg-[#333333] text-white py-6">
        <div className="mx-auto max-w-[1200px] flex flex-col items-center justify-between gap-6 px-6 md:flex-row md:gap-0">
          
          
          <div className="flex items-center justify-start min-w-[200px]">
            <Image 
              src="/images/logo.png" 
              alt="Pedágio Digital" 
              width={160} 
              height={45} 
              className="object-contain"
              priority
            />
          </div>

      
          <div className="text-center text-[11px] text-neutral-300 font-normal tracking-wide max-w-[400px] leading-relaxed">
           Inovap 5 Administração e Participações LTDA - 11.964.190/0001-83
          </div>

         
          <div className="flex items-center justify-end gap-6 min-w-[200px]">
            <Image 
              src="/images/logo-motiva.jpg" 
              alt="Logo Motiva" 
              width={75} 
              height={22} 
              className="object-contain opacity-80"
            />
            <Image 
              src="/images/logo-eco.png" 
              alt="Logo Ecorodovias" 
              width={85} 
              height={22} 
              className="object-contain opacity-80"
            />
          </div>

        </div>
      </div>
    </footer>
  )
}
