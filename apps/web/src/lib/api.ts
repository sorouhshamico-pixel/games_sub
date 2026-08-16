import type { GameBrandDetail, GameBrandSummary, PageContent, ProductDetail, ProductSummary } from "@gcc-store/contracts";

const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  let response: Response;
  try {
    // Data changes frequently (prices, stock) and the API has its own
    // caching story — always fetch fresh rather than let Next.js cache
    // a stale catalog response.
    response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  } catch {
    throw new ApiError("network_error", 0);
  }

  if (!response.ok) {
    throw new ApiError(`request_failed_${response.status}`, response.status);
  }

  return (await response.json()) as T;
}

export interface CategorySummary {
  slug: string;
  name: string;
}

export function getCategories(locale: "ar" | "en"): Promise<CategorySummary[]> {
  return apiFetch(`/catalog/categories?locale=${locale}`);
}

export interface ListProductsResult {
  items: ProductSummary[];
  page: number;
  pageSize: number;
  total: number;
}

export function listProducts(
  params: { category?: string; search?: string; page?: number; locale?: "ar" | "en" } = {},
): Promise<ListProductsResult> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.locale) query.set("locale", params.locale);
  const qs = query.toString();
  return apiFetch(`/catalog/products${qs ? `?${qs}` : ""}`);
}

export function getProductBySlug(slug: string): Promise<ProductDetail> {
  return apiFetch(`/catalog/products/${slug}`);
}

export function getBrands(): Promise<GameBrandSummary[]> {
  return apiFetch(`/catalog/brands`);
}

export function getBrandBySlug(slug: string): Promise<GameBrandDetail> {
  return apiFetch(`/catalog/brands/${slug}`);
}

export function getPage(slug: string, locale: "ar" | "en"): Promise<PageContent> {
  return apiFetch(`/content/pages/${slug}?locale=${locale}`);
}
