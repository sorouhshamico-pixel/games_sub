import { Newspaper, BookOpen, Tag, PlayCircle, ShieldCheck, Scale } from "lucide-react";

export const blogCategories: Array<{ slug: string; Icon: typeof Newspaper; ar: string; en: string }> = [
  { slug: "game-news", Icon: Newspaper, ar: "أخبار الألعاب", en: "Game news" },
  { slug: "guides", Icon: BookOpen, ar: "أدلة الشحن", en: "Top-up guides" },
  { slug: "offers", Icon: Tag, ar: "العروض", en: "Offers" },
  { slug: "subscriptions", Icon: PlayCircle, ar: "الاشتراكات الرقمية", en: "Digital subscriptions" },
  { slug: "account-protection", Icon: ShieldCheck, ar: "حماية الحساب", en: "Account protection" },
  { slug: "comparisons", Icon: Scale, ar: "مقارنات", en: "Comparisons" },
];

export function getBlogCategoryMeta(slug: string) {
  return blogCategories.find((c) => c.slug === slug);
}
