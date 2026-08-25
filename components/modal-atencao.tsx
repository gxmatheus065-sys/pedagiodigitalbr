'use client'

import { TriangleAlert } from 'lucide-react'
import { useState, useEffect } from 'react'

export function ModalAtencao({ onContinue }: { onContinue: () => void }) {
  const [tempoReal, setTempoReal] = useState('')

  useEffect(() => {
    const agora = new Date()

    // 1. LÓGICA DO PRAZO: Adiciona rigorosamente 15 minutos ao horário atual do navegador
    const dataComPrazo = new Date(agora.getTime() + 15 * 60 * 1000)

    // 2. Array para traduzir o dia da semana com base na data do vencimento
    const diasSemana = [
      'domingo',
      'segunda-feira',
      'terça-feira',
      'quarta-feira',
      'quinta-feira',
      'sexta-feira',
      'sábado'
    ]
    const diaTexto = diasSemana[dataComPrazo.getDay()]

    // 3. Formata as horas e minutos do vencimento com dois dígitos (Ex: 13:30)
    const horas = String(dataComPrazo.getHours()).padStart(2, '0')
    const minutos = String(dataComPrazo.getMinutes()).padStart(2, '0')

    // 4. Monta a string dinâmica final de vencimento direto
    setTempoReal(`Hoje, ${diaTexto} às ${horas}:${minutos}`)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 select-none">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="h-1.5 w-full bg-destructive" />
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center gap-2 text-destructive">
            <TriangleAlert className="size-5" />
            <span className="text-sm font-bold uppercase tracking-wide">
              Atenção
            </span>
          </div>

          <h2 className="mt-4 text-center text-xl font-bold text-neutral-900">
            Débitos em aberto encontrados
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-neutral-700">
            <span className="font-semibold text-destructive">
              {tempoReal || 'Carregando...'}
            </span>{' '}
            - Caso não realize o pagamento, a multa será automaticamente
            encaminhada ao DETRAN. Após esse prazo de 15 minutos, o sistema
            emitirá automaticamente a multa de{' '}
            <span className="font-semibold text-destructive">R$ 195,23</span> e{' '}
            <span className="font-semibold text-destructive">
              5 pontos na CNH
            </span>
            .
          </p>

          <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-bold text-neutral-900">
              Art. 209-A - CTB:
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Conforme o Art. 209-A do CTB: &quot;Efetuar o pagamento de pedágio
              eletrônico fora do prazo estabelecido pelo órgão...&quot;
            </p>
            <p className="mt-3 text-sm text-neutral-700">
              Infração:{' '}
              <span className="font-semibold text-destructive">Grave.</span>
            </p>
            <p className="text-sm text-neutral-700">
              Penalidade:{' '}
              <span className="font-semibold text-destructive">
                Multa de R$ 195,23.
              </span>
            </p>
            <p className="text-sm text-neutral-700">
              Pontuação:{' '}
              <span className="font-semibold text-destructive">
                5 pontos na CNH.
              </span>
            </p>
          </div>

          <button
            onClick={onContinue}
            className="mt-6 w-full rounded-lg bg-black py-4 text-base font-bold uppercase tracking-wide text-lime transition-colors hover:bg-neutral-900"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
