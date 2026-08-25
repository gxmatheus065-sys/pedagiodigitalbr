import { PagamentoClient } from '@/components/pagamento-client'

export default async function PagamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ placa?: string }>
}) {
  const { placa } = await searchParams
  return <PagamentoClient placa={placa || 'OTJ0J98'} />
}
