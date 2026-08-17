import { Injectable } from "@nestjs/common";
import * as QRCode from "qrcode";
import type { Prisma } from "@gcc-store/db";
import { buildZatcaQrPayloadBase64 } from "./zatca-qr";
import { getZatcaSellerConfig } from "./zatca-seller-config";

type InvoiceOrderInput = { id: string; totalMinorUnits: number; taxMinorUnits: number };

@Injectable()
export class InvoicingService {
  /**
   * Issues a ZATCA-shaped simplified tax invoice for a paid order, inside
   * the same transaction as the payment-captured state transition (a plain
   * DB write, no network call, so it belongs in the transaction — same
   * reasoning as recordNotification). Phase 1 only: no real ZATCA API
   * clearance, zatcaStatus stays null. See docs/ZATCA_INTEGRATION.md.
   */
  async issueInvoice(tx: Prisma.TransactionClient, order: InvoiceOrderInput) {
    const existing = await tx.invoice.findUnique({ where: { orderId: order.id } });
    if (existing) return existing; // defensive — see docs/ZATCA_INTEGRATION.md

    const seller = getZatcaSellerConfig();
    const [row] = await tx.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('invoice_number_seq') AS nextval`;
    if (!row) throw new Error("invoice_number_seq.nextval() returned no row");
    const invoiceNumber = `INV-${row.nextval.toString().padStart(6, "0")}`;

    return tx.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        // Always "b2c_simplified": checkout never collects a buyer VAT
        // number today, so "b2b_tax" is unreachable — see docs/ZATCA_INTEGRATION.md.
        type: "b2c_simplified",
        sellerNameSnapshot: seller.name,
        sellerVatNumberSnapshot: seller.vatNumber,
      },
    });
  }

  buildQrPayloadBase64(
    invoice: { sellerNameSnapshot: string; sellerVatNumberSnapshot: string; issuedAt: Date },
    order: { totalMinorUnits: number; taxMinorUnits: number },
  ): string {
    return buildZatcaQrPayloadBase64({
      sellerName: invoice.sellerNameSnapshot,
      vatRegistrationNumber: invoice.sellerVatNumberSnapshot,
      invoiceTimestamp: invoice.issuedAt.toISOString(),
      invoiceTotalWithVat: (order.totalMinorUnits / 100).toFixed(2),
      vatTotal: (order.taxMinorUnits / 100).toFixed(2),
    });
  }

  async buildQrImageDataUri(
    invoice: { sellerNameSnapshot: string; sellerVatNumberSnapshot: string; issuedAt: Date },
    order: { totalMinorUnits: number; taxMinorUnits: number },
  ): Promise<string> {
    const payload = this.buildQrPayloadBase64(invoice, order);
    return QRCode.toDataURL(payload, { margin: 1, width: 240 });
  }
}
