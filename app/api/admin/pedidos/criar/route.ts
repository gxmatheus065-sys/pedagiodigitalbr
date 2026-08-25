import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { placa, nome_cliente, telefone_cliente, email_cliente, valor, status } = body

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
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar pedido no Supabase:", error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, data })
}