import { PixClient } from '@/components/pix-client'

export default async function PixPage({
  searchParams,
}: {
  searchParams: Promise<{ placa?: string }>
}) {
  const { placa } = await searchParams
  return <PixClient placa={placa || 'OTJ0J98'} />
}
