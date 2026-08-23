import type {
  BlogPostDetail,
  BlogPostSummary,
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

async function apiMutate<T>(method: "PATCH" | "DELETE", path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
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

export interface ListBlogPostsResult {
  items: BlogPostSummary[];
  page: number;
  pageSize: number;
  total: number;
}

export function listBlogPosts(
  params: { category?: string; page?: number; locale?: "ar" | "en" } = {},
): Promise<ListBlogPostsResult> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.page) query.set("page", String(params.page));
  if (params.locale) query.set("locale", params.locale);
  const qs = query.toString();
  return apiFetch(`/content/blog${qs ? `?${qs}` : ""}`);
}

export function getBlogPost(slug: string, locale: "ar" | "en"): Promise<BlogPostDetail> {
  return apiFetch(`/content/blog/${slug}?locale=${locale}`);
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

export interface AdminOrderDetail extends AdminOrderSummary {
  subtotalMinorUnits: number;
  discountMinorUnits: number;
  taxMinorUnits: number;
  items: Array<{
    id: string;
    quantity: number;
    productNameSnapshot: string;
    variant: { nameAr: string; nameEn: string; sku: string };
    fulfillments: Array<{ id: string; status: string; lastError: string | null }>;
  }>;
  payments: Array<{
    id: string;
    gatewayCode: string;
    status: string;
    amountMinorUnits: number;
    gatewayReference: string | null;
  }>;
  statusEvents: Array<{ toStatus: string; reason: string | null; actorType: string; createdAt: string }>;
  refunds: Array<{ id: string; amountMinorUnits: number; status: string; reason: string | null; createdAt: string }>;
  notifications: Array<{ id: string; channel: string; templateKey: string; status: string; sentAt: string | null; createdAt: string }>;
  invoice: { invoiceNumber: string; issuedAt: string; zatcaStatus: string | null } | null;
  invoiceQrCodeDataUri: string | null;
}

export function getAdminOrderDetail(id: string, options: RequestOptions = {}): Promise<AdminOrderDetail> {
  return apiFetch(`/admin/orders/${id}`, options);
}

export function createAdminRefund(
  orderId: string,
  input: { amountMinorUnits?: number; reason: string },
): Promise<{ id: string; status: string; amountMinorUnits: number }> {
  return apiPost(`/admin/orders/${orderId}/refund`, input);
}

// --- Admin catalog ---------------------------------------------------------

export interface AdminCategory {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
}

export function getAdminCategories(options: RequestOptions = {}): Promise<AdminCategory[]> {
  return apiFetch("/admin/catalog/categories", options);
}

export function createAdminCategory(input: { slug: string; nameAr: string; nameEn: string; sortOrder?: number }): Promise<AdminCategory> {
  return apiPost("/admin/catalog/categories", input);
}

export function updateAdminCategory(
  id: string,
  input: Partial<{ slug: string; nameAr: string; nameEn: string; sortOrder: number; isActive: boolean }>,
): Promise<AdminCategory> {
  return apiMutate("PATCH", `/admin/catalog/categories/${id}`, input);
}

export interface AdminProductVariant {
  id: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  currency: SupportedCurrency;
  baseCostMinorUnits: number;
  marginBasisPoints: number;
  discountMinorUnits: number;
  taxRateBasisPoints: number;
  isActive: boolean;
  minQuantityPerOrder: number;
  maxQuantityPerOrder: number;
}

export interface AdminProductTranslation {
  locale: "ar" | "en";
  name: string;
  description: string;
}

export interface AdminProductSummary {
  id: string;
  slug: string;
  type: string;
  status: string;
  categoryId: string;
  category: { nameAr: string; nameEn: string };
  translations: AdminProductTranslation[];
  variants: AdminProductVariant[];
  createdAt: string;
}

export interface AdminProductDetail extends AdminProductSummary {
  imageUrl: string | null;
  refundEligible: boolean;
  refundPolicyAr: string | null;
  refundPolicyEn: string | null;
  fulfillmentEtaMinutes: number | null;
  inputDefinitions: Array<{
    id: string;
    key: string;
    labelAr: string;
    labelEn: string;
    fieldType: string;
    required: boolean;
    regex: string | null;
    normalize: string;
  }>;
}

export function getAdminProducts(
  params: { status?: string; page?: number } = {},
  options: RequestOptions = {},
): Promise<{ items: AdminProductSummary[]; page: number; pageSize: number; total: number }> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  const qs = query.toString();
  return apiFetch(`/admin/catalog/products${qs ? `?${qs}` : ""}`, options);
}

