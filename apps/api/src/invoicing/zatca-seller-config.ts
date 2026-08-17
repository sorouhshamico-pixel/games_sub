import { Logger } from "@nestjs/common";

const logger = new Logger("ZatcaSellerConfig");
let warned = false;

export interface ZatcaSellerConfig {
  name: string;
  vatNumber: string;
}

const DEMO_SELLER_NAME = "Demo Store (DEV ONLY)";
// NOT a real registration — a placeholder in the correct 15-digit Saudi VAT
// format (starts and ends with 3). Do not present this as a real ZATCA test
// value; it's just shaped correctly so downstream validation doesn't choke.
const DEMO_VAT_NUMBER = "300000000000003";

/** Real seller identity must come from env — see docs/ZATCA_INTEGRATION.md before issuing anything real. */
export function getZatcaSellerConfig(): ZatcaSellerConfig {
  const name = process.env["ZATCA_SELLER_NAME"];
  const vatNumber = process.env["ZATCA_SELLER_VAT_NUMBER"];
  if (!name || !vatNumber) {
    if (!warned) {
      logger.warn(
        "ZATCA_SELLER_NAME/ZATCA_SELLER_VAT_NUMBER are not set — issuing invoices with a DEMO seller identity. Set both before issuing any real invoice.",
      );
      warned = true;
    }
    return { name: name ?? DEMO_SELLER_NAME, vatNumber: vatNumber ?? DEMO_VAT_NUMBER };
  }
  return { name, vatNumber };
}
