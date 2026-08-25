"use client"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"

type Pedido = {
  id: string
  placa: string
  status: string
  valor: number
  nome_cliente: string
  email_cliente: string
  telefone_cliente: string
  criado_em: string
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "#D97706",
  pago: "#059669",
  cancelado: "#DC2626",
  enviado: "#0891B2",
}

export default function PedidosPage() {
  const [aba, setAba] = useState("pedidos")
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loadingPedidos, setLoadingPedidos] = useState(true)

  const [pixAtual, setPixAtual] = useState<{ valor: string; nome: string } | null>(null)
  const [pixValor, setPixValor] = useState("")
  const [pixNome, setPixNome] = useState("")
  const [pixMsg, setPixMsg] = useState("")
  const [pixLoading, setPixLoading] = useState(false)

  const [modoPagamento, setModoPagamento] = useState<"pix" | "podpay">("pix")
  const [modoLoading, setModoLoading] = useState(false)
  const [modoMsg, setModoMsg] = useState("")

  const [confirmando, setConfirmando] = useState(false)
  const [limparMsg, setLimparMsg] = useState("")
  const [limparLoading, setLimparLoading] = useState(false)

  const [ultimoTotalPedidos, setUltimoTotalPedidos] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [visitas, setVisitas] = useState<{ id: string; placa: string; ip: string; criado_em: string }[]>([])
  const [loadingVisitas, setLoadingVisitas] = useState(true)

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")

    fetch("/api/admin/pedidos")
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setPedidos(d.data)
          setUltimoTotalPedidos(d.data.length)
        }
      })
      .finally(() => setLoadingPedidos(false))

    fetch("/api/admin/pix")
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.data) setPixAtual(d.data)
      })

    fetch("/api/admin/modo-pagamento")
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.modo) setModoPagamento(d.modo)
      })

    fetch("/api/admin/visitas")
      .then(r => r.json())
      .then(d => {
        if (d.ok) setVisitas(d.data)
      })
      .catch(err => console.error("Erro ao buscar visitas:", err))
      .finally(() => setLoadingVisitas(false))
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/pedidos")
        const d = await res.json()
        if (!d.ok) return
        if (d.data.length > ultimoTotalPedidos) {
          const audio = new Audio("/notification.mp3")
          audio.play().catch(err => console.error("ERRO AUDIO:", err))
          alert(`💰 Novo PIX recebido!\n\nPedidos totais: ${d.data.length}`)
        }
        setUltimoTotalPedidos(d.data.length)
        setPedidos(d.data)
      } catch (err) {
        console.error(err)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [ultimoTotalPedidos])

  const totalPix = pedidos.reduce((soma, p) => soma + Number(p.valor || 0), 0)

  // Estatísticas de visitas: total, hoje, última hora, IPs únicos
  const agora = new Date()
  const visitasHoje = visitas.filter(v => {
    const d = new Date(v.criado_em)
    return d.toDateString() === agora.toDateString()
  }).length
  const visitasUltimaHora = visitas.filter(v => {
    const d = new Date(v.criado_em)
    return agora.getTime() - d.getTime() <= 60 * 60 * 1000
  }).length
  const ipsUnicos = new Set(visitas.map(v => v.ip)).size

  // Contagem de visitas por hora do dia (0h a 23h), somando todos os dias
  const visitasPorHora = Array.from({ length: 24 }, (_, hora) => ({
    hora,
    total: visitas.filter(v => new Date(v.criado_em).getHours() === hora).length,
  }))
  const maxVisitasHora = Math.max(1, ...visitasPorHora.map(h => h.total))

  async function salvarPix() {
    setPixLoading(true)
    setPixMsg("")
    try {
      const res = await fetch("/api/admin/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: pixValor, nome: pixNome }),
      })
      const d = await res.json()
      if (d.ok) {
        setPixMsg("✅ Chave Pix atualizada!")
        setPixAtual({ valor: pixValor, nome: pixNome })
        setPixValor("")
        setPixNome("")
      } else {
        setPixMsg("❌ Erro: " + d.error)
      }
    } catch (err) {
      console.error("Erro ao salvar Pix:", err)
      setPixMsg("❌ Erro de conexão ao salvar. Veja o console.")
    } finally {
      setPixLoading(false)
    }
  }

  async function salvarModo(novo: "pix" | "podpay") {
    setModoLoading(true)
    setModoMsg("")
    try {
      const res = await fetch("/api/admin/modo-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: novo }),
      })
      const d = await res.json()
      if (d.ok) {
        setModoPagamento(novo)
        setModoMsg(`✅ Modo alterado para ${novo === "pix" ? "PIX Local" : "PodPay"}!`)
      } else {
        setModoMsg("❌ Erro: " + d.error)
      }
    } catch (err) {
      console.error("Erro ao salvar modo:", err)
      setModoMsg("❌ Erro de conexão ao salvar. Veja o console.")
    } finally {
      setModoLoading(false)
    }
  }

  async function limparTudo() {
    setLimparLoading(true)
    try {
      const res = await fetch("/api/admin/limpar", { method: "POST" })
      const d = await res.json()
      if (d.ok) {
        setLimparMsg("✅ Todos os pedidos foram apagados.")
        setPedidos([])
      } else {
        setLimparMsg("❌ Erro: " + d.error)
      }
    } catch (err) {
      console.error("Erro ao limpar pedidos:", err)
      setLimparMsg("❌ Erro de conexão. Veja o console.")
    } finally {
      setLimparLoading(false)
      setConfirmando(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  function baixarListaTelefonica() {
    const linhas = pedidos.map(p => `${p.nome_cliente} - ${p.telefone_cliente}`)
    const conteudo = linhas.join("\n")
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "lista_telefonica.txt"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const abas = [
    { id: "pedidos", label: "🛒 Pedidos" },
    { id: "visitas", label: "📊 Visitas" },
    { id: "pix", label: "🔑 Trocar Chave Pix" },
    { id: "pagamento", label: "⚙️ Modo de Pagamento" },
    { id: "limpar", label: "🗑️ Limpar Dados" },
  ]

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <Image src="/favicon.ico" alt="Logo" width={22} height={22} style={{ objectFit: "contain" }} />
            <span>Painel Admin</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost">Sair</button>
        </div>
      </header>

      <section className="ledger">
        <div className="ledger-inner">
          <span className="ledger-eyebrow">Total Pix gerado</span>
          <div className="ledger-value">
            {totalPix.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <span className="ledger-sub">
            {loadingPedidos ? "carregando…" : `${pedidos.length} pedido${pedidos.length === 1 ? "" : "s"} no total`}
          </span>
        </div>
      </section>

      <nav className="nav-wrap">
        <div className="nav">
          {abas.map(a => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`nav-btn ${aba === a.id ? "active" : ""}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="content">

        {aba === "pedidos" && (
          <div className="container-wide">
            <p className="meta-text">
              {loadingPedidos ? "Carregando..." : `${pedidos.length} pedido(s) encontrado(s)`}
            </p>
            <div className="card table-card">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {["Placa", "Status", "Valor", "Nome", "Email", "Telefone", "Data"].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map(p => (
                      <tr key={p.id}>
                        <td className="cell-strong mono">{p.placa}</td>
                        <td>
                          <span className="status-pill" style={{ background: STATUS_COLORS[p.status] ?? "#888" }}>
                            {p.status}
                          </span>
                        </td>
                        <td className="cell-money mono">
                          {Number(p.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td>{p.nome_cliente}</td>
                        <td className="mono">{p.email_cliente}</td>
                        <td className="mono">{p.telefone_cliente}</td>
                        <td className="mono muted">{new Date(p.criado_em).toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="actions-row">
              <button onClick={baixarListaTelefonica} disabled={pedidos.length === 0} className="btn btn-primary">
                📞 Baixar lista telefônica (.txt)
              </button>
            </div>
          </div>
        )}

        {aba === "visitas" && (
          <div className="container-wide">
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-label">Total de visitas</span>
                <span className="stat-value">{loadingVisitas ? "…" : visitas.length}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Hoje</span>
                <span className="stat-value">{loadingVisitas ? "…" : visitasHoje}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Última hora</span>
                <span className="stat-value">{loadingVisitas ? "…" : visitasUltimaHora}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">IPs únicos</span>
                <span className="stat-value">{loadingVisitas ? "…" : ipsUnicos}</span>
              </div>
            </div>

            <div className="card" style={{ marginTop: "1.25rem" }}>
              <h2 className="card-title" style={{ marginBottom: "1rem" }}>Visitas por horário do dia</h2>
              <div className="hour-chart">
                {visitasPorHora.map(h => (
                  <div key={h.hora} className="hour-bar-wrap" title={`${h.hora}h — ${h.total} visita(s)`}>
                    <div
                      className="hour-bar"
                      style={{ height: `${Math.max(4, (h.total / maxVisitasHora) * 90)}px` }}
                    />
                    <span className="hour-label">{h.hora}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="meta-text" style={{ marginTop: "1.5rem" }}>
              {loadingVisitas ? "Carregando..." : `${visitas.length} visita(s) registrada(s)`}
            </p>
            <div className="card table-card">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {["Placa", "IP", "Data / Hora"].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visitas.map(v => (
                      <tr key={v.id}>
                        <td className="cell-strong mono">{v.placa}</td>
                        <td className="mono">{v.ip}</td>
                        <td className="mono muted">{new Date(v.criado_em).toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {aba === "pix" && (
          <div className="container-narrow">
            <div className="card">
              <h2 className="card-title">🔑 Trocar Chave Pix</h2>

              {pixAtual && (
                <div className="info-box info-success">
                  <p className="info-title">Chave ativa</p>
                  <p className="info-line"><strong>Nome:</strong> {pixAtual.nome}</p>
                  <p className="info-line mono break"><strong>Chave:</strong> {pixAtual.valor}</p>
                </div>
              )}

              <div className="field">
                <label>Nome / Identificação</label>
                <input type="text" placeholder="Ex: Conta principal..." value={pixNome} onChange={e => setPixNome(e.target.value)} />
              </div>

              <div className="field">
                <label>Nova Chave Pix</label>
                <input type="text" placeholder="CPF, CNPJ, email, telefone ou chave aleatória" value={pixValor} onChange={e => setPixValor(e.target.value)} />
              </div>

              {pixMsg && <p className={`msg ${pixMsg.startsWith("✅") ? "msg-ok" : "msg-err"}`}>{pixMsg}</p>}

              <button onClick={salvarPix} disabled={pixLoading || !pixValor || !pixNome} className="btn btn-primary btn-block">
                {pixLoading ? "Salvando..." : "Salvar Chave"}
              </button>
            </div>
          </div>
        )}

        {aba === "pagamento" && (
          <div className="container-narrow">
            <div className="card">
              <h2 className="card-title">⚙️ Modo de Pagamento</h2>
              <p className="card-desc">Escolha como o checkout vai processar os pagamentos.</p>

              <div
                onClick={() => !modoLoading && salvarModo("pix")}
                className={`payment-option variant-pix ${modoPagamento === "pix" ? "active" : ""}`}
              >
                <span className="payment-icon">🏦</span>
                <div>
                  <p className="payment-name">PIX Local {modoPagamento === "pix" && <span className="tag-ativo">✓ ATIVO</span>}</p>
                  <p className="payment-desc">QR Code gerado com sua chave Pix cadastrada. Confirmação manual.</p>
                </div>
              </div>

              <div
                onClick={() => !modoLoading && salvarModo("podpay")}
                className={`payment-option variant-podpay ${modoPagamento === "podpay" ? "active" : ""}`}
              >
                <span className="payment-icon">⚡</span>
                <div>
                  <p className="payment-name">PodPay {modoPagamento === "podpay" && <span className="tag-ativo">✓ ATIVO</span>}</p>
                  <p className="payment-desc">Gateway de pagamento. Requer chaves configuradas no Vercel.</p>
                </div>
              </div>

              {modoMsg && <p className={`msg ${modoMsg.startsWith("✅") ? "msg-ok" : "msg-err"}`}>{modoMsg}</p>}
              {modoLoading && <p className="msg-loading">Salvando...</p>}
            </div>
          </div>
        )}

        {aba === "limpar" && (
          <div className="container-narrow">
            <div className="card">
              <h2 className="card-title">🗑️ Limpar Dados</h2>
              <div className="info-box info-danger">
                ⚠️ Esta ação apaga <strong>todos os pedidos</strong> permanentemente. Não pode ser desfeita.
              </div>

              {!confirmando ? (
                <button onClick={() => setConfirmando(true)} className="btn btn-danger btn-block">
                  Limpar todos os pedidos
                </button>
              ) : (
                <div>
                  <p className="confirm-text">Tem certeza? Não pode ser desfeito.</p>
                  <div className="confirm-row">
                    <button onClick={limparTudo} disabled={limparLoading} className="btn btn-danger">
                      {limparLoading ? "Apagando..." : "Sim, apagar tudo"}
                    </button>
                    <button onClick={() => setConfirmando(false)} className="btn btn-secondary">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              {limparMsg && <p className={`msg ${limparMsg.startsWith("✅") ? "msg-ok" : "msg-err"}`}>{limparMsg}</p>}
            </div>
          </div>
        )}

      </main>

      <style jsx>{`
        .page {
          --bg: #f4f5f7;
          --surface: #ffffff;
          --border: #e3e6eb;
          --ink: #101828;
          --ink-muted: #667085;
          --header-bg: #0b1220;
          --accent: #4f46e5;
          --accent-dark: #4338ca;
          --money: #059669;
          --danger: #dc2626;
          --danger-dark: #b91c1c;
          --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, sans-serif;
          --font-mono: ui-monospace, "SF Mono", "JetBrains Mono", "Roboto Mono", Menlo, Consolas, monospace;

          min-height: 100vh;
          background: var(--bg);
          font-family: var(--font-sans);
          color: var(--ink);
        }

        .mono { font-family: var(--font-mono); }
        .muted { color: var(--ink-muted); }

        /* Topbar */
        .topbar { background: var(--header-bg); }
        .topbar-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0.9rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .brand {
          display: flex; align-items: center; gap: 10px;
          color: #fff; font-weight: 700; font-size: 1rem; letter-spacing: 0.01em;
        }
        .btn-ghost {
          background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.25);
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); }

        /* Ledger strip — signature element */
        .ledger { background: var(--header-bg); border-top: 1px solid rgba(255,255,255,0.06); }
        .ledger-inner {
          max-width: 1080px; margin: 0 auto;
          padding: 2.2rem 1.5rem 2.6rem;
          text-align: center;
        }
        .ledger-eyebrow {
          display: inline-block;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          color: #94a3b8; margin-bottom: 0.6rem;
        }
        .ledger-value {
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          font-size: clamp(2.4rem, 6vw, 3.6rem);
          font-weight: 700;
          color: var(--money);
          line-height: 1.1;
          letter-spacing: -0.01em;
        }
        .ledger-sub { display: block; margin-top: 0.55rem; font-size: 0.85rem; color: #94a3b8; }

        /* Nav — centered segmented control */
        .nav-wrap {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          display: flex; justify-content: center;
          padding: 0.9rem 1rem;
        }
        .nav {
          display: inline-flex; gap: 4px;
          background: #eef0f3; border-radius: 999px; padding: 4px;
          max-width: 100%;
          overflow-x: auto;
        }
        .nav-btn {
          padding: 9px 18px;
          font-size: 0.85rem; font-weight: 600;
          background: transparent; border: none; border-radius: 999px;
          color: var(--ink-muted); cursor: pointer; white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .nav-btn:hover { color: var(--ink); }
        .nav-btn.active {
          background: #fff; color: var(--ink);
          box-shadow: 0 1px 3px rgba(16,24,40,0.12);
        }

        /* Content */
        .content { padding: 2.25rem 1.5rem 4rem; display: flex; justify-content: center; }
        .container-narrow { width: 100%; max-width: 480px; }
        .container-wide { width: 100%; max-width: 980px; }

        .meta-text { text-align: center; color: var(--ink-muted); font-size: 0.85rem; margin: 0 0 1rem; }

        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.75rem;
          box-shadow: 0 1px 2px rgba(16,24,40,0.04);
        }
        .table-card { padding: 0; overflow: hidden; }
        .card-title { margin: 0 0 0.3rem; font-size: 1.05rem; font-weight: 700; }
        .card-desc { margin: 0 0 1.4rem; font-size: 0.85rem; color: var(--ink-muted); }

        /* Table */
        .table-scroll { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        thead tr { background: var(--header-bg); }
        th { padding: 12px 16px; text-align: left; color: #cbd5e1; font-weight: 600; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }
        tbody tr { border-bottom: 1px solid var(--border); }
        tbody tr:hover { background: #fafbfc; }
        td { padding: 12px 16px; white-space: nowrap; }
        .cell-strong { font-weight: 700; }
        .cell-money { font-weight: 700; color: var(--ink); }

        .status-pill {
          display: inline-block; padding: 3px 11px; border-radius: 999px;
          font-size: 0.72rem; font-weight: 700; color: #fff; text-transform: capitalize;
        }

        .actions-row { margin-top: 1.5rem; display: flex; justify-content: center; }

        /* Dashboard de visitas */
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
        }
        .stat-box {
          background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 4px;
        }
        .stat-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ink-muted); }
        .stat-value { font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }

        .hour-chart {
          display: flex; align-items: flex-end; gap: 4px; height: 110px; padding-top: 10px;
        }
        .hour-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 4px; }
        .hour-bar { width: 100%; max-width: 14px; background: var(--accent); border-radius: 3px 3px 0 0; transition: height 0.2s ease; }
        .hour-label { font-size: 0.62rem; color: var(--ink-muted); font-family: var(--font-mono); }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .hour-chart { overflow-x: auto; }
        }

        /* Buttons */
        .btn {
          padding: 11px 22px; border-radius: 9px; font-size: 0.9rem; font-weight: 600;
          cursor: pointer; border: none; transition: background 0.15s ease, opacity 0.15s ease, transform 0.05s ease;
        }
        .btn:active { transform: translateY(1px); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-block { width: 100%; }
        .btn-primary { background: var(--accent); color: #fff; }
        .btn-primary:hover:not(:disabled) { background: var(--accent-dark); }
        .btn-secondary { background: #fff; color: var(--ink); border: 1px solid var(--border); }
        .btn-secondary:hover { background: #f7f8fa; }
        .btn-danger { background: var(--danger); color: #fff; }
        .btn-danger:hover:not(:disabled) { background: var(--danger-dark); }

        /* Fields */
        .field { margin-bottom: 1.1rem; }
        .field label { display: block; margin-bottom: 6px; font-size: 0.82rem; font-weight: 600; color: var(--ink); }
        .field input {
          width: 100%; padding: 11px 13px; border: 1px solid var(--border); border-radius: 9px;
          font-size: 0.95rem; box-sizing: border-box; font-family: var(--font-sans); color: var(--ink);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .field input:focus {
          outline: none; border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(79,70,229,0.15);
        }

        /* Info boxes */
        .info-box { border-radius: 10px; padding: 1rem 1.1rem; margin-bottom: 1.4rem; font-size: 0.85rem; }
        .info-success { background: #ecfdf5; border: 1px solid #a7f3d0; }
        .info-danger { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        .info-title { margin: 0; font-weight: 700; color: var(--money); }
        .info-line { margin: 4px 0 0; color: #475569; }
        .break { word-break: break-all; }

        /* Payment options */
        .payment-option {
          display: flex; align-items: center; gap: 14px;
          border: 2px solid var(--border); border-radius: 12px; padding: 1.1rem;
          margin-bottom: 1rem; cursor: pointer; background: #fff;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .payment-option:hover { border-color: #cbd2dc; }
        .payment-icon { font-size: 1.7rem; }
        .payment-name { margin: 0; font-weight: 700; font-size: 0.95rem; }
        .payment-desc { margin: 4px 0 0; font-size: 0.8rem; color: var(--ink-muted); }
        .tag-ativo { font-size: 0.72rem; font-weight: 700; margin-left: 6px; }

        .variant-pix.active { border-color: var(--money); background: #ecfdf5; }
        .variant-pix.active .payment-name, .variant-pix.active .tag-ativo { color: var(--money); }
        .variant-podpay.active { border-color: var(--accent); background: #eef2ff; }
        .variant-podpay.active .payment-name, .variant-podpay.active .tag-ativo { color: var(--accent); }

        /* Messages */
        .msg { font-size: 0.85rem; margin: 0.9rem 0 1rem; font-weight: 600; }
        .msg-ok { color: var(--money); }
        .msg-err { color: var(--danger); }
        .msg-loading { font-size: 0.85rem; color: var(--ink-muted); }

        .confirm-text { font-weight: 600; margin-bottom: 1rem; }
        .confirm-row { display: flex; gap: 0.75rem; }

        @media (max-width: 640px) {
          .content { padding: 1.75rem 1rem 3rem; }
          .card { padding: 1.25rem; }
          .ledger-inner { padding: 1.8rem 1rem 2.1rem; }
        }
      `}</style>
    </div>
  )
}
