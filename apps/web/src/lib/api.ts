import type {
  CheckoutRequest,
  CheckoutResponse,
  GameBrandDetail,
  GameBrandSummary,
  OrderTrackingView,
  PageContent,
  ProductDetail,
  ProductSummary,
  SupportedCurrency,
} from "@gcc-store/contracts";

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

export interface RequestOptions {
  /**
   * Only needed in Server Components/Route Handlers: Node's fetch has no
   * browser cookie jar, so the incoming request's Cookie header has to be
   * forwarded by hand (see `getServerCookieHeader` in cookies.ts). Client
   * components instead rely on `credentials: "include"` below, since the
   * real browser cookie jar already has the httpOnly session cookie.
   */
  cookieHeader?: string;
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    // Data changes frequently (prices, stock) and the API has its own
    // caching story — always fetch fresh rather than let Next.js cache
    // a stale catalog response.
    response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      credentials: "include",
      headers: options.cookieHeader ? { Cookie: options.cookieHeader } : undefined,
    });
  } catch {
    throw new ApiError("network_error", 0);
  }

  if (!response.ok) {
    throw new ApiError(`request_failed_${response.status}`, response.status);
  }

  return (await response.json()) as T;
}

async function apiPost<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.cookieHeader ? { Cookie: options.cookieHeader } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("network_error", 0);
  }

  if (!response.ok) {
    const details = await response.json().catch(() => null);
    throw new ApiError(details?.error?.message ?? `request_failed_${response.status}`, response.status);
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

export function checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
  return apiPost("/checkout", request);
}

export function confirmMockPayment(paymentId: string): Promise<{ confirmed: boolean }> {
  return apiPost(`/payments/mock/${paymentId}/confirm`);
}

export function trackOrder(orderNumber: string, token: string): Promise<OrderTrackingView> {
  return apiFetch(`/orders/${orderNumber}?token=${encodeURIComponent(token)}`);
}

export interface AuthUser {
  id: string;
  email: string | null;
  role: string;
  displayName?: string | null;
}

export function registerAccount(input: { email: string; password: string; displayName?: string }): Promise<{ user: AuthUser }> {
  return apiPost("/auth/register", input);
}

export function login(input: { email: string; password: string }): Promise<{ user: AuthUser }> {
  return apiPost("/auth/login", input);
}

export function logout(): Promise<{ loggedOut: boolean }> {
  return apiPost("/auth/logout");
}

export function getMe(options: RequestOptions = {}): Promise<{ user: AuthUser }> {
  return apiFetch("/auth/me", options);
}

export interface AdminDashboard {
  windowDays: number;
  revenue: { totalMinorUnits: number; orderCount: number };
  ordersByStatus: Record<string, number>;
  fulfillment: { successRatePercent: number | null; byStatus: Record<string, number> };
  providers: Array<{ code: string; name: string; latestBalance: { balanceMinorUnits: number; currency: SupportedCurrency; capturedAt: string } | null }>;
}

export function getAdminDashboard(options: RequestOptions = {}): Promise<AdminDashboard> {
  return apiFetch("/admin/dashboard", options);
}

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  currency: SupportedCurrency;
  totalMinorUnits: number;
  guestEmail: string | null;
  guestPhone: string | null;
  createdAt: string;
}

export function getAdminOrders(
  params: { status?: string; page?: number } = {},
  options: RequestOptions = {},
): Promise<{ items: AdminOrderSummary[]; page: number; pageSize: number; total: number }> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  const qs = query.toString();
  return apiFetch(`/admin/orders${qs ? `?${qs}` : ""}`, options);
}
