import { Newspaper, BookOpen, Tag, PlayCircle, ShieldCheck, Scale } from "lucide-react";

// coverImage credits: real Unsplash photos (Unsplash License — free for
// commercial use, no attribution required), downloaded into
// public/images/blog/ rather than hotlinked.
export const blogCategories: Array<{ slug: string; Icon: typeof Newspaper; coverImage: string; ar: string; en: string }> = [
  { slug: "game-news", Icon: Newspaper, coverImage: "/images/blog/mobile-gaming.jpg", ar: "أخبار الألعاب", en: "Game news" },
  { slug: "guides", Icon: BookOpen, coverImage: "/images/blog/mobile-gaming.jpg", ar: "أدلة الشحن", en: "Top-up guides" },
  { slug: "offers", Icon: Tag, coverImage: "/images/blog/sale-tag.jpg", ar: "العروض", en: "Offers" },
  { slug: "subscriptions", Icon: PlayCircle, coverImage: "/images/blog/laptop-relaxing.jpg", ar: "الاشتراكات الرقمية", en: "Digital subscriptions" },
  { slug: "account-protection", Icon: ShieldCheck, coverImage: "/images/blog/security-shield.jpg", ar: "حماية الحساب", en: "Account protection" },
  { slug: "comparisons", Icon: Scale, coverImage: "/images/blog/laptop-relaxing.jpg", ar: "مقارنات", en: "Comparisons" },
];

export function getBlogCategoryMeta(slug: string) {
  return blogCategories.find((c) => c.slug === slug);
}
