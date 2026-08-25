// Gerador de payload Pix "Copia e Cola" (BR Code estático) padrão EMV/BACEN.

function emv(id: string, value: string) {
  const len = value.length.toString().padStart(2, "0")
  return `${id}${len}${value}`
}

// CRC16-CCITT (0xFFFF) usado no campo 63 do BR Code.
function crc16(payload: string) {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

function sanitize(text: string, max: number) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max)
}

export function generatePixPayload({
  key,
  merchantName,
  merchantCity,
  amount,
  txid = "***",
}: {
  key: string
  merchantName: string
  merchantCity: string
  amount: number
  txid?: string
}) {
  // Validações explícitas: sem isso, um valor undefined/vazio quebra
  // silenciosamente dentro de emv()/sanitize() com um TypeError genérico,
  // difícil de diagnosticar (é exatamente o que causava o erro
  // "Não foi possível gerar o Pix. Tente novamente." no checkout).
  if (!key) {
    throw new Error("Chave Pix não configurada. Configure em /admin/pedidos → Trocar Chave Pix.")
  }
  if (!merchantName) {
    throw new Error("Nome do recebedor (merchantName) não configurado.")
  }
  if (!merchantCity) {
    throw new Error("Cidade do recebedor (merchantCity) não configurada.")
  }
  if (!amount || amount <= 0 || Number.isNaN(amount)) {
    throw new Error("Valor do pedido inválido para gerar o Pix.")
  }

  const gui = emv("00", "BR.GOV.BCB.PIX")
  const keyField = emv("01", key)
  const merchantAccountInfo = emv("26", `${gui}${keyField}`)

  const payload =
    emv("00", "01") + // Payload Format Indicator
    merchantAccountInfo +
    emv("52", "0000") + // Merchant Category Code
    emv("53", "986") + // Moeda (BRL)
    emv("54", amount.toFixed(2)) + // Valor
    emv("58", "BR") + // País
    emv("59", sanitize(merchantName, 25)) +
    emv("60", sanitize(merchantCity, 15)) +
    emv("62", emv("05", sanitize(txid, 25))) // Additional data (txid)

  const toCrc = payload + "6304"
  return toCrc + crc16(toCrc)
}