export function getAdminProduct(id: string, options: RequestOptions = {}): Promise<AdminProductDetail> {
  return apiFetch(`/admin/catalog/products/${id}`, options);
}

export interface CreateAdminProductInput {
  slug: string;
  type: string;
  categoryId: string;
  refundEligible?: boolean;
  translations: AdminProductTranslation[];
  variants: Array<{
    sku: string;
    nameAr: string;
    nameEn: string;
    currency: SupportedCurrency;
    baseCostMinorUnits: number;
    marginBasisPoints?: number;
    taxRateBasisPoints?: number;
  }>;
  inputDefinitions?: Array<{
    key: string;
    labelAr: string;
    labelEn: string;
    fieldType: "text" | "number" | "select" | "email";
    required?: boolean;
    regex?: string;
    normalize?: "trim" | "trimAndUppercase" | "digitsOnly";
  }>;
}

export function createAdminProduct(input: CreateAdminProductInput): Promise<AdminProductDetail> {
  return apiPost("/admin/catalog/products", input);
}

export function updateAdminProductStatus(id: string, status: string): Promise<AdminProductDetail> {
  return apiMutate("PATCH", `/admin/catalog/products/${id}`, { status });
}

export function deleteAdminProduct(id: string): Promise<AdminProductDetail> {
  return apiMutate("DELETE", `/admin/catalog/products/${id}`);
}

export function deactivateAdminVariant(variantId: string): Promise<AdminProductVariant> {
  return apiMutate("DELETE", `/admin/catalog/variants/${variantId}`);
}

export interface CreateAdminVariantInput {
  sku: string;
  nameAr: string;
  nameEn: string;
  currency: SupportedCurrency;
  baseCostMinorUnits: number;
  marginBasisPoints?: number;
}

export function createAdminVariant(productId: string, input: CreateAdminVariantInput): Promise<AdminProductVariant> {
  return apiPost(`/admin/catalog/products/${productId}/variants`, input);
}

// --- Admin coupons ----------------------------------------------------------

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxRedemptions: number | null;
  maxRedemptionsPerCustomer: number | null;
  minOrderAmountMinorUnits: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export function getAdminCoupons(options: RequestOptions = {}): Promise<AdminCoupon[]> {
  return apiFetch("/admin/coupons", options);
}

export interface CreateAdminCouponInput {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxRedemptions?: number;
  maxRedemptionsPerCustomer?: number;
  minOrderAmountMinorUnits?: number;
  startsAt?: string;
  endsAt?: string;
}

export function createAdminCoupon(input: CreateAdminCouponInput): Promise<AdminCoupon> {
  return apiPost("/admin/coupons", input);
}

export function deactivateAdminCoupon(id: string): Promise<AdminCoupon> {
  return apiMutate("DELETE", `/admin/coupons/${id}`);
}

export function updateAdminCoupon(
  id: string,
  input: Partial<{
    maxRedemptions: number;
    maxRedemptionsPerCustomer: number;
    minOrderAmountMinorUnits: number;
    startsAt: string;
    endsAt: string;
  }>,
): Promise<AdminCoupon> {
  return apiMutate("PATCH", `/admin/coupons/${id}`, input);
}
