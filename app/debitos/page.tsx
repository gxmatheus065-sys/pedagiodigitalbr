import { DebitosClient } from '@/components/debitos-client'

export default async function DebitosPage({
  searchParams,
}: {
  searchParams: Promise<{ placa?: string }>
}) {
  const { placa } = await searchParams
  return <DebitosClient placa={placa || 'OTJ0J98'} />
}
