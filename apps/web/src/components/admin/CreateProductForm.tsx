"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@gcc-store/i18n";
import type { AdminCategory, CreateAdminProductInput } from "@/lib/api";
import { ApiError, createAdminProduct } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";

const PRODUCT_TYPES = ["GAME_TOPUP", "DIGITAL_CODE", "SUBSCRIPTION", "GIFT_CARD", "MANUAL_DIGITAL_SERVICE"] as const;
const CURRENCIES = ["SAR", "AED", "KWD", "QAR", "BHD", "OMR"] as const;

interface DynamicField {
  key: string;
  labelAr: string;
  labelEn: string;
}

export function CreateProductForm({ categories }: { categories: AdminCategory[] }) {
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [type, setType] = useState<(typeof PRODUCT_TYPES)[number]>("GAME_TOPUP");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sku, setSku] = useState("");
  const [variantNameAr, setVariantNameAr] = useState("");
  const [variantNameEn, setVariantNameEn] = useState("");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("SAR");
  const [baseCostSar, setBaseCostSar] = useState("");
  const [marginPercent, setMarginPercent] = useState("15");
  const [needsPlayerId, setNeedsPlayerId] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const baseCostMinorUnits = Math.round(Number.parseFloat(baseCostSar) * 100);
    if (!Number.isFinite(baseCostMinorUnits) || baseCostMinorUnits < 0) {
      setError(locale === "ar" ? "السعر غير صالح" : "Invalid price");
      return;
    }

    const inputDefinitions: DynamicField[] = needsPlayerId
      ? [{ key: "playerId", labelAr: "معرف اللاعب", labelEn: "Player ID" }]
      : [];

    const payload: CreateAdminProductInput = {
      slug,
      type,
      categoryId,
      imageUrl: imageUrl.trim() || undefined,
      translations: [
        { locale: "ar", name: nameAr, description: descriptionAr },
        { locale: "en", name: nameEn, description: descriptionEn },
      ],
      variants: [
        {
          sku,
          nameAr: variantNameAr,
          nameEn: variantNameEn,
          currency,
          baseCostMinorUnits,
          marginBasisPoints: Math.round(Number.parseFloat(marginPercent || "0") * 100),
        },
      ],
      inputDefinitions: inputDefinitions.length
        ? inputDefinitions.map((f) => ({ key: f.key, labelAr: f.labelAr, labelEn: f.labelEn, fieldType: "text", required: true }))
        : undefined,
    };

    setLoading(true);
    try {
      const created = await createAdminProduct(payload);
      router.push(`/admin/products/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? locale === "ar"
            ? "المعرف (slug) أو رمز المتغير (SKU) مستخدم بالفعل"
            : "That slug or SKU is already in use"
          : locale === "ar"
            ? "حدث خطأ غير متوقع، تحقق من الحقول"
            : "Something went wrong, check the fields",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-primary)]";
  const labelClass = "mb-1 block text-sm font-medium text-[var(--color-text-primary)]";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input id="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="type" className={labelClass}>
            {locale === "ar" ? "نوع المنتج" : "Product type"}
          </label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value as typeof type)} className={inputClass}>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="category" className={labelClass}>
            {locale === "ar" ? "الفئة" : "Category"}
          </label>
          {categories.length === 0 ? (
            <p className="text-sm text-danger">
              {locale === "ar" ? "لا توجد فئات بعد — أنشئ فئة أولاً من صفحة الفئات." : "No categories yet — create one on the Categories page first."}
            </p>
          ) : (
            <select id="category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === "ar" ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nameAr" className={labelClass}>
            {locale === "ar" ? "الاسم بالعربية" : "Arabic name"}
          </label>
          <input id="nameAr" required dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="nameEn" className={labelClass}>
            {locale === "ar" ? "الاسم بالإنجليزية" : "English name"}
          </label>
          <input id="nameEn" required value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="descAr" className={labelClass}>
            {locale === "ar" ? "الوصف بالعربية" : "Arabic description"}
          </label>
          <textarea id="descAr" required dir="rtl" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} className={inputClass} rows={2} />
        </div>
        <div>
          <label htmlFor="descEn" className={labelClass}>
            {locale === "ar" ? "الوصف بالإنجليزية" : "English description"}
          </label>
          <textarea id="descEn" required value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} className={inputClass} rows={2} />
        </div>
        <div>
          <label htmlFor="imageUrl" className={labelClass}>
            {locale === "ar" ? "رابط الصورة (اختياري)" : "Image URL (optional)"}
          </label>
          <input
            id="imageUrl"
            type="url"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputClass}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] p-4">
        <h2 className="mb-3 font-semibold text-[var(--color-text-primary)]">
          {locale === "ar" ? "أول فئة سعرية (يمكن إضافة المزيد لاحقًا)" : "First price tier (add more later)"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sku" className={labelClass}>
              SKU
            </label>
            <input id="sku" required value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="cost" className={labelClass}>
                {locale === "ar" ? "تكلفة المورد" : "Provider cost"}
              </label>
              <input id="cost" required type="number" min="0" step="0.01" value={baseCostSar} onChange={(e) => setBaseCostSar(e.target.value)} className={inputClass} />
            </div>
            <div className="w-28">
              <label htmlFor="currency" className={labelClass}>
                {locale === "ar" ? "العملة" : "Currency"}
              </label>
              <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} className={inputClass}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="variantNameAr" className={labelClass}>
              {locale === "ar" ? "اسم الفئة بالعربية" : "Tier name (Arabic)"}
            </label>
            <input id="variantNameAr" required dir="rtl" value={variantNameAr} onChange={(e) => setVariantNameAr(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="variantNameEn" className={labelClass}>
              {locale === "ar" ? "اسم الفئة بالإنجليزية" : "Tier name (English)"}
            </label>
            <input id="variantNameEn" required value={variantNameEn} onChange={(e) => setVariantNameEn(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="margin" className={labelClass}>
              {locale === "ar" ? "هامش الربح (%)" : "Margin (%)"}
            </label>
            <input id="margin" type="number" min="0" step="0.1" value={marginPercent} onChange={(e) => setMarginPercent(e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      <section>
        <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
          <input type="checkbox" checked={needsPlayerId} onChange={(e) => setNeedsPlayerId(e.target.checked)} />
          {locale === "ar" ? "يتطلب معرف لاعب (Player ID) عند الشراء" : "Requires a Player ID at checkout"}
        </label>
      </section>

      {error ? (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || categories.length === 0}
        className="flex h-12 items-center justify-center rounded-xl bg-brand-primary text-base font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
      >
        {locale === "ar" ? "إنشاء المنتج (كمسودة)" : "Create product (as draft)"}
      </button>
    </form>
  );
}
