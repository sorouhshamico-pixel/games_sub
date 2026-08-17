// ZATCA (Saudi e-invoicing) Phase 1 simplified tax invoice QR — a public,
// well-documented TLV (Tag-Length-Value) byte format, not an API call, so
// this is implementable and verifiable without any ZATCA credentials. See
// docs/ZATCA_INTEGRATION.md for what Phase 1 vs Phase 2 means here.
//
// Each field is encoded as [tag: 1 byte][length: 1 byte][value: UTF-8 bytes],
// concatenated in tag order, then the whole buffer is base64-encoded.

export interface ZatcaSimplifiedInvoiceFields {
  sellerName: string;
  vatRegistrationNumber: string;
  invoiceTimestamp: string; // ISO 8601
  invoiceTotalWithVat: string; // decimal string, e.g. "596.00"
  vatTotal: string; // decimal string
}

const ZATCA_TAGS = {
  sellerName: 1,
  vatRegistrationNumber: 2,
  invoiceTimestamp: 3,
  invoiceTotalWithVat: 4,
  vatTotal: 5,
} as const;

function encodeTlv(tag: number, value: string): Buffer {
  const valueBuffer = Buffer.from(value, "utf-8");
  if (valueBuffer.length > 255) {
    throw new Error(`ZATCA QR field too long for a single-byte TLV length (tag ${tag}, ${valueBuffer.length} bytes)`);
  }
  return Buffer.concat([Buffer.from([tag]), Buffer.from([valueBuffer.length]), valueBuffer]);
}

export function buildZatcaQrPayloadBase64(fields: ZatcaSimplifiedInvoiceFields): string {
  const buffer = Buffer.concat([
    encodeTlv(ZATCA_TAGS.sellerName, fields.sellerName),
    encodeTlv(ZATCA_TAGS.vatRegistrationNumber, fields.vatRegistrationNumber),
    encodeTlv(ZATCA_TAGS.invoiceTimestamp, fields.invoiceTimestamp),
    encodeTlv(ZATCA_TAGS.invoiceTotalWithVat, fields.invoiceTotalWithVat),
    encodeTlv(ZATCA_TAGS.vatTotal, fields.vatTotal),
  ]);
  return buffer.toString("base64");
}

/** Inverse of buildZatcaQrPayloadBase64 — used only by tests to prove the encoding round-trips correctly. */
export function decodeZatcaQrPayloadBase64(base64: string): ZatcaSimplifiedInvoiceFields {
  const buffer = Buffer.from(base64, "base64");
  const values: Partial<Record<number, string>> = {};
  let offset = 0;
  while (offset < buffer.length) {
    const tag = buffer[offset];
    const length = buffer[offset + 1];
    if (tag === undefined || length === undefined || offset + 2 + length > buffer.length) {
      throw new Error("Malformed ZATCA QR payload: truncated TLV header");
    }
    values[tag] = buffer.subarray(offset + 2, offset + 2 + length).toString("utf-8");
    offset += 2 + length;
  }

  const sellerName = values[ZATCA_TAGS.sellerName];
  const vatRegistrationNumber = values[ZATCA_TAGS.vatRegistrationNumber];
  const invoiceTimestamp = values[ZATCA_TAGS.invoiceTimestamp];
  const invoiceTotalWithVat = values[ZATCA_TAGS.invoiceTotalWithVat];
  const vatTotal = values[ZATCA_TAGS.vatTotal];
  if (!sellerName || !vatRegistrationNumber || !invoiceTimestamp || !invoiceTotalWithVat || !vatTotal) {
    throw new Error("Malformed ZATCA QR payload: missing a required tag");
  }
  return { sellerName, vatRegistrationNumber, invoiceTimestamp, invoiceTotalWithVat, vatTotal };
}
