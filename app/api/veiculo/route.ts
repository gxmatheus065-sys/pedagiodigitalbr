import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const placa = req.nextUrl.searchParams.get('placa')

  if (!placa) {
    return NextResponse.json({ error: 'Placa não informada' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://snoopintelligence.cloud/api/v2/placa?placa=${encodeURIComponent(placa)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KEY_API}`,
        },
        cache: 'no-store',
      }
    )

    const json = await response.json()

    if (!response.ok || !json.body) {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: response.status || 404 })
    }

    const veiculo = json.body

  
    return NextResponse.json({
      marca: veiculo.brand ?? null,
      modelo: veiculo.model ?? null,
      cor: veiculo.color ?? null,
      ano: veiculo.year_fab ?? veiculo.year_model ?? null,
    })
  } catch (err) {
    console.error('Erro na consulta:', err)
    return NextResponse.json({ error: 'Erro ao consultar veículo' }, { status: 500 })
  }
}