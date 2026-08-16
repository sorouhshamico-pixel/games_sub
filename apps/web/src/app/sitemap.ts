import type { MetadataRoute } from "next";
import { locales } from "@gcc-store/i18n";
import { getBrands, listProducts } from "@/lib/api";

const SITE_URL = process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000";
const STATIC_PATHS = ["", "/games", "/cart", "/pages/faq", "/pages/terms", "/pages/privacy", "/pages/refunds"];

function localizedEntry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}/${locales[0]}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(localizedEntry);

  try {
    const [{ items: products }, brands] = await Promise.all([
      listProducts({ page: 1 }),
      getBrands(),
    ]);
    for (const product of products) entries.push(localizedEntry(`/products/${product.slug}`));
    for (const brand of brands) entries.push(localizedEntry(`/games/${brand.slug}`));
  } catch {
    // API unreachable at build/request time — ship the static routes only
    // rather than failing the whole sitemap.
  }

  return entries;
}
