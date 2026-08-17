import { describe, expect, it } from "vitest";
import { buildZatcaQrPayloadBase64, decodeZatcaQrPayloadBase64 } from "./zatca-qr";

describe("ZATCA QR TLV encoding", () => {
  const fields = {
    sellerName: "Charjo Demo Store",
    vatRegistrationNumber: "300000000000003",
    invoiceTimestamp: "2026-08-17T10:00:00.000Z",
    invoiceTotalWithVat: "596.00",
    vatTotal: "78.00",
  };

  it("round-trips through encode/decode", () => {
    const payload = buildZatcaQrPayloadBase64(fields);
    expect(decodeZatcaQrPayloadBase64(payload)).toEqual(fields);
  });

  it("produces the exact expected TLV byte layout", () => {
    const payload = buildZatcaQrPayloadBase64(fields);
    const buffer = Buffer.from(payload, "base64");

    let offset = 0;
    // tag 1: sellerName
    expect(buffer[offset]).toBe(1);
    expect(buffer[offset + 1]).toBe(Buffer.byteLength(fields.sellerName, "utf-8"));
    offset += 2 + buffer[offset + 1]!;
    // tag 2: vatRegistrationNumber
    expect(buffer[offset]).toBe(2);
    expect(buffer[offset + 1]).toBe(Buffer.byteLength(fields.vatRegistrationNumber, "utf-8"));
    offset += 2 + buffer[offset + 1]!;
    // tag 3: invoiceTimestamp
    expect(buffer[offset]).toBe(3);
    offset += 2 + buffer[offset + 1]!;
    // tag 4: invoiceTotalWithVat
    expect(buffer[offset]).toBe(4);
    offset += 2 + buffer[offset + 1]!;
    // tag 5: vatTotal
    expect(buffer[offset]).toBe(5);
    offset += 2 + buffer[offset + 1]!;

    expect(offset).toBe(buffer.length);
  });

  it("handles multi-byte UTF-8 seller names (Arabic) with correct byte-length TLV headers", () => {
    const arabicFields = { ...fields, sellerName: "متجر شحنو التجريبي" };
    const payload = buildZatcaQrPayloadBase64(arabicFields);
    const buffer = Buffer.from(payload, "base64");
    expect(buffer[1]).toBe(Buffer.byteLength(arabicFields.sellerName, "utf-8"));
    expect(decodeZatcaQrPayloadBase64(payload).sellerName).toBe(arabicFields.sellerName);
  });

  it("throws on a truncated/malformed payload instead of silently returning garbage", () => {
    const payload = buildZatcaQrPayloadBase64(fields);
    const truncated = Buffer.from(payload, "base64").subarray(0, 5).toString("base64");
    expect(() => decodeZatcaQrPayloadBase64(truncated)).toThrow();
  });
});
