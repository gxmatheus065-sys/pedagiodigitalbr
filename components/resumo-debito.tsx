'use client'

import { useState, useEffect } from 'react'

export function ResumoDebito({ placa }: { placa: string }) {
  const [dataVencimento, setDataVencimento] = useState('')

  useEffect(() => {
    const agora = new Date()
    
    // REGRA DE SEGURANÇA/URGÊNCIA: Subtrai exatamente 1 dia da data atual de hoje
    const dataRetroativa = new Date()
    dataRetroativa.setDate(agora.getDate() - 1)
    
    // Formata a data no padrão brasileiro (DD/MM/AAAA)
    setDataVencimento(dataRetroativa.toLocaleDateString('pt-BR'))
  }, [])

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg font-bold text-neutral-900">{placa}</span>
        <span className="rounded-md border border-destructive px-2.5 py-1 text-xs font-semibold text-destructive">
          Venceu em {dataVencimento || '...'}
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="space-y-1 text-sm text-neutral-500">
          {/* Data inferior dinâmica sincronizada com o vencimento do débito */}
          <p>{dataVencimento || '...'}</p>
          <p>CCR Rodovias</p>
        </div>
        <div className="space-y-1 text-right text-sm">
          <p className="text-xl font-bold text-destructive">R$ 65,91</p>
          <p className="text-neutral-400">Juros: R$ 1,28</p>
          <p className="font-bold text-neutral-900">Total: R$ 67,19</p>
        </div>
      </div>
    </div>
  )
}
