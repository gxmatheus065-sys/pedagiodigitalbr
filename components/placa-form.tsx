'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Ubuntu } from 'next/font/google'
import NextImage from 'next/image'

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export function PlacaForm() {
  const router = useRouter()
  const [placa, setPlaca] = useState('')
  const [estrangeira, setEstrangeira] = useState(false)
  const [termos, setTermos] = useState(false)
  const [captchaMarcado, setCaptchaMarcado] = useState(false)

  const placaPreenchida = placa.replace(/[^A-Z0-9]/g, '').length >= 7
  const podeBuscar = placaPreenchida && termos && captchaMarcado

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  if (!podeBuscar) return

  const placaFinal = placa
    .replace(/[^A-Z0-9]/g, '')
    .toUpperCase()

  try {
    const res = await fetch("/api/admin/visitas/registrar", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    placa: placaFinal,
  }),
})

    const data = await res.json()

    if (!data.ok) {
      console.error("Erro ao registrar visita:", data.error)
    } else {
      console.log("Visita registrada!")
    }

  } catch (error) {
    console.error("Falha ao registrar visita:", error)
  }

  router.push(`/debitos?placa=${encodeURIComponent(placaFinal)}`)
}

  function handlePlacaChange(val: string) {
    const novaPlaca = val.toUpperCase()
    setPlaca(novaPlaca)
    if (novaPlaca.replace(/[^A-Z0-9]/g, '').length < 7) {
      setCaptchaMarcado(false)
    }
  }

  return (
    <div
      className={`${ubuntu.className} w-full max-w-[420px] rounded-[14px] bg-[#e9ebf1] p-6 sm:p-8 shadow-2xl text-left box-border`}
    >
      <h2 className="text-[18px] sm:text-[22px] font-regular leading-[1.35] text-[#111111] tracking-tight">
        Informe uma <span className="font-bold">placa</span> válida para consultar:
      </h2>

      <form onSubmit={handleSubmit} className="mt-[18px] sm:mt-[22px] space-y-5 sm:space-y-6">
        <input
          value={placa}
          onChange={(e) => handlePlacaChange(e.target.value)}
          maxLength={8}
          placeholder="DIGITE SUA PLACA"
          className="w-full rounded-[14px] border border-transparent bg-white px-[20px] py-[16px] text-[15px] font-medium tracking-wide text-neutral-800 placeholder:text-neutral-400 outline-none transition-all duration-200 focus:outline-none focus:border-[#93c5fd] focus:shadow-[0_0_12px_rgba(59,130,246,0.45)]"
          aria-label="Digite sua placa"
        />

        <label className="flex cursor-pointer items-start gap-3 text-[14px] font-normal leading-tight text-[#444444] select-none">
          <CheckBox checked={estrangeira} onChange={setEstrangeira} />
          <span className="mt-[1px]">
            Aceito os <span className="underline text-neutral-500">Termos e Condições de Uso</span>.
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 text-[14px] font-normal leading-snug text-[#444444] select-none">
          <CheckBox checked={termos} onChange={setTermos} />
          <span className="mt-[1px]">
            Li e concordo com os <span className="underline text-neutral-500">Termos de uso</span> e{' '}
            <span className="underline text-neutral-500">Políticas de Privacidade</span> da plataforma Pedágio
            Digital.
          </span>
        </label>

        <div className="flex h-[76px] w-full items-center justify-between border border-[#d3d3d3] bg-white pl-3 pr-2 sm:pl-[12px] sm:pr-[8px] py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-none">
          <div className="flex items-center gap-3 sm:gap-[12px]">
            <input
              type="checkbox"
              checked={captchaMarcado}
              disabled={!placaPreenchida}
              onChange={(e) => setCaptchaMarcado(e.target.checked)}
              className="size-[24px] rounded-none border border-[#c1c1c1] bg-white accent-[#2563eb] focus:outline-none disabled:cursor-not-allowed cursor-pointer"
            />
            <span className="text-[13px] sm:text-[14px] font-normal font-sans text-[#222222] tracking-normal select-none">
              Não sou um robô
            </span>
          </div>
          {/* Aumentado o valor negativo no translate-x para puxar a logo para a esquerda */}
          <div className="flex flex-col items-center justify-center text-[8px] text-[#555555] font-sans scale-[0.95] translate-x-[-12px] select-none">
            <NextImage
              src="/images/recaptcha-logo.webp"
              alt="reCAPTCHA"
              width={60}
              height={60}
              className="opacity-95 object-contain"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!podeBuscar}
          className="w-full rounded-[14px] py-[15px] text-[15px] font-bold tracking-wide transition-colors disabled:cursor-not-allowed disabled:bg-[#ccd0da] disabled:text-[#ffffff] enabled:bg-neutral-900 enabled:text-[#e5ff51] enabled:hover:bg-black"
        >
          Buscar débitos
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full text-center text-[16px] font-regular text-neutral-900 underline transition-colors hover:text-black block pt-1"
        >
          Começar agora
        </button>
      </form>
    </div>
  )
}

function CheckBox({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      /* Alterado para size-[18px] (maior) e rounded-none (perfeitamente quadrado) */
      className={`mt-[2px] flex size-[18px] shrink-0 items-center justify-center rounded-none border transition-colors ${
        checked ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-[#b0b6c2] bg-white'
      }`}
    >
      {checked && (
        /* Aumentado o tamanho do ícone interno do check para acompanhar a caixa */
        <svg className="size-3 fill-current" viewBox="0 0 20 20">
          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
        </svg>
      )}
    </button>
  )
}
