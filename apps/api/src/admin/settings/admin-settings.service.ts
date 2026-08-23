import { Injectable } from "@nestjs/common";
import { prisma, recordAuditLog } from "@gcc-store/db";
import type { UpdateSettingsDto } from "./dto/update-settings.dto";

export interface StoreSettings {
  supportEmail: string | null;
  supportPhone: string | null;
  refundWindowDays: number | null;
  maintenanceMode: boolean;
}

const DEFAULTS: StoreSettings = {
  supportEmail: null,
  supportPhone: null,
  refundWindowDays: null,
  maintenanceMode: false,
};

const KNOWN_KEYS = Object.keys(DEFAULTS) as Array<keyof StoreSettings>;

@Injectable()
export class AdminSettingsService {
  async get(): Promise<StoreSettings> {
    const rows = await prisma.appSetting.findMany({ where: { key: { in: KNOWN_KEYS } } });
    const settings = { ...DEFAULTS };
    for (const row of rows) {
      (settings as Record<string, unknown>)[row.key] = row.valueJson;
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto, adminUserId: string): Promise<StoreSettings> {
    const entries = Object.entries(dto).filter(([, value]) => value !== undefined) as Array<[keyof StoreSettings, unknown]>;

    await prisma.$transaction(async (tx) => {
      for (const [key, value] of entries) {
        await tx.appSetting.upsert({
          where: { key },
          create: { key, valueJson: value as never },
          update: { valueJson: value as never },
        });
      }
      if (entries.length > 0) {
        await recordAuditLog(tx, {
          actorUserId: adminUserId,
          action: "settings.updated",
          entityType: "AppSetting",
          entityId: "store",
          metadata: Object.fromEntries(entries) as never,
        });
      }
    });

    return this.get();
  }
}

/** Read-only accessor for other services (refunds, storefront) that only
 * need one setting — avoids importing the admin module just to read a
 * single AppSetting row. */
export async function getStoreSetting<K extends keyof StoreSettings>(key: K): Promise<StoreSettings[K]> {
  const row = await prisma.appSetting.findUnique({ where: { key } });
  return (row ? (row.valueJson as StoreSettings[K]) : DEFAULTS[key]);
}
