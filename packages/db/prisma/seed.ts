import { hash as hashPassword } from "@node-rs/argon2";
import { PrismaClient, ProductType, ProductLifecycleStatus, UserRole } from "../generated/client";

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

  const racingGameBrand = await prisma.gameBrand.upsert({
    where: { slug: "demo-racing-rush" },
    update: {},
    create: {
      slug: "demo-racing-rush",
      nameAr: "ديمو ريسينغ راش",
      nameEn: "Demo Racing Rush",
      descriptionAr: "لعبة سباقات تجريبية لعرض تدفق الشحن. استبدلها بلعبة حقيقية مرخصة قبل الإطلاق.",
      descriptionEn: "Placeholder racing game used to demonstrate the top-up flow. Replace with a licensed title before launch.",
      identifierHelpAr: "افتح اللعبة، اذهب للملف الشخصي، وانسخ Player ID الظاهر أعلى الشاشة.",
      identifierHelpEn: "Open the game, go to your profile, and copy the Player ID shown at the top of the screen.",
    },
  });

  const kingdomGameBrand = await prisma.gameBrand.upsert({
    where: { slug: "demo-kingdom-quest" },
    update: {},
    create: {
      slug: "demo-kingdom-quest",
      nameAr: "ديمو كينغدوم كويست",
      nameEn: "Demo Kingdom Quest",
      descriptionAr: "لعبة استراتيجية تجريبية لعرض تدفق الشحن. استبدلها بلعبة حقيقية مرخصة قبل الإطلاق.",
      descriptionEn: "Placeholder strategy game used to demonstrate the top-up flow. Replace with a licensed title before launch.",
      identifierHelpAr: "افتح اللعبة، اذهب للملف الشخصي، وانسخ Player ID الظاهر أعلى الشاشة.",
      identifierHelpEn: "Open the game, go to your profile, and copy the Player ID shown at the top of the screen.",
    },
  });

  const skyfallGameBrand = await prisma.gameBrand.upsert({
    where: { slug: "demo-skyfall-legends" },
    update: {},
    create: {
      slug: "demo-skyfall-legends",
      nameAr: "ديمو سكاي فول ليجندز",
      nameEn: "Demo Skyfall Legends",
      descriptionAr: "لعبة باتل رويال تجريبية لعرض تدفق الشحن. استبدلها بلعبة حقيقية مرخصة قبل الإطلاق.",
      descriptionEn: "Placeholder battle royale game used to demonstrate the top-up flow. Replace with a licensed title before launch.",
      identifierHelpAr: "افتح اللعبة، اذهب للملف الشخصي، وانسخ Player ID الظاهر أعلى الشاشة.",
      identifierHelpEn: "Open the game, go to your profile, and copy the Player ID shown at the top of the screen.",
    },
  });

  // Real, currently-live game brands — unlike the fictional "Demo ..."
  // brands above, these back real purchasable catalog entries (see the
  // products below) at the user's explicit direction for the investor-
  // facing build. Still genuine stock photography rather than official
  // box art/logos for the product images themselves (see note below).
  const pubgMobileBrand = await prisma.gameBrand.upsert({
    where: { slug: "pubg-mobile" },
    update: {},
    create: {
      slug: "pubg-mobile",
      nameAr: "ببجي موبايل",
      nameEn: "PUBG Mobile",
      descriptionAr: "شحن UC مباشر لحساب ببجي موبايل الخاص بك.",
      descriptionEn: "Direct UC top-up to your PUBG Mobile account.",
      identifierHelpAr: "افتح اللعبة، اذهب للملف الشخصي، وانسخ Character ID الظاهر أسفل اسمك.",
      identifierHelpEn: "Open the game, go to your profile, and copy the Character ID shown below your name.",
    },
  });

  const robloxBrand = await prisma.gameBrand.upsert({
    where: { slug: "roblox" },
    update: {},
    create: {
      slug: "roblox",
      nameAr: "روبلوكس",
      nameEn: "Roblox",
      descriptionAr: "شحن Robux مباشر لحساب روبلوكس الخاص بك.",
      descriptionEn: "Direct Robux top-up to your Roblox account.",
      identifierHelpAr: "أدخل اسم المستخدم (Username) الخاص بحسابك في روبلوكس.",
      identifierHelpEn: "Enter your Roblox account username.",
    },
  });

  const freeFireBrand = await prisma.gameBrand.upsert({
    where: { slug: "free-fire" },
    update: {},
    create: {
      slug: "free-fire",
      nameAr: "فري فاير",
      nameEn: "Free Fire",
      descriptionAr: "شحن الماسات مباشر لحساب فري فاير الخاص بك.",
      descriptionEn: "Direct diamond top-up to your Free Fire account.",
      identifierHelpAr: "افتح اللعبة، اذهب للملف الشخصي، وانسخ Player ID الظاهر أسفل اسمك.",
      identifierHelpEn: "Open the game, go to your profile, and copy the Player ID shown below your name.",
    },
  });

  const fortniteBrand = await prisma.gameBrand.upsert({
    where: { slug: "fortnite" },
    update: {},
    create: {
      slug: "fortnite",
      nameAr: "فورتنايت",
      nameEn: "Fortnite",
      descriptionAr: "شحن V-Bucks مباشر لحساب Epic Games الخاص بك.",
      descriptionEn: "Direct V-Bucks top-up to your Epic Games account.",
      identifierHelpAr: "أدخل البريد الإلكتروني المرتبط بحساب Epic Games الخاص بك.",
      identifierHelpEn: "Enter the email address linked to your Epic Games account.",
    },
  });

  // Real stock photography (Unsplash License — free for commercial use, no
  // attribution required), not real game screenshots/box art. These are
  // fictional demo products, not real licensed games, so using genuine
  // franchise imagery here would misleadingly imply a real publisher
  // affiliation — generic gaming-themed photography avoids that while still
  // being real photos, not flat placeholder tiles. See docs/PRICING.md-style
  // honesty conventions elsewhere in this seed file.
  const DEMO_TOPUP_IMAGE = "https://images.unsplash.com/photo-1688986760609-47835488547a?q=80&w=1200&auto=format&fit=crop";
  const DEMO_SUBSCRIPTION_IMAGE = "https://images.unsplash.com/photo-1553774661-0651f14b2da4?q=80&w=1200&auto=format&fit=crop";
  const DEMO_GIFT_CARD_IMAGE = "https://images.unsplash.com/photo-1545785028-23ee5937cf69?q=80&w=1200&auto=format&fit=crop";
  const DEMO_RACING_IMAGE = "https://images.unsplash.com/photo-1743649978995-c76212449e15?q=80&w=1200&auto=format&fit=crop";
  const DEMO_KINGDOM_IMAGE = "https://images.unsplash.com/photo-1570989614585-581ee5f7e165?q=80&w=1200&auto=format&fit=crop";
  const DEMO_MUSIC_IMAGE = "https://images.unsplash.com/photo-1601066525716-3cca33c6d4c6?q=80&w=1200&auto=format&fit=crop";
  const DEMO_CLOUD_ARCADE_IMAGE = "https://images.unsplash.com/photo-1755436613066-066d20f6445a?q=80&w=1200&auto=format&fit=crop";
  const DEMO_STYLE_CARD_IMAGE = "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop";
  const DEMO_SKYFALL_IMAGE = "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?q=80&w=1200&auto=format&fit=crop";
  const DEMO_PREMIUM_CARD_IMAGE = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop";
  const SHOPPING_GIFT_CARD_IMAGE = "https://images.unsplash.com/photo-1597463330912-eb868206b68e?q=80&w=1200&auto=format&fit=crop";

  const topupProduct = await prisma.product.upsert({
    where: { slug: "demo-battle-arena-diamonds" },
    update: { imageUrl: DEMO_TOPUP_IMAGE },
    create: {
      slug: "demo-battle-arena-diamonds",
      type: ProductType.GAME_TOPUP,
      categoryId: gamesCategory.id,
      gameBrandId: demoGameBrand.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_TOPUP_IMAGE,
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
    update: { imageUrl: DEMO_SUBSCRIPTION_IMAGE },
    create: {
      slug: "demo-streaming-plus",
      type: ProductType.SUBSCRIPTION,
      categoryId: subscriptionsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_SUBSCRIPTION_IMAGE,
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
    update: { imageUrl: DEMO_GIFT_CARD_IMAGE },
    create: {
      slug: "demo-play-gift-card",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_GIFT_CARD_IMAGE,
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

  const racingProduct = await prisma.product.upsert({
    where: { slug: "demo-racing-rush-coins" },
    update: { imageUrl: DEMO_RACING_IMAGE },
    create: {
      slug: "demo-racing-rush-coins",
      type: ProductType.GAME_TOPUP,
      categoryId: gamesCategory.id,
      gameBrandId: racingGameBrand.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_RACING_IMAGE,
      refundEligible: false,
      refundPolicyAr: "منتجات الشحن الرقمي غير قابلة للاسترجاع بعد نجاح التنفيذ.",
      refundPolicyEn: "Digital top-up products are non-refundable once fulfillment succeeds.",
      fulfillmentEtaMinutes: 5,
      isDemoData: true,
      translations: {
        create: [
          { locale: "ar", name: "عملات ديمو ريسينغ راش", description: "شحن عملات مباشر إلى حساب اللعبة." },
          { locale: "en", name: "Demo Racing Rush Coins", description: "Direct coin top-up to your game account." },
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
        ],
      },
      variants: {
        create: [
          {
            sku: "DEMO-RR-COINS-500",
            nameAr: "500 عملة",
            nameEn: "500 Coins",
            currency: "SAR",
            baseCostMinorUnits: 500,
            marginBasisPoints: 1500,
            taxRateBasisPoints: 1500,
            sortOrder: 1,
          },
          {
            sku: "DEMO-RR-COINS-2500",
            nameAr: "2500 عملة",
            nameEn: "2500 Coins",
            currency: "SAR",
            baseCostMinorUnits: 2300,
            marginBasisPoints: 1500,
            taxRateBasisPoints: 1500,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  const kingdomProduct = await prisma.product.upsert({
    where: { slug: "demo-kingdom-quest-gems" },
    update: { imageUrl: DEMO_KINGDOM_IMAGE },
    create: {
      slug: "demo-kingdom-quest-gems",
      type: ProductType.GAME_TOPUP,
      categoryId: gamesCategory.id,
      gameBrandId: kingdomGameBrand.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_KINGDOM_IMAGE,
      refundEligible: false,
      refundPolicyAr: "منتجات الشحن الرقمي غير قابلة للاسترجاع بعد نجاح التنفيذ.",
      refundPolicyEn: "Digital top-up products are non-refundable once fulfillment succeeds.",
      fulfillmentEtaMinutes: 5,
      isDemoData: true,
      translations: {
        create: [
          { locale: "ar", name: "جواهر ديمو كينغدوم كويست", description: "شحن جواهر مباشر إلى حساب اللعبة." },
          { locale: "en", name: "Demo Kingdom Quest Gems", description: "Direct gem top-up to your game account." },
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
        ],
      },
      variants: {
        create: [
          {
            sku: "DEMO-KQ-GEMS-300",
            nameAr: "300 جوهرة",
            nameEn: "300 Gems",
            currency: "SAR",
            baseCostMinorUnits: 900,
            marginBasisPoints: 1500,
            taxRateBasisPoints: 1500,
            sortOrder: 1,
          },
          {
            sku: "DEMO-KQ-GEMS-1500",
            nameAr: "1500 جوهرة",
            nameEn: "1500 Gems",
            currency: "SAR",
            baseCostMinorUnits: 4200,
            marginBasisPoints: 1500,
            taxRateBasisPoints: 1500,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  const musicProduct = await prisma.product.upsert({
    where: { slug: "demo-music-wave" },
    update: { imageUrl: DEMO_MUSIC_IMAGE },
    create: {
      slug: "demo-music-wave",
      type: ProductType.SUBSCRIPTION,
      categoryId: subscriptionsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_MUSIC_IMAGE,
      refundEligible: false,
      refundPolicyAr: "الاشتراكات الرقمية غير قابلة للاسترجاع بعد تفعيل الكود.",
      refundPolicyEn: "Digital subscriptions are non-refundable once the code is activated.",
      fulfillmentEtaMinutes: 10,
      isDemoData: true,
      translations: {
        create: [
          { locale: "ar", name: "اشتراك ديمو ميوزك ويف", description: "اشتراك شهري تجريبي لخدمة بث موسيقى تجريبية." },
          { locale: "en", name: "Demo Music Wave", description: "Placeholder monthly subscription for a demo music streaming service." },
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
            sku: "DEMO-MUSIC-1M",
            nameAr: "شهر واحد",
            nameEn: "1 Month",
            currency: "SAR",
            baseCostMinorUnits: 1200,
            marginBasisPoints: 2000,
            taxRateBasisPoints: 1500,
            sortOrder: 1,
          },
          {
            sku: "DEMO-MUSIC-12M",
            nameAr: "سنة كاملة",
            nameEn: "12 Months",
            currency: "SAR",
            baseCostMinorUnits: 12000,
            marginBasisPoints: 2000,
            taxRateBasisPoints: 1500,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  const cloudArcadeProduct = await prisma.product.upsert({
    where: { slug: "demo-cloud-arcade" },
    update: { imageUrl: DEMO_CLOUD_ARCADE_IMAGE },
    create: {
      slug: "demo-cloud-arcade",
      type: ProductType.SUBSCRIPTION,
      categoryId: subscriptionsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_CLOUD_ARCADE_IMAGE,
      refundEligible: false,
      refundPolicyAr: "الاشتراكات الرقمية غير قابلة للاسترجاع بعد تفعيل الكود.",
      refundPolicyEn: "Digital subscriptions are non-refundable once the code is activated.",
      fulfillmentEtaMinutes: 10,
      isDemoData: true,
      translations: {
        create: [
          { locale: "ar", name: "اشتراك ديمو كلاود أركيد", description: "اشتراك شهري تجريبي لخدمة ألعاب سحابية تجريبية." },
          { locale: "en", name: "Demo Cloud Arcade", description: "Placeholder monthly subscription for a demo cloud gaming service." },
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
            sku: "DEMO-CLOUD-1M",
            nameAr: "شهر واحد",
            nameEn: "1 Month",
            currency: "SAR",
            baseCostMinorUnits: 2500,
            marginBasisPoints: 2000,
            taxRateBasisPoints: 1500,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const styleCardProduct = await prisma.product.upsert({
    where: { slug: "demo-style-gift-card" },
    update: { imageUrl: DEMO_STYLE_CARD_IMAGE },
    create: {
      slug: "demo-style-gift-card",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_STYLE_CARD_IMAGE,
      refundEligible: false,
      refundPolicyAr: "بطاقات الهدايا الرقمية غير قابلة للاسترجاع بعد تسليم الكود.",
      refundPolicyEn: "Digital gift cards are non-refundable once the code is delivered.",
      fulfillmentEtaMinutes: 2,
      isDemoData: true,
      translations: {
        create: [
          { locale: "ar", name: "بطاقة ديمو ستايل", description: "بطاقة هدايا تجريبية للتسوق والأزياء." },
          { locale: "en", name: "Demo Style Gift Card", description: "Placeholder fashion & shopping gift card." },
        ],
      },
      variants: {
        create: [
          {
            sku: "DEMO-STYLE-100",
            nameAr: "100 ريال",
            nameEn: "SAR 100",
            currency: "SAR",
            baseCostMinorUnits: 10000,
            marginBasisPoints: 500,
            taxRateBasisPoints: 1500,
            sortOrder: 1,
          },
          {
            sku: "DEMO-STYLE-200",
            nameAr: "200 ريال",
            nameEn: "SAR 200",
            currency: "SAR",
            baseCostMinorUnits: 20000,
            marginBasisPoints: 500,
            taxRateBasisPoints: 1500,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  const skyfallProduct = await prisma.product.upsert({
    where: { slug: "demo-skyfall-legends-credits" },
    update: { imageUrl: DEMO_SKYFALL_IMAGE },
    create: {
      slug: "demo-skyfall-legends-credits",
      type: ProductType.GAME_TOPUP,
      categoryId: gamesCategory.id,
      gameBrandId: skyfallGameBrand.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_SKYFALL_IMAGE,
      refundEligible: false,
      refundPolicyAr: "منتجات الشحن الرقمي غير قابلة للاسترجاع بعد نجاح التنفيذ.",
      refundPolicyEn: "Digital top-up products are non-refundable once fulfillment succeeds.",
      fulfillmentEtaMinutes: 5,
      isDemoData: true,
      translations: {
        create: [
          { locale: "ar", name: "كريدت ديمو سكاي فول ليجندز", description: "شحن كريدت مباشر إلى حساب اللعبة." },
          { locale: "en", name: "Demo Skyfall Legends Credits", description: "Direct credits top-up to your game account." },
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
        ],
      },
      variants: {
        create: [
          {
            sku: "DEMO-SF-CREDITS-600",
            nameAr: "600 كريدت",
            nameEn: "600 Credits",
            currency: "SAR",
            baseCostMinorUnits: 550,
            marginBasisPoints: 1500,
            taxRateBasisPoints: 1500,
            sortOrder: 1,
          },
          {
            sku: "DEMO-SF-CREDITS-3000",
            nameAr: "3000 كريدت",
            nameEn: "3000 Credits",
            currency: "SAR",
            baseCostMinorUnits: 2600,
            marginBasisPoints: 1500,
            taxRateBasisPoints: 1500,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  const premiumCardProduct = await prisma.product.upsert({
    where: { slug: "demo-premium-gift-card" },
    update: { imageUrl: DEMO_PREMIUM_CARD_IMAGE },
    create: {
      slug: "demo-premium-gift-card",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_PREMIUM_CARD_IMAGE,
      refundEligible: false,
      refundPolicyAr: "بطاقات الهدايا الرقمية غير قابلة للاسترجاع بعد تسليم الكود.",
      refundPolicyEn: "Digital gift cards are non-refundable once the code is delivered.",
      fulfillmentEtaMinutes: 2,
      isDemoData: true,
      translations: {
        create: [
          { locale: "ar", name: "بطاقة ديمو بريميوم", description: "بطاقة هدايا تجريبية متعددة الاستخدامات." },
          { locale: "en", name: "Demo Premium Gift Card", description: "Placeholder general-purpose gift card." },
        ],
      },
      variants: {
        create: [
          {
            sku: "DEMO-PREMIUM-75",
            nameAr: "75 ريال",
            nameEn: "SAR 75",
            currency: "SAR",
            baseCostMinorUnits: 7500,
            marginBasisPoints: 500,
            taxRateBasisPoints: 1500,
            sortOrder: 1,
          },
          {
            sku: "DEMO-PREMIUM-150",
            nameAr: "150 ريال",
            nameEn: "SAR 150",
            currency: "SAR",
            baseCostMinorUnits: 15000,
            marginBasisPoints: 500,
            taxRateBasisPoints: 1500,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  // Real, currently-purchasable catalog entries (isDemoData: false — no
  // "تجريبي/Demo" badge) for the investor-facing build, per explicit
  // direction. Denominations match real, publicly-known market tiers for
  // each of these products (Steam wallet KSA amounts, standard Apple gift
  // card face values, standard PSN/Amazon/noon KSA tiers, real PUBG
  // Mobile UC and Roblox Robux bundle sizes) — these are fixed by the
  // platform owners themselves and identical across every reseller, not
  // anything invented or copied from a specific competitor's listing.
  // Still using real stock photography rather than official brand
  // artwork/logos for the same reason as the fictional products above.
  const steamWalletProduct = await prisma.product.upsert({
    where: { slug: "steam-wallet-ksa" },
    update: { imageUrl: DEMO_GIFT_CARD_IMAGE },
    create: {
      slug: "steam-wallet-ksa",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_GIFT_CARD_IMAGE,
      refundEligible: false,
      refundPolicyAr: "بطاقات الهدايا الرقمية غير قابلة للاسترجاع بعد تسليم الكود.",
      refundPolicyEn: "Digital gift cards are non-refundable once the code is delivered.",
      fulfillmentEtaMinutes: 2,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "بطاقة ستيم السعودية", description: "بطاقة شحن محفظة Steam للمتجر السعودي، تسليم فوري." },
          { locale: "en", name: "Steam Wallet Card (KSA)", description: "Steam wallet top-up card for the Saudi store, instant delivery." },
        ],
      },
      variants: {
        create: [
          { sku: "STEAM-KSA-20", nameAr: "20 ريال", nameEn: "SAR 20", currency: "SAR", baseCostMinorUnits: 2000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "STEAM-KSA-50", nameAr: "50 ريال", nameEn: "SAR 50", currency: "SAR", baseCostMinorUnits: 5000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "STEAM-KSA-100", nameAr: "100 ريال", nameEn: "SAR 100", currency: "SAR", baseCostMinorUnits: 10000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 3 },
          { sku: "STEAM-KSA-200", nameAr: "200 ريال", nameEn: "SAR 200", currency: "SAR", baseCostMinorUnits: 20000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 4 },
          { sku: "STEAM-KSA-400", nameAr: "400 ريال", nameEn: "SAR 400", currency: "SAR", baseCostMinorUnits: 40000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 5 },
        ],
      },
    },
  });

  const itunesGiftCardProduct = await prisma.product.upsert({
    where: { slug: "itunes-gift-card-us" },
    update: { imageUrl: DEMO_GIFT_CARD_IMAGE },
    create: {
      slug: "itunes-gift-card-us",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_GIFT_CARD_IMAGE,
      refundEligible: false,
      refundPolicyAr: "بطاقات الهدايا الرقمية غير قابلة للاسترجاع بعد تسليم الكود.",
      refundPolicyEn: "Digital gift cards are non-refundable once the code is delivered.",
      fulfillmentEtaMinutes: 2,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "بطاقة آيتونز أمريكي", description: "بطاقة آيتونز للمتجر الأمريكي، تسليم فوري." },
          { locale: "en", name: "iTunes Gift Card (US)", description: "iTunes gift card for the US store, instant delivery." },
        ],
      },
      variants: {
        create: [
          { sku: "ITUNES-US-15", nameAr: "15 دولار", nameEn: "$15", currency: "SAR", baseCostMinorUnits: 6000, marginBasisPoints: 400, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "ITUNES-US-25", nameAr: "25 دولار", nameEn: "$25", currency: "SAR", baseCostMinorUnits: 9500, marginBasisPoints: 400, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "ITUNES-US-50", nameAr: "50 دولار", nameEn: "$50", currency: "SAR", baseCostMinorUnits: 19000, marginBasisPoints: 400, taxRateBasisPoints: 1500, sortOrder: 3 },
        ],
      },
    },
  });

  const playstationStoreProduct = await prisma.product.upsert({
    where: { slug: "playstation-store-ksa" },
    update: { imageUrl: DEMO_GIFT_CARD_IMAGE },
    create: {
      slug: "playstation-store-ksa",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_GIFT_CARD_IMAGE,
      refundEligible: false,
      refundPolicyAr: "بطاقات الهدايا الرقمية غير قابلة للاسترجاع بعد تسليم الكود.",
      refundPolicyEn: "Digital gift cards are non-refundable once the code is delivered.",
      fulfillmentEtaMinutes: 2,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "بطاقة بلايستيشن السعودية", description: "بطاقة شحن محفظة PlayStation Store للمتجر السعودي، تسليم فوري." },
          { locale: "en", name: "PlayStation Store Card (KSA)", description: "PlayStation Store wallet top-up card for the Saudi store, instant delivery." },
        ],
      },
      variants: {
        create: [
          { sku: "PSN-KSA-40", nameAr: "40 ريال", nameEn: "SAR 40", currency: "SAR", baseCostMinorUnits: 4000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "PSN-KSA-80", nameAr: "80 ريال", nameEn: "SAR 80", currency: "SAR", baseCostMinorUnits: 8000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "PSN-KSA-160", nameAr: "160 ريال", nameEn: "SAR 160", currency: "SAR", baseCostMinorUnits: 16000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 3 },
          { sku: "PSN-KSA-300", nameAr: "300 ريال", nameEn: "SAR 300", currency: "SAR", baseCostMinorUnits: 30000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 4 },
        ],
      },
    },
  });

  const amazonGiftCardProduct = await prisma.product.upsert({
    where: { slug: "amazon-sa-gift-card" },
    update: { imageUrl: SHOPPING_GIFT_CARD_IMAGE },
    create: {
      slug: "amazon-sa-gift-card",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: SHOPPING_GIFT_CARD_IMAGE,
      refundEligible: false,
      refundPolicyAr: "بطاقات الهدايا الرقمية غير قابلة للاسترجاع بعد تسليم الكود.",
      refundPolicyEn: "Digital gift cards are non-refundable once the code is delivered.",
      fulfillmentEtaMinutes: 2,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "بطاقة أمازون السعودية", description: "بطاقة هدايا أمازون السعودية، تسليم فوري." },
          { locale: "en", name: "Amazon.sa Gift Card", description: "Amazon Saudi Arabia gift card, instant delivery." },
        ],
      },
      variants: {
        create: [
          { sku: "AMAZON-SA-50", nameAr: "50 ريال", nameEn: "SAR 50", currency: "SAR", baseCostMinorUnits: 5000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "AMAZON-SA-100", nameAr: "100 ريال", nameEn: "SAR 100", currency: "SAR", baseCostMinorUnits: 10000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "AMAZON-SA-250", nameAr: "250 ريال", nameEn: "SAR 250", currency: "SAR", baseCostMinorUnits: 25000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 3 },
          { sku: "AMAZON-SA-500", nameAr: "500 ريال", nameEn: "SAR 500", currency: "SAR", baseCostMinorUnits: 50000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 4 },
        ],
      },
    },
  });

  const noonGiftCardProduct = await prisma.product.upsert({
    where: { slug: "noon-gift-card" },
    update: { imageUrl: SHOPPING_GIFT_CARD_IMAGE },
    create: {
      slug: "noon-gift-card",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: SHOPPING_GIFT_CARD_IMAGE,
      refundEligible: false,
      refundPolicyAr: "بطاقات الهدايا الرقمية غير قابلة للاسترجاع بعد تسليم الكود.",
      refundPolicyEn: "Digital gift cards are non-refundable once the code is delivered.",
      fulfillmentEtaMinutes: 2,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "بطاقة نون", description: "بطاقة هدايا نون، تسليم فوري." },
          { locale: "en", name: "noon Gift Card", description: "noon gift card, instant delivery." },
        ],
      },
      variants: {
        create: [
          { sku: "NOON-50", nameAr: "50 ريال", nameEn: "SAR 50", currency: "SAR", baseCostMinorUnits: 5000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "NOON-100", nameAr: "100 ريال", nameEn: "SAR 100", currency: "SAR", baseCostMinorUnits: 10000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "NOON-200", nameAr: "200 ريال", nameEn: "SAR 200", currency: "SAR", baseCostMinorUnits: 20000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 3 },
          { sku: "NOON-500", nameAr: "500 ريال", nameEn: "SAR 500", currency: "SAR", baseCostMinorUnits: 50000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 4 },
        ],
      },
    },
  });

  const pubgMobileProduct = await prisma.product.upsert({
    where: { slug: "pubg-mobile-uc" },
    update: { imageUrl: DEMO_TOPUP_IMAGE },
    create: {
      slug: "pubg-mobile-uc",
      type: ProductType.GAME_TOPUP,
      categoryId: gamesCategory.id,
      gameBrandId: pubgMobileBrand.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_TOPUP_IMAGE,
      refundEligible: false,
      refundPolicyAr: "منتجات الشحن الرقمي غير قابلة للاسترجاع بعد نجاح التنفيذ.",
      refundPolicyEn: "Digital top-up products are non-refundable once fulfillment succeeds.",
      fulfillmentEtaMinutes: 5,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "شحن UC ببجي موبايل", description: "شحن UC مباشر إلى حساب ببجي موبايل." },
          { locale: "en", name: "PUBG Mobile UC", description: "Direct UC top-up to your PUBG Mobile account." },
        ],
      },
      inputDefinitions: {
        create: [
          {
            key: "characterId",
            labelAr: "معرف الشخصية (Character ID)",
            labelEn: "Character ID",
            helpTextAr: "رقم يظهر أسفل اسمك في الملف الشخصي داخل اللعبة.",
            helpTextEn: "Found below your name on your in-game profile.",
            fieldType: "text",
            required: true,
            regex: "^[0-9]{8,12}$",
            minLength: 8,
            maxLength: 12,
            normalize: "digitsOnly",
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          { sku: "PUBGM-UC-60", nameAr: "60 UC", nameEn: "60 UC", currency: "SAR", baseCostMinorUnits: 2400, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "PUBGM-UC-325", nameAr: "325 UC", nameEn: "325 UC", currency: "SAR", baseCostMinorUnits: 12000, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "PUBGM-UC-660", nameAr: "660 UC", nameEn: "660 UC", currency: "SAR", baseCostMinorUnits: 23500, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 3 },
        ],
      },
    },
  });

  const robloxProduct = await prisma.product.upsert({
    where: { slug: "roblox-robux" },
    update: { imageUrl: DEMO_TOPUP_IMAGE },
    create: {
      slug: "roblox-robux",
      type: ProductType.GAME_TOPUP,
      categoryId: gamesCategory.id,
      gameBrandId: robloxBrand.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_TOPUP_IMAGE,
      refundEligible: false,
      refundPolicyAr: "منتجات الشحن الرقمي غير قابلة للاسترجاع بعد نجاح التنفيذ.",
      refundPolicyEn: "Digital top-up products are non-refundable once fulfillment succeeds.",
      fulfillmentEtaMinutes: 5,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "شحن Robux روبلوكس", description: "شحن Robux مباشر إلى حساب روبلوكس." },
          { locale: "en", name: "Roblox Robux", description: "Direct Robux top-up to your Roblox account." },
        ],
      },
      inputDefinitions: {
        create: [
          {
            key: "username",
            labelAr: "اسم المستخدم (Username)",
            labelEn: "Username",
            helpTextAr: "اسم حسابك في روبلوكس كما يظهر في الملف الشخصي.",
            helpTextEn: "Your Roblox account username, as shown on your profile.",
            fieldType: "text",
            required: true,
            regex: "^[A-Za-z0-9_]{3,20}$",
            minLength: 3,
            maxLength: 20,
            normalize: "trim",
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          { sku: "ROBLOX-RBX-400", nameAr: "400 Robux", nameEn: "400 Robux", currency: "SAR", baseCostMinorUnits: 2000, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "ROBLOX-RBX-800", nameAr: "800 Robux", nameEn: "800 Robux", currency: "SAR", baseCostMinorUnits: 3800, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "ROBLOX-RBX-1700", nameAr: "1700 Robux", nameEn: "1700 Robux", currency: "SAR", baseCostMinorUnits: 7500, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 3 },
        ],
      },
    },
  });

  // Four more real, industry-standard products — same reasoning and
  // sourcing approach as the seven above: denominations fixed by the
  // platform owners (Garena/Google/Microsoft/Epic) and identical across
  // every reseller in the region.
  const freeFireProduct = await prisma.product.upsert({
    where: { slug: "free-fire-diamonds" },
    update: { imageUrl: DEMO_TOPUP_IMAGE },
    create: {
      slug: "free-fire-diamonds",
      type: ProductType.GAME_TOPUP,
      categoryId: gamesCategory.id,
      gameBrandId: freeFireBrand.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_TOPUP_IMAGE,
      refundEligible: false,
      refundPolicyAr: "منتجات الشحن الرقمي غير قابلة للاسترجاع بعد نجاح التنفيذ.",
      refundPolicyEn: "Digital top-up products are non-refundable once fulfillment succeeds.",
      fulfillmentEtaMinutes: 5,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "شحن ماسات فري فاير", description: "شحن ماسات مباشر إلى حساب فري فاير." },
          { locale: "en", name: "Free Fire Diamonds", description: "Direct diamond top-up to your Free Fire account." },
        ],
      },
      inputDefinitions: {
        create: [
          {
            key: "playerId",
            labelAr: "معرف اللاعب (Player ID)",
            labelEn: "Player ID",
            helpTextAr: "رقم يظهر أسفل اسمك في الملف الشخصي داخل اللعبة.",
            helpTextEn: "Found below your name on your in-game profile.",
            fieldType: "text",
            required: true,
            regex: "^[0-9]{6,12}$",
            minLength: 6,
            maxLength: 12,
            normalize: "digitsOnly",
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          { sku: "FF-DIAMOND-100", nameAr: "100 ماسة", nameEn: "100 Diamonds", currency: "SAR", baseCostMinorUnits: 500, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "FF-DIAMOND-310", nameAr: "310 ماسة", nameEn: "310 Diamonds", currency: "SAR", baseCostMinorUnits: 1400, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "FF-DIAMOND-520", nameAr: "520 ماسة", nameEn: "520 Diamonds", currency: "SAR", baseCostMinorUnits: 2400, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 3 },
          { sku: "FF-DIAMOND-1060", nameAr: "1060 ماسة", nameEn: "1060 Diamonds", currency: "SAR", baseCostMinorUnits: 4700, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 4 },
        ],
      },
    },
  });

  const googlePlayGiftCardProduct = await prisma.product.upsert({
    where: { slug: "google-play-gift-card" },
    update: { imageUrl: DEMO_GIFT_CARD_IMAGE },
    create: {
      slug: "google-play-gift-card",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_GIFT_CARD_IMAGE,
      refundEligible: false,
      refundPolicyAr: "بطاقات الهدايا الرقمية غير قابلة للاسترجاع بعد تسليم الكود.",
      refundPolicyEn: "Digital gift cards are non-refundable once the code is delivered.",
      fulfillmentEtaMinutes: 2,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "بطاقة جوجل بلاي", description: "بطاقة شحن Google Play للمتجر السعودي، تسليم فوري." },
          { locale: "en", name: "Google Play Gift Card", description: "Google Play gift card for the Saudi store, instant delivery." },
        ],
      },
      variants: {
        create: [
          { sku: "GPLAY-KSA-15", nameAr: "15 ريال", nameEn: "SAR 15", currency: "SAR", baseCostMinorUnits: 1500, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "GPLAY-KSA-30", nameAr: "30 ريال", nameEn: "SAR 30", currency: "SAR", baseCostMinorUnits: 3000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "GPLAY-KSA-60", nameAr: "60 ريال", nameEn: "SAR 60", currency: "SAR", baseCostMinorUnits: 6000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 3 },
          { sku: "GPLAY-KSA-100", nameAr: "100 ريال", nameEn: "SAR 100", currency: "SAR", baseCostMinorUnits: 10000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 4 },
          { sku: "GPLAY-KSA-200", nameAr: "200 ريال", nameEn: "SAR 200", currency: "SAR", baseCostMinorUnits: 20000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 5 },
        ],
      },
    },
  });

  const xboxGiftCardProduct = await prisma.product.upsert({
    where: { slug: "xbox-gift-card" },
    update: { imageUrl: DEMO_GIFT_CARD_IMAGE },
    create: {
      slug: "xbox-gift-card",
      type: ProductType.GIFT_CARD,
      categoryId: giftCardsCategory.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_GIFT_CARD_IMAGE,
      refundEligible: false,
      refundPolicyAr: "بطاقات الهدايا الرقمية غير قابلة للاسترجاع بعد تسليم الكود.",
      refundPolicyEn: "Digital gift cards are non-refundable once the code is delivered.",
      fulfillmentEtaMinutes: 2,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "بطاقة إكس بوكس", description: "بطاقة هدايا Xbox، تسليم فوري." },
          { locale: "en", name: "Xbox Gift Card", description: "Xbox gift card, instant delivery." },
        ],
      },
      variants: {
        create: [
          { sku: "XBOX-KSA-50", nameAr: "50 ريال", nameEn: "SAR 50", currency: "SAR", baseCostMinorUnits: 5000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "XBOX-KSA-100", nameAr: "100 ريال", nameEn: "SAR 100", currency: "SAR", baseCostMinorUnits: 10000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "XBOX-KSA-200", nameAr: "200 ريال", nameEn: "SAR 200", currency: "SAR", baseCostMinorUnits: 20000, marginBasisPoints: 300, taxRateBasisPoints: 1500, sortOrder: 3 },
        ],
      },
    },
  });

  const fortniteProduct = await prisma.product.upsert({
    where: { slug: "fortnite-v-bucks" },
    update: { imageUrl: DEMO_TOPUP_IMAGE },
    create: {
      slug: "fortnite-v-bucks",
      type: ProductType.GAME_TOPUP,
      categoryId: gamesCategory.id,
      gameBrandId: fortniteBrand.id,
      status: ProductLifecycleStatus.ACTIVE,
      imageUrl: DEMO_TOPUP_IMAGE,
      refundEligible: false,
      refundPolicyAr: "منتجات الشحن الرقمي غير قابلة للاسترجاع بعد نجاح التنفيذ.",
      refundPolicyEn: "Digital top-up products are non-refundable once fulfillment succeeds.",
      fulfillmentEtaMinutes: 5,
      isDemoData: false,
      translations: {
        create: [
          { locale: "ar", name: "شحن V-Bucks فورتنايت", description: "شحن V-Bucks مباشر إلى حساب Epic Games الخاص بك." },
          { locale: "en", name: "Fortnite V-Bucks", description: "Direct V-Bucks top-up to your Epic Games account." },
        ],
      },
      inputDefinitions: {
        create: [
          {
            key: "epicEmail",
            labelAr: "البريد الإلكتروني لحساب Epic Games",
            labelEn: "Epic Games account email",
            helpTextAr: "البريد الإلكتروني المستخدم لتسجيل الدخول إلى حسابك في Epic Games.",
            helpTextEn: "The email address you use to sign in to your Epic Games account.",
            fieldType: "email",
            required: true,
            normalize: "trim",
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          { sku: "FORTNITE-VB-1000", nameAr: "1000 V-Bucks", nameEn: "1000 V-Bucks", currency: "SAR", baseCostMinorUnits: 3500, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 1 },
          { sku: "FORTNITE-VB-2800", nameAr: "2800 V-Bucks", nameEn: "2800 V-Bucks", currency: "SAR", baseCostMinorUnits: 9500, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 2 },
          { sku: "FORTNITE-VB-5000", nameAr: "5000 V-Bucks", nameEn: "5000 V-Bucks", currency: "SAR", baseCostMinorUnits: 16500, marginBasisPoints: 1500, taxRateBasisPoints: 1500, sortOrder: 3 },
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
    where: {
      sku: {
        in: [
          "DEMO-BA-DIAMOND-100",
          "DEMO-BA-DIAMOND-520",
          "DEMO-BA-DIAMOND-1080",
          "DEMO-STREAM-1M",
          "DEMO-STREAM-3M",
          "DEMO-GIFT-50",
          "DEMO-RR-COINS-500",
          "DEMO-RR-COINS-2500",
          "DEMO-KQ-GEMS-300",
          "DEMO-KQ-GEMS-1500",
          "DEMO-MUSIC-1M",
          "DEMO-MUSIC-12M",
          "DEMO-CLOUD-1M",
          "DEMO-STYLE-100",
          "DEMO-STYLE-200",
          "DEMO-SF-CREDITS-600",
          "DEMO-SF-CREDITS-3000",
          "DEMO-PREMIUM-75",
          "DEMO-PREMIUM-150",
          "STEAM-KSA-20",
          "STEAM-KSA-50",
          "STEAM-KSA-100",
          "STEAM-KSA-200",
          "STEAM-KSA-400",
          "ITUNES-US-15",
          "ITUNES-US-25",
          "ITUNES-US-50",
          "PSN-KSA-40",
          "PSN-KSA-80",
          "PSN-KSA-160",
          "PSN-KSA-300",
          "AMAZON-SA-50",
          "AMAZON-SA-100",
          "AMAZON-SA-250",
          "AMAZON-SA-500",
          "NOON-50",
          "NOON-100",
          "NOON-200",
          "NOON-500",
          "PUBGM-UC-60",
          "PUBGM-UC-325",
          "PUBGM-UC-660",
          "ROBLOX-RBX-400",
          "ROBLOX-RBX-800",
          "ROBLOX-RBX-1700",
          "FF-DIAMOND-100",
          "FF-DIAMOND-310",
          "FF-DIAMOND-520",
          "FF-DIAMOND-1060",
          "GPLAY-KSA-15",
          "GPLAY-KSA-30",
          "GPLAY-KSA-60",
          "GPLAY-KSA-100",
          "GPLAY-KSA-200",
          "XBOX-KSA-50",
          "XBOX-KSA-100",
          "XBOX-KSA-200",
          "FORTNITE-VB-1000",
          "FORTNITE-VB-2800",
          "FORTNITE-VB-5000",
        ],
      },
    },
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

  const blogPosts: Array<{
    slug: string;
    categorySlug: string;
    readingMinutes: number;
    daysAgo: number;
    ar: { title: string; excerpt: string; bodyMarkdown: string };
    en: { title: string; excerpt: string; bodyMarkdown: string };
  }> = [
    {
      slug: "safe-fast-top-up-guide",
      categorySlug: "guides",
      readingMinutes: 6,
      daysAgo: 1,
      ar: {
        title: "الدليل الكامل لشحن الألعاب بأمان وسرعة",
        excerpt: "تعرف على أفضل الطرق لشحن الألعاب بطريقة آمنة وسريعة، واختيار وسيلة الدفع المناسبة لك داخل متجر شحنو.",
        bodyMarkdown:
          "## قبل أن تبدأ\nتأكد دائمًا من نسخ معرف اللاعب (Player ID) بدقة من داخل اللعبة نفسها قبل إتمام عملية الشحن — أغلب مشاكل الشحن تحدث بسبب خطأ بسيط في نسخ المعرف.\n\n## اختيار الفئة الصحيحة\nكل منتج يعرض الفئات المتاحة (مثل عدد العملات أو مدة الاشتراك) مع السعر الفعلي لكل فئة — اختر ما يناسب استخدامك الفعلي بدل الشراء بكميات أكبر من حاجتك.\n\n## إتمام الدفع\nبعد اختيار الفئة وإدخال البيانات المطلوبة، ستتم مطالبتك بإتمام الدفع. بعد تأكيد الدفع، يتم تنفيذ الطلب خلال دقائق في أغلب الحالات.\n\n## بعد الشحن\nإذا واجهت أي مشكلة بعد الدفع، راجع صفحة تتبع الطلب المرسلة إليك، أو تواصل مع الدعم الفني عبر صفحة المساعدة.",
      },
      en: {
        title: "The Complete Guide to Safe, Fast Game Top-Ups",
        excerpt: "Learn the best ways to top up your games safely and quickly, and how to pick the right payment method on Shahnoo.",
        bodyMarkdown:
          "## Before you start\nAlways double-check your in-game Player ID before completing a top-up — most top-up issues come from a simple copy-paste mistake.\n\n## Choosing the right tier\nEvery product lists its available tiers (like coin amounts or subscription length) with the real price for each — pick what matches your actual usage instead of over-buying.\n\n## Completing payment\nAfter selecting a tier and entering the required details, you'll be asked to complete payment. Once confirmed, most orders fulfill within minutes.\n\n## After topping up\nIf anything goes wrong after payment, check the order tracking page sent to you, or reach out via the help page.",
      },
    },
    {
      slug: "protect-your-account-while-topping-up",
      categorySlug: "account-protection",
      readingMinutes: 4,
      daysAgo: 2,
      ar: {
        title: "كيف تحمي حسابك أثناء الشحن؟",
        excerpt: "خطوات بسيطة تحميك من أخطاء الشحن الشائعة وتحافظ على أمان حسابك وبياناتك أثناء عمليات الدفع الإلكتروني.",
        bodyMarkdown:
          "## لا تشارك كلمة مرور حسابك أبدًا\nأي متجر شحن حقيقي لا يحتاج أبدًا كلمة مرور حساب اللعبة الخاص بك — يكفي فقط معرف اللاعب (ID) الظاهر داخل اللعبة.\n\n## تحقق من المعرف مرتين\nمنتجات الشحن الرقمي غير قابلة للاسترجاع بعد التنفيذ، لذا تحقق من صحة المعرف ونوع الخادم (Server) إن وجد قبل الدفع.\n\n## استخدم وسيلة دفع تعرفها\nتجنب مشاركة بيانات بطاقتك في أي موقع لا تثق به، واحرص أن تكون صفحة الدفع مشفّرة (HTTPS).\n\n## احتفظ برقم الطلب\nبعد إتمام الشحن، احتفظ برقم الطلب ورابط التتبع المرسل لك — ستحتاجه لأي متابعة مع الدعم الفني.",
      },
      en: {
        title: "How to Protect Your Account While Topping Up",
        excerpt: "Simple steps that protect you from common top-up mistakes and keep your account and payment data safe.",
        bodyMarkdown:
          "## Never share your account password\nA legitimate top-up store never needs your game account password — only the in-game Player ID.\n\n## Double-check your ID\nDigital top-ups are non-refundable once fulfilled, so verify your ID and server (if applicable) before paying.\n\n## Use a payment method you trust\nAvoid entering card details on sites you don't trust, and make sure the checkout page is encrypted (HTTPS).\n\n## Keep your order number\nAfter checkout, save your order number and tracking link — you'll need them for any follow-up with support.",
      },
    },
    {
      slug: "choosing-digital-subscriptions-for-family",
      categorySlug: "subscriptions",
      readingMinutes: 5,
      daysAgo: 4,
      ar: {
        title: "أفضل الاشتراكات الرقمية للعائلة: كيف تختار؟",
        excerpt: "مقارنة عملية بين خطط الاشتراكات الفردية والعائلية لمساعدتك على اختيار الأنسب لاستخدامك.",
        bodyMarkdown:
          "## هل تحتاج خطة فردية أم عائلية؟\nإذا كان الاشتراك سيُستخدم من أكثر من جهاز أو شخص في نفس الوقت، فالخطة العائلية غالبًا أوفر من عدة اشتراكات فردية منفصلة.\n\n## مدة الاشتراك\nمعظم المنصات الرقمية تقدم خيارات شهرية وسنوية — الاشتراك السنوي عادة أقل تكلفة شهريًا لكنه يتطلب دفعة أكبر مقدمًا.\n\n## التفعيل والتسليم\nبعد الشراء يصلك رمز أو رابط تفعيل، ويختلف وقت التفعيل حسب نوع الاشتراك — راجع تفاصيل كل منتج قبل الشراء.",
      },
      en: {
        title: "Choosing the Best Digital Subscriptions for Your Family",
        excerpt: "A practical comparison between individual and family subscription plans to help you pick what fits.",
        bodyMarkdown:
          "## Individual or family plan?\nIf the subscription will be used across multiple devices or people at once, a family plan is usually cheaper than several individual ones.\n\n## Subscription length\nMost digital platforms offer monthly and yearly options — yearly is usually cheaper per month but needs a bigger upfront payment.\n\n## Activation & delivery\nAfter purchase you'll receive an activation code or link; activation time varies by subscription type — check each product's details before buying.",
      },
    },
    {
      slug: "everything-about-gift-cards",
      categorySlug: "guides",
      readingMinutes: 4,
      daysAgo: 6,
      ar: {
        title: "كل ما تحتاج معرفته عن بطاقات الهدايا",
        excerpt: "دليل مختصر لفهم بطاقات الهدايا الرقمية، طريقة استخدامها، وكيفية اختيار البطاقة المناسبة كهدية.",
        bodyMarkdown:
          "## ما هي بطاقة الهدايا الرقمية؟\nهي رمز رقمي يمكن استبداله برصيد داخل متجر أو منصة معينة — تصلك مباشرة بعد الدفع دون الحاجة لبطاقة فعلية.\n\n## كيف تختار البطاقة المناسبة؟\nتأكد من أن البطاقة متوافقة مع المنطقة/المتجر الذي يستخدمه الشخص الذي تُهديه البطاقة، فبعض البطاقات مقيدة بمنطقة معينة.\n\n## بعد الشراء\nاحتفظ برمز البطاقة في مكان آمن، فهو يعادل قيمة مالية فعلية بمجرد استبداله.",
      },
      en: {
        title: "Everything You Need to Know About Gift Cards",
        excerpt: "A short guide to understanding digital gift cards, how to use them, and how to pick the right one as a gift.",
        bodyMarkdown:
          "## What's a digital gift card?\nA digital code redeemable for balance on a specific store or platform — delivered right after payment, no physical card needed.\n\n## Picking the right one\nMake sure the card matches the region/store the recipient actually uses — some gift cards are region-locked.\n\n## After purchase\nKeep the code somewhere safe — it's worth real money the moment it's redeemed.",
      },
    },
    {
      slug: "top-up-your-favorite-game-in-minutes",
      categorySlug: "guides",
      readingMinutes: 3,
      daysAgo: 7,
      ar: {
        title: "طريقة شحن رصيد لعبتك المفضلة بخطوات بسيطة",
        excerpt: "أربع خطوات سريعة توضح لك كيفية إتمام أي عملية شحن داخل شحنو من البداية للنهاية.",
        bodyMarkdown:
          "## 1. اختر اللعبة أو الخدمة\nابحث عن اللعبة أو الخدمة التي تريدها من الصفحة الرئيسية أو صفحة الألعاب.\n\n## 2. اختر الفئة\nحدد الفئة المناسبة (كمية العملات، مدة الاشتراك، أو قيمة البطاقة).\n\n## 3. أدخل بياناتك\nأدخل معرف اللاعب أو البيانات المطلوبة بدقة.\n\n## 4. ادفع واستلم\nأكمل الدفع، وسيتم تنفيذ طلبك خلال دقائق في أغلب الحالات.",
      },
      en: {
        title: "How to Top Up Your Favorite Game in a Few Simple Steps",
        excerpt: "Four quick steps showing exactly how a top-up on Shahnoo works from start to finish.",
        bodyMarkdown:
          "## 1. Pick the game or service\nFind what you want from the homepage or the games page.\n\n## 2. Pick a tier\nChoose the right tier (coin amount, subscription length, or card value).\n\n## 3. Enter your details\nEnter your Player ID or the required details accurately.\n\n## 4. Pay and receive\nComplete payment — most orders fulfill within minutes.",
      },
    },
    {
      slug: "protect-your-payment-details",
      categorySlug: "account-protection",
      readingMinutes: 4,
      daysAgo: 9,
      ar: {
        title: "نصائح لحماية بياناتك المالية عند الدفع الإلكتروني",
        excerpt: "إرشادات عملية تحافظ على أمان بطاقتك ومعلوماتك المالية عند التسوق والدفع عبر الإنترنت.",
        bodyMarkdown:
          "## تأكد من تشفير الموقع\nابحث عن رمز القفل بجانب رابط الموقع قبل إدخال أي بيانات دفع.\n\n## لا تحفظ بياناتك في أجهزة مشتركة\nتجنب حفظ بيانات بطاقتك في متصفح جهاز يستخدمه أشخاص آخرون.\n\n## راقب كشف حسابك البنكي\nراجع كشف حسابك بانتظام للتأكد من عدم وجود عمليات غير معروفة.\n\n## فعّل التنبيهات الفورية\nمعظم البنوك توفر تنبيهات فورية عبر الرسائل عند كل عملية شراء — فعّلها لتكتشف أي نشاط غير معتاد بسرعة.",
      },
      en: {
        title: "Tips for Protecting Your Payment Details Online",
        excerpt: "Practical guidance to keep your card and financial information safe while shopping and paying online.",
        bodyMarkdown:
          "## Check for encryption\nLook for the lock icon next to the site's URL before entering any payment details.\n\n## Don't save details on shared devices\nAvoid saving your card details in a browser used by other people.\n\n## Watch your bank statement\nReview it regularly to catch any unfamiliar charges.\n\n## Turn on instant alerts\nMost banks offer instant SMS alerts for every purchase — enable them to spot unusual activity fast.",
      },
    },
    {
      slug: "comparing-subscription-plans",
      categorySlug: "comparisons",
      readingMinutes: 5,
      daysAgo: 11,
      ar: {
        title: "مقارنة بين باقات الاشتراكات الرقمية: أيها يناسبك؟",
        excerpt: "نقارن بين خيارات الاشتراك الشائعة من حيث المدة والسعر والمزايا لمساعدتك على اتخاذ القرار الأنسب.",
        bodyMarkdown:
          "## الاشتراك الشهري\nمرن ومناسب لمن يريد تجربة الخدمة أولاً، لكنه غالبًا أعلى تكلفة على المدى الطويل.\n\n## الاشتراك السنوي\nأوفر على المدى الطويل، ومناسب إذا كنت متأكدًا من استخدامك المستمر للخدمة.\n\n## الخطط متعددة الأجهزة\nإذا كانت الخدمة ستُستخدم من أكثر من جهاز أو شخص، تحقق دائمًا من عدد الأجهزة المسموح بها في كل خطة قبل الشراء.",
      },
      en: {
        title: "Comparing Digital Subscription Plans: Which Fits You?",
        excerpt: "A comparison of common subscription options by length, price, and perks to help you decide.",
        bodyMarkdown:
          "## Monthly plans\nFlexible and good for trying a service first, but usually costs more over time.\n\n## Yearly plans\nCheaper long-term, and a good fit if you're sure you'll keep using the service.\n\n## Multi-device plans\nIf more than one device or person will use it, always check the allowed device count per plan before buying.",
      },
    },
    {
      slug: "how-coupon-codes-work",
      categorySlug: "offers",
      readingMinutes: 3,
      daysAgo: 13,
      ar: {
        title: "كيف تستخدم أكواد الخصم عند الدفع؟",
        excerpt: "شرح مبسّط لكيفية إدخال كود الخصم أثناء إتمام الطلب والتأكد من تطبيقه بشكل صحيح.",
        bodyMarkdown:
          "## أين أُدخل الكود؟\nفي صفحة الدفع، ستجد حقلاً مخصصًا لكود الخصم — أدخل الكود ثم أكمل باقي بيانات الطلب.\n\n## متى يُطبّق الخصم؟\nيتم التحقق من الكود وتطبيق الخصم عند إتمام الدفع، وستظهر لك قيمة الخصم والإجمالي الجديد بوضوح قبل الدفع النهائي.\n\n## ملاحظة مهمة\nكل كود له شروط خاصة (كحد أدنى للطلب أو عدد مرات استخدام)، فإذا لم يُطبّق الكود تحقق من صلاحيته أولًا.",
      },
      en: {
        title: "How to Use Coupon Codes at Checkout",
        excerpt: "A simple explanation of how to enter a coupon code during checkout and confirm it applied correctly.",
        bodyMarkdown:
          "## Where do I enter the code?\nOn the checkout page, you'll find a dedicated coupon field — enter the code, then complete the rest of your order details.\n\n## When does the discount apply?\nThe code is validated and the discount applied when you complete payment; you'll clearly see the discount amount and new total before final payment.\n\n## A quick note\nEvery code has its own conditions (like a minimum order or usage limit) — if it doesn't apply, check that it's still valid first.",
      },
    },
  ];

  for (const post of blogPosts) {
    const publishAt = new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000);
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        categorySlug: post.categorySlug,
        readingMinutes: post.readingMinutes,
        isPublished: true,
        publishAt,
        translations: {
          create: [
            { locale: "ar", title: post.ar.title, excerpt: post.ar.excerpt, bodyMarkdown: post.ar.bodyMarkdown },
            { locale: "en", title: post.en.title, excerpt: post.en.excerpt, bodyMarkdown: post.en.bodyMarkdown },
          ],
        },
      },
    });
  }

  await prisma.featureFlag.upsert({
    where: { key: "payments.moyasar.enabled" },
    update: {},
    create: { key: "payments.moyasar.enabled", isEnabled: false, description: "Toggle Moyasar live payment adapter" },
  });

  // Dev-only bootstrap admin. ADMIN_SEED_PASSWORD must be set explicitly in
  // any shared/production environment — the fallback below exists purely so
  // local `pnpm db:seed` works out of the box, and is loud about it so it's
  // never mistaken for a real credential.
  const adminEmail = process.env["ADMIN_SEED_EMAIL"] ?? "admin@example.com";
  const adminPassword = process.env["ADMIN_SEED_PASSWORD"] ?? "dev-only-change-me-1234";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword(adminPassword),
        role: UserRole.SUPER_ADMIN,
      },
    });
    if (!process.env["ADMIN_SEED_PASSWORD"]) {
      console.warn(
        `[seed] Created admin ${adminEmail} with the DEV-ONLY default password. Set ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD before seeding any shared environment.`,
      );
    }
  }

  // eslint-disable-next-line no-console -- CLI seed script output
  console.log("Seed complete:", {
    products: [
      topupProduct.slug,
      subscriptionProduct.slug,
      giftCardProduct.slug,
      racingProduct.slug,
      kingdomProduct.slug,
      musicProduct.slug,
      cloudArcadeProduct.slug,
      styleCardProduct.slug,
      skyfallProduct.slug,
      premiumCardProduct.slug,
      steamWalletProduct.slug,
      itunesGiftCardProduct.slug,
      playstationStoreProduct.slug,
      amazonGiftCardProduct.slug,
      noonGiftCardProduct.slug,
      pubgMobileProduct.slug,
      robloxProduct.slug,
      freeFireProduct.slug,
      googlePlayGiftCardProduct.slug,
      xboxGiftCardProduct.slug,
      fortniteProduct.slug,
    ],
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
