'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Car, Check, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ModalAtencao } from '@/components/modal-atencao'
import { Ubuntu } from 'next/font/google'

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export function DebitosClient({ placa }: { placa: string }) {
  const router = useRouter()
  const [modalAberto, setModalAberto] = useState(true)
  const [selecionado, setSelecionado] = useState(true)

  const [dataAtual, setDataAtual] = useState('')
  const [dataVencimento, setDataVencimento] = useState('')

  useEffect(() => {
    const agora = new Date()

    const dia = String(agora.getDate()).padStart(2, '0')
    const mes = String(agora.getMonth() + 1).padStart(2, '0')
    const ano = agora.getFullYear()
    const horas = String(agora.getHours()).padStart(2, '0')
    const minutos = String(agora.getMinutes()).padStart(2, '0')
    setDataAtual(`${dia}/${mes}/${ano} - ${horas}:${minutos}`)

    const ontem = new Date()
    ontem.setDate(agora.getDate() - 1)
    const diaO = String(ontem.getDate()).padStart(2, '0')
    const mesO = String(ontem.getMonth() + 1).padStart(2, '0')
    const anoO = ontem.getFullYear()
    setDataVencimento(`${diaO}/${mesO}/${anoO}`)
  }, [])

  const total = 'R$ 67,19'

  return (
    <div className={`${ubuntu.className} min-h-screen bg-[#f4f5f8] pb-40 text-left`}>
      <PageHeader title="Débitos" showBack={false} showHome />

      <div className="relative mx-auto mt-0 h-56 max-w-[1160px] overflow-hidden md:h-64">
        <Image
          src="/images/banner-carro.png"
          alt="Amigos felizes dirigindo em um carro"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
          <div className="mx-auto max-w-[750px]">
            <div className="mb-3 flex items-center gap-2 text-white drop-shadow">
              <Image
                src="/images/car.png"
                alt="Ícone de Carro"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-[16px]">Seus veículos:</span>
            </div>

            <div className="rounded-xl bg-white px-5 py-4 shadow-lg border border-neutral-100">
              <span className="text-[16px] font-bold text-neutral-800 tracking-wide">{placa}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-[820px] px-5">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-neutral-100">
          <div className="flex items-baseline justify-between border-b border-neutral-100 pb-5">
            <h2 className="text-[22px] font-bold text-black">Débitos</h2>
            <p className="text-[11px] font-normal text-neutral-400">
              Atualizado em:{' '}
              <span className="font-medium text-neutral-600">{dataAtual || 'Carregando...'}</span>
            </p>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 py-1.5 select-none">
            <CheckBox checked={selecionado} onChange={setSelecionado} />
            <span className="text-[14px] font-medium text-neutral-700">
              Selecionar 1 passagens em aberto
            </span>
          </label>

          <div className="my-4 h-px w-full bg-neutral-100" />

          <div className="flex items-start gap-3 pt-2">
            <CheckBox checked={selecionado} onChange={setSelecionado} />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[16px] font-bold text-black tracking-wide">
                  {placa}
                </span>

                <span className="text-[12px] font-medium text-[#c24141]  border border-[#a20202] px-2.5 py-0.5 rounded-sm">
                  Venceu em {dataVencimento || '...'}
                </span>
              </div>

              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="space-y-0.5 text-[14px] text-neutral-500 font-normal leading-relaxed">
                  <p>15/08/2026</p>
                  <p>CCR Rodovias</p>
                </div>

                <div className="space-y-0.5 text-right text-[13px] text-neutral-500 font-normal leading-normal">
                  <p className="text-[#c24141]">R$ 65,91</p>
                  <p>Juros: R$ 1,28</p>
                  <p className="text-[15px] font-normal text-black pt-1">
                    <span className=" py-0.5 rounded-sm font-medium text-neutral-500 text-[13px]">
                      Total
                    </span>
                    : <span className="font-bold">{total}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-[820px] px-5 pb-5">
          <div className="rounded-2xl bg-white p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.06),0_15px_30px_rgba(0,0,0,0.1)] flex flex-col border border-neutral-100">
            <div className="flex justify-end mb-2">
              <ChevronUp className="size-4 text-neutral-800" strokeWidth={3} />
            </div>

            <div className="w-full h-[1px] bg-neutral-200/80 mb-5" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-black tracking-tight">Total a pagar:</p>
                <p className="text-[28px] font-black text-black leading-none mt-1">{total}</p>
              </div>
              <button
                onClick={() =>
                  router.push(`/pagamento?placa=${encodeURIComponent(placa)}`)
                }
                className="rounded-[14px] bg-black px-8 py-3.5 text-base font-bold text-[#e5ff51] transition-colors hover:bg-neutral-900 focus:outline-none"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalAberto && (
        <ModalAtencao onContinue={() => setModalAberto(false)} />
      )}
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
      className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
        checked
          ? 'border-neutral-900 bg-neutral-900 text-white'
          : 'border-neutral-400 bg-white'
      }`}
    >
      {checked && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  )
}
