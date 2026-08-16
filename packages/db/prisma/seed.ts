import { PrismaClient, ProductType, ProductLifecycleStatus } from "../generated/client";

const prisma = new PrismaClient();

// All names/prices below are placeholder demo data (isDemoData: true) meant
// to exercise the storefront UI end-to-end. They must never be wired to a
// real payment or fulfillment provider. Replace with real catalog data and
// provider mappings before going live — see docs/PROVIDER_INTEGRATION.md.

async function main() {
  const gamesCategory = await prisma.category.upsert({
    where: { slug: "game-topups" },
    update: {},
    create: {
      slug: "game-topups",
      nameAr: "شحن الألعاب",
      nameEn: "Game Top-ups",
      sortOrder: 1,
    },
  });

  const subscriptionsCategory = await prisma.category.upsert({
    where: { slug: "subscriptions" },
    update: {},
    create: {
      slug: "subscriptions",
      nameAr: "الاشتراكات الرقمية",
      nameEn: "Digital Subscriptions",
      sortOrder: 2,
    },
  });

  const giftCardsCategory = await prisma.category.upsert({
    where: { slug: "gift-cards" },
    update: {},
    create: {
      slug: "gift-cards",
      nameAr: "بطاقات الهدايا",
      nameEn: "Gift Cards",
      sortOrder: 3,
    },
  });

  const demoGameBrand = await prisma.gameBrand.upsert({
    where: { slug: "demo-battle-arena" },
    update: {},
    create: {
      slug: "demo-battle-arena",
      nameAr: "ديمو باتل أرينا",
      nameEn: "Demo Battle Arena",
      descriptionAr: "لعبة تجريبية لعرض تدفق الشحن. استبدلها بلعبة حقيقية مرخصة قبل الإطلاق.",
      descriptionEn: "Placeholder game used to demonstrate the top-up flow. Replace with a licensed title before launch.",
      identifierHelpAr: "افتح اللعبة، اذهب للملف الشخصي، وانسخ Player ID الظاهر أعلى الشاشة.",
      identifierHelpEn: "Open the game, go to your profile, and copy the Player ID shown at the top of the screen.",
    },
  });

  const topupProduct = await prisma.product.upsert({
    where: { slug: "demo-battle-arena-diamonds" },
    update: {},
    create: {
      slug: "demo-battle-arena-diamonds",
      type: ProductType.GAME_TOPUP,
      categoryId: gamesCategory.id,
      gameBrandId: demoGameBrand.id,
      status: ProductLifecycleStatus.ACTIVE,
      refundEligible: false,
      refundPolicyAr: "منتجات الشحن الرقمي غير قابلة للاسترجاع بعد نجاح التنفيذ.",
      refundPolicyEn: "Digital top-up products are non-refundable once fulfillment succeeds.",
      fulfillmentEtaMinutes: 5,
      isDemoData: true,
      translations: {
        create: [
          { locale: "ar", name: "ماسات ديمو باتل أرينا", description: "شحن ماسات مباشر إلى حساب اللعبة." },
          { locale: "en", name: "Demo Battle Arena Diamonds", description: "Direct diamond top-up to your game account." },
        ],
      },
      inputDefinitions: {
        create: [
          {
            key: "playerId",
            labelAr: "معرف اللاعب (Player ID)",
            labelEn: "Player ID",
            helpTextAr: "رقم يظهر في صفحة الملف الشخصي داخل اللعبة.",
            helpTextEn: "Found on your in-game profile page.",
            fieldType: "text",
            required: true,
            regex: "^[0-9]{6,12}$",
            minLength: 6,
            maxLength: 12,
            normalize: "digitsOnly",
            sortOrder: 1,
          },
          {
            key: "serverId",
            labelAr: "معرف السيرفر (Server ID)",
            labelEn: "Server ID",
            fieldType: "text",
            required: true,
            regex: "^[0-9]{1,6}$",
            normalize: "digitsOnly",
            sortOrder: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "DEMO-BA-DIAMOND-100",
            nameAr: "100 ماسة",
            nameEn: "100 Diamonds",
            currency: "SAR",
            baseCostMinorUnits: 450,
            marginBasisPoints: 1500,
            taxRateBasisPoints: 1500,
            sortOrder: 1,
          },
          {
            sku: "DEMO-BA-DIAMOND-520",
            nameAr: "520 ماسة",
            nameEn: "520 Diamonds",
            currency: "SAR",
            baseCostMinorUnits: 2100,
            marginBasisPoints: 1500,
            taxRateBasisPoints: 1500,
            sortOrder: 2,
          },
          {
            sku: "DEMO-BA-DIAMOND-1080",
            nameAr: "1080 ماسة",
            nameEn: "1080 Diamonds",
            currency: "SAR",
            baseCostMinorUnits: 4200,
            marginBasisPoints: 1500,
            taxRateBasisPoints: 1500,
            sortOrder: 3,
          },
        ],
      },
    },
  });

  const subscriptionProduct = await prisma.product.upsert({
    where: { slug: "demo-streaming-plus" },
    update: {},
    create: {
      slug: "demo-streaming-plus",
      type: ProductType.SUBSCRIPTION,
      categoryId: subscriptionsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      refundEligible: false,
      refundPolicyAr: "الاشتراكات الرقمية غير قابلة للاسترجاع بعد تفعيل الكود.",
      refundPolicyEn: "Digital subscriptions are non-refundable once the code is activated.",
      fulfillmentEtaMinutes: 10,
      isDemoData: true,
      translations: {
        create: [
          { locale: "ar", name: "اشتراك ديمو ستريمنغ بلس", description: "اشتراك شهري تجريبي لخدمة بث تجريبية." },
          { locale: "en", name: "Demo Streaming Plus", description: "Placeholder monthly subscription for a demo streaming service." },
        ],
      },
      inputDefinitions: {
        create: [
          {
            key: "email",
            labelAr: "البريد الإلكتروني لحساب الاشتراك",
            labelEn: "Account email",
            fieldType: "email",
            required: true,
            regex: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: "DEMO-STREAM-1M",
            nameAr: "شهر واحد",
            nameEn: "1 Month",
            currency: "SAR",
            baseCostMinorUnits: 1800,
            marginBasisPoints: 2000,
            taxRateBasisPoints: 1500,
            sortOrder: 1,
          },
          {
            sku: "DEMO-STREAM-3M",
            nameAr: "3 أشهر",
            nameEn: "3 Months",
            currency: "SAR",
            baseCostMinorUnits: 4900,
            marginBasisPoints: 2000,
            taxRateBasisPoints: 1500,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  const giftCardProduct = await prisma.product.upsert({
    where: { slug: "demo-play-gift-card" },
    update: {},
    create: {
      slug: "demo-play-gift-card",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      refundEligible: false,
      refundPolicyAr: "بطاقات الهدايا الرقمية غير قابلة للاسترجاع بعد تسليم الكود.",
      refundPolicyEn: "Digital gift cards are non-refundable once the code is delivered.",
      fulfillmentEtaMinutes: 2,
      isDemoData: true,
      translations: {
        create: [
          { locale: "ar", name: "بطاقة ديمو بلاي", description: "بطاقة هدايا تجريبية بقيمة ثابتة." },
          { locale: "en", name: "Demo Play Gift Card", description: "Placeholder fixed-value gift card." },
        ],
      },
      variants: {
        create: [
          {
            sku: "DEMO-GIFT-50",
            nameAr: "50 ريال",
            nameEn: "SAR 50",
            currency: "SAR",
            baseCostMinorUnits: 5000,
            marginBasisPoints: 500,
            taxRateBasisPoints: 1500,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const mockProvider = await prisma.provider.upsert({
    where: { code: "mock" },
    update: {},
    create: {
      code: "mock",
      name: "Mock Fulfillment Provider (dev/test only)",
      isActive: true,
      priority: 1,
      supportsWebhook: false,
    },
  });

  const variantsToMap = await prisma.productVariant.findMany({
    where: { sku: { in: ["DEMO-BA-DIAMOND-100", "DEMO-BA-DIAMOND-520", "DEMO-BA-DIAMOND-1080", "DEMO-STREAM-1M", "DEMO-STREAM-3M", "DEMO-GIFT-50"] } },
  });

  for (const variant of variantsToMap) {
    await prisma.providerProductMapping.upsert({
      where: { providerId_variantId: { providerId: mockProvider.id, variantId: variant.id } },
      update: {},
      create: {
        providerId: mockProvider.id,
        variantId: variant.id,
        providerSku: `MOCK-${variant.sku}`,
        providerCostMinorUnits: variant.baseCostMinorUnits,
        priority: 1,
      },
    });
  }

  const existingSaTaxRule = await prisma.taxRule.findFirst({
    where: { countryCode: "SA", productType: null },
  });
  if (!existingSaTaxRule) {
    await prisma.taxRule.create({
      data: {
        countryCode: "SA",
        taxRateBasisPoints: 1500,
        label: "Saudi Arabia standard VAT (15%)",
      },
    });
  }

  await prisma.page.upsert({
    where: { slug: "faq" },
    update: {},
    create: {
      slug: "faq",
      type: "faq",
      isPublished: true,
      translations: {
        create: [
          {
            locale: "ar",
            title: "الأسئلة الشائعة",
            bodyMarkdown:
              "## كم يستغرق الشحن؟\nيتم التنفيذ خلال دقائق بعد تأكيد الدفع في أغلب الحالات.\n\n## ماذا لو أدخلت معرف اللاعب بشكل خاطئ؟\nتحقق من صحة المعرف قبل الدفع، فمنتجات الشحن الرقمي غير قابلة للاسترجاع بعد التنفيذ.\n\n## هل يمكنني استرجاع المبلغ؟\nيعتمد ذلك على نوع المنتج، راجع [سياسة الاسترجاع](/pages/refunds).",
          },
          {
            locale: "en",
            title: "Frequently Asked Questions",
            bodyMarkdown:
              "## How long does delivery take?\nMost orders are fulfilled within minutes of payment confirmation.\n\n## What if I entered the wrong Player ID?\nDouble-check your ID before paying — digital top-ups are non-refundable once fulfilled.\n\n## Can I get a refund?\nIt depends on the product type, see our [refund policy](/pages/refunds).",
          },
        ],
      },
    },
  });

  await prisma.page.upsert({
    where: { slug: "terms" },
    update: {},
    create: {
      slug: "terms",
      type: "static",
      isPublished: true,
      translations: {
        create: [
          {
            locale: "ar",
            title: "الشروط والأحكام",
            bodyMarkdown:
              "**مسودة تحتاج مراجعة قانونية قبل الإطلاق.**\n\nباستخدامك هذا المتجر فإنك توافق على شراء منتجات رقمية (شحن ألعاب، اشتراكات، بطاقات هدايا) يتم تسليمها إلكترونيًا. يلتزم المتجر بتنفيذ الطلبات بعد تأكيد الدفع، ولا يتحمل مسؤولية إدخال بيانات حساب غير صحيحة من قبل العميل.",
          },
          {
            locale: "en",
            title: "Terms & Conditions",
            bodyMarkdown:
              "**Draft — requires legal review before launch.**\n\nBy using this store you agree to purchase digital products (game top-ups, subscriptions, gift cards) delivered electronically. The store commits to fulfilling orders after payment confirmation and is not liable for incorrect account details entered by the customer.",
          },
        ],
      },
    },
  });

  await prisma.page.upsert({
    where: { slug: "privacy" },
    update: {},
    create: {
      slug: "privacy",
      type: "static",
      isPublished: true,
      translations: {
        create: [
          {
            locale: "ar",
            title: "سياسة الخصوصية",
            bodyMarkdown:
              "**مسودة تحتاج مراجعة قانونية قبل الإطلاق.**\n\nنجمع فقط البيانات اللازمة لتنفيذ طلبك (رقم الجوال أو البريد، ومعرف اللاعب المطلوب للمنتج). لا نطلب أبدًا كلمة مرور حسابك في اللعبة. راجع نظام حماية البيانات الشخصية السعودي لتفاصيل الاحتفاظ والحذف.",
          },
          {
            locale: "en",
            title: "Privacy Policy",
            bodyMarkdown:
              "**Draft — requires legal review before launch.**\n\nWe only collect the data required to fulfill your order (phone/email, and the in-game identifiers a product needs). We never ask for your in-game account password. See the Saudi Personal Data Protection Law for retention and deletion details.",
          },
        ],
      },
    },
  });

  await prisma.page.upsert({
    where: { slug: "refunds" },
    update: {},
    create: {
      slug: "refunds",
      type: "static",
      isPublished: true,
      translations: {
        create: [
          {
            locale: "ar",
            title: "سياسة الاسترجاع",
            bodyMarkdown:
              "**مسودة تحتاج مراجعة قانونية قبل الإطلاق.**\n\nمنتجات الشحن الرقمي وبطاقات الهدايا والاشتراكات غير قابلة للاسترجاع بعد نجاح التنفيذ. في حال فشل التنفيذ من طرف المتجر أو المورد، يُعاد المبلغ كاملًا خلال أيام العمل. راجع سياسة كل منتج على صفحته.",
          },
          {
            locale: "en",
            title: "Refund Policy",
            bodyMarkdown:
              "**Draft — requires legal review before launch.**\n\nDigital top-ups, gift cards, and subscriptions are non-refundable once fulfillment succeeds. If fulfillment fails on the store's or provider's side, the full amount is refunded within business days. See each product's page for its specific policy.",
          },
        ],
      },
    },
  });

  await prisma.featureFlag.upsert({
    where: { key: "payments.moyasar.enabled" },
    update: {},
    create: { key: "payments.moyasar.enabled", isEnabled: false, description: "Toggle Moyasar live payment adapter" },
  });

  // eslint-disable-next-line no-console -- CLI seed script output
  console.log("Seed complete:", {
    products: [topupProduct.slug, subscriptionProduct.slug, giftCardProduct.slug],
    provider: mockProvider.code,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
