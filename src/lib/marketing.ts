import type { Locale } from "@/lib/i18n-dictionary";
import { SERVICE_FEE_RATE } from "@/lib/constants";

/**
 * Localized marketing copy for the public, conversion-focused surfaces
 * (homepage partner band, /host fleet landing, /trust safety page).
 *
 * Kept separate from the functional UI dictionary so long-form marketing
 * content stays easy to edit per locale without bloating i18n-dictionary.ts.
 */

export type IconKey =
  | "wallet"
  | "calendar"
  | "shield"
  | "users"
  | "chart"
  | "phone"
  | "verified"
  | "lock"
  | "handshake"
  | "headset"
  | "car"
  | "gauge";

type FeatureItem = {
  icon: IconKey;
  title: string;
  body: string;
};

type StepItem = {
  title: string;
  body: string;
};

type StatItem = {
  value: string;
  label: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

export type HostContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  stats: StatItem[];
  benefitsTitle: string;
  benefits: FeatureItem[];
  stepsTitle: string;
  stepsSubtitle: string;
  steps: StepItem[];
  controlTitle: string;
  controlSubtitle: string;
  controls: FeatureItem[];
  faqTitle: string;
  faqs: FaqItem[];
  finalTitle: string;
  finalSubtitle: string;
  finalCta: string;
};

export type TrustContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  pillarsTitle: string;
  pillars: FeatureItem[];
  flowTitle: string;
  flowSubtitle: string;
  flow: StepItem[];
  privacyTitle: string;
  privacy: FeatureItem[];
  faqTitle: string;
  faqs: FaqItem[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaRenter: string;
  ctaOwner: string;
};

export type PartnerBandContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  primaryCta: string;
  secondaryCta: string;
  stats: StatItem[];
};

const feePct = Math.round(SERVICE_FEE_RATE * 100);

const host: Record<Locale, HostContent> = {
  en: {
    eyebrow: "For rental offices & fleet owners",
    title: "Turn your fleet into a steady stream of verified bookings",
    subtitle:
      "List your cars on Zentrip and reach renters across Uzbekistan. You keep full control of pricing and availability — we bring the demand, verified customers, and payment protection.",
    primaryCta: "List your fleet",
    secondaryCta: "Talk to our partnerships team",
    stats: [
      { value: `${feePct}%`, label: "Flat platform fee — no signup or monthly cost" },
      { value: "24h", label: "Typical listing review turnaround" },
      { value: "100%", label: "Renters are identity-verified before pickup" },
    ],
    benefitsTitle: "Why fleet owners list on Zentrip",
    benefits: [
      {
        icon: "wallet",
        title: "More bookings, less idle time",
        body: "Put your underused cars in front of renters actively searching in your city, including airport and monthly demand.",
      },
      {
        icon: "calendar",
        title: "You control pricing & availability",
        body: "Set daily and monthly rates, deposits, mileage limits, and block any dates. Nothing is booked without your rules being met.",
      },
      {
        icon: "shield",
        title: "Every renter is verified",
        body: "KYC identity checks and refundable deposit holds happen before a trip is confirmed, so you rent with confidence.",
      },
      {
        icon: "chart",
        title: "Earnings you can track",
        body: "A clean owner dashboard shows live listings, pending requests, and monthly earnings per vehicle.",
      },
      {
        icon: "phone",
        title: "Built for Uzbekistan",
        body: "Local payment methods, UZS pricing, and a product in Uzbek, Russian, and English your customers actually use.",
      },
      {
        icon: "headset",
        title: "Support when it matters",
        body: "Dispute resolution and platform-level protection back you up if something goes wrong on a trip.",
      },
    ],
    stepsTitle: "Listing takes minutes",
    stepsSubtitle: "From sign-up to your first booking request.",
    steps: [
      { title: "Create an owner account", body: "Register as an owner and complete a one-time identity verification (KYC)." },
      { title: "Add your cars", body: "Upload photos, set pricing, deposit, mileage, and pickup or delivery options." },
      { title: "Get approved", body: "Our team reviews each listing — usually within a day — to keep quality high." },
      { title: "Accept bookings", body: "Approve incoming requests, hand over the keys, and get paid after each trip." },
    ],
    controlTitle: "You stay in control",
    controlSubtitle: "Zentrip is a marketplace, not a middleman that takes over your business.",
    controls: [
      { icon: "calendar", title: "Your prices", body: "Daily and monthly rates, deposits, and delivery fees are always set by you." },
      { icon: "lock", title: "Your availability", body: "Block dates instantly. Bookings can only land on dates you've opened." },
      { icon: "handshake", title: "Your approval", body: "Use request-to-book to vet each renter, or enable instant book when you're ready." },
    ],
    faqTitle: "Partner questions",
    faqs: [
      {
        question: "How much does it cost to list?",
        answer: `Listing is free. Zentrip charges a flat ${feePct}% service fee on completed bookings — there are no signup or monthly fees.`,
      },
      {
        question: "Do I keep control over pricing and availability?",
        answer: "Yes. You set every rate, deposit, and mileage limit, and you can block dates at any time. We never change your pricing.",
      },
      {
        question: "Will this bring me more bookings?",
        answer: "Your cars appear in city, airport, delivery, and monthly search results, in front of renters who are ready to book.",
      },
      {
        question: "How do I know renters are trustworthy?",
        answer: "Every renter completes identity verification (KYC) and a refundable deposit hold before a trip is confirmed.",
      },
      {
        question: "Can I list a whole rental office fleet?",
        answer: "Absolutely. You can add as many vehicles as you operate and manage them all from one owner dashboard.",
      },
    ],
    finalTitle: "Ready to fill your calendar?",
    finalSubtitle: "Join the rental offices and owners already earning on Zentrip.",
    finalCta: "List your fleet",
  },
  uz: {
    eyebrow: "Ijara ofislari va avtopark egalari uchun",
    title: "Avtoparkingizni tasdiqlangan bronlarning barqaror oqimiga aylantiring",
    subtitle:
      "Avtomobillaringizni Zentrip'ga joylashtiring va butun O'zbekiston bo'ylab ijarachilarga yeting. Narx va mavjudlik to'liq sizning nazoratingizda — biz talab, tasdiqlangan mijozlar va to'lov himoyasini olib kelamiz.",
    primaryCta: "Avtoparkni joylashtirish",
    secondaryCta: "Hamkorlik jamoasi bilan bog'lanish",
    stats: [
      { value: `${feePct}%`, label: "Belgilangan platforma to'lovi — ro'yxat yoki oylik to'lovsiz" },
      { value: "24 soat", label: "E'lonni ko'rib chiqishning odatiy muddati" },
      { value: "100%", label: "Ijarachilar olishdan oldin shaxsi tasdiqlanadi" },
    ],
    benefitsTitle: "Nega avtopark egalari Zentrip'ni tanlaydi",
    benefits: [
      {
        icon: "wallet",
        title: "Ko'proq bron, kamroq bo'sh vaqt",
        body: "Kam ishlatilayotgan avtomobillaringizni shahringizda, jumladan aeroport va oylik talabda faol qidirayotgan ijarachilarga taqdim eting.",
      },
      {
        icon: "calendar",
        title: "Narx va mavjudlik sizda",
        body: "Kunlik va oylik narx, depozit, yurish limiti belgilang va istalgan sanani bloklang. Sizning shartlaringizsiz hech narsa bron qilinmaydi.",
      },
      {
        icon: "shield",
        title: "Har bir ijarachi tasdiqlangan",
        body: "Safar tasdiqlanishidan oldin KYC shaxs tekshiruvi va qaytariladigan depozit ushlab turiladi — ishonch bilan ijaraga bering.",
      },
      {
        icon: "chart",
        title: "Kuzatib boriladigan daromad",
        body: "Qulay egasi paneli faol e'lonlar, kutilayotgan so'rovlar va har bir avtomobil bo'yicha oylik daromadni ko'rsatadi.",
      },
      {
        icon: "phone",
        title: "O'zbekiston uchun yaratilgan",
        body: "Mahalliy to'lov usullari, UZS narxlar va o'zbek, rus hamda ingliz tillaridagi mahsulot.",
      },
      {
        icon: "headset",
        title: "Kerak bo'lganda yordam",
        body: "Nizolarni hal qilish va platforma darajasidagi himoya safar davomida muammo yuzaga kelsa sizni qo'llab-quvvatlaydi.",
      },
    ],
    stepsTitle: "Joylashtirish bir necha daqiqa",
    stepsSubtitle: "Ro'yxatdan o'tishdan birinchi bron so'roviga qadar.",
    steps: [
      { title: "Egasi akkauntini yarating", body: "Egasi sifatida ro'yxatdan o'ting va bir martalik shaxs tekshiruvini (KYC) yakunlang." },
      { title: "Avtomobillaringizni qo'shing", body: "Rasm yuklang, narx, depozit, yurish limiti va olish yoki yetkazib berishni belgilang." },
      { title: "Tasdiqdan o'ting", body: "Jamoamiz har bir e'lonni — odatda bir kun ichida — sifat uchun ko'rib chiqadi." },
      { title: "Bronlarni qabul qiling", body: "Kelgan so'rovlarni tasdiqlang, kalitni topshiring va har safardan keyin to'lov oling." },
    ],
    controlTitle: "Nazorat sizda qoladi",
    controlSubtitle: "Zentrip — bu bozor, biznesingizni egallab oladigan vositachi emas.",
    controls: [
      { icon: "calendar", title: "Sizning narxlaringiz", body: "Kunlik va oylik narx, depozit va yetkazib berish to'lovi har doim siz tomonidan belgilanadi." },
      { icon: "lock", title: "Sizning mavjudligingiz", body: "Sanalarni darhol bloklang. Bronlar faqat siz ochgan sanalarga tushadi." },
      { icon: "handshake", title: "Sizning tasdig'ingiz", body: "Har bir ijarachini tekshirish uchun so'rov bilan bron qiling yoki tayyor bo'lsangiz tezkor bronni yoqing." },
    ],
    faqTitle: "Hamkor savollari",
    faqs: [
      {
        question: "Joylashtirish qancha turadi?",
        answer: `Joylashtirish bepul. Zentrip yakunlangan bronlardan belgilangan ${feePct}% xizmat to'lovini oladi — ro'yxat yoki oylik to'lovlar yo'q.`,
      },
      {
        question: "Narx va mavjudlik nazorati menda qoladimi?",
        answer: "Ha. Har bir narx, depozit va yurish limitini siz belgilaysiz va istalgan vaqtda sanalarni bloklashingiz mumkin. Biz narxingizni o'zgartirmaymiz.",
      },
      {
        question: "Bu menga ko'proq bron olib keladimi?",
        answer: "Avtomobillaringiz shahar, aeroport, yetkazib berish va oylik qidiruv natijalarida, bronga tayyor ijarachilar oldida paydo bo'ladi.",
      },
      {
        question: "Ijarachilar ishonchli ekanini qanday bilaman?",
        answer: "Har bir ijarachi safar tasdiqlanishidan oldin shaxs tekshiruvini (KYC) va qaytariladigan depozitni o'taydi.",
      },
      {
        question: "Butun ijara ofisi avtoparkini joylashtira olamanmi?",
        answer: "Albatta. Siz boshqaradigan barcha avtomobillarni qo'shib, ularni bitta egasi panelidan boshqarishingiz mumkin.",
      },
    ],
    finalTitle: "Kalendaringizni to'ldirishga tayyormisiz?",
    finalSubtitle: "Zentrip'da allaqachon daromad olayotgan ijara ofislari va egalariga qo'shiling.",
    finalCta: "Avtoparkni joylashtirish",
  },
  ru: {
    eyebrow: "Для прокатов и владельцев автопарков",
    title: "Превратите свой автопарк в стабильный поток проверенных бронирований",
    subtitle:
      "Разместите свои авто на Zentrip и охватите арендаторов по всему Узбекистану. Цены и доступность полностью под вашим контролем — мы приводим спрос, проверенных клиентов и защиту платежей.",
    primaryCta: "Разместить автопарк",
    secondaryCta: "Связаться с командой партнёрств",
    stats: [
      { value: `${feePct}%`, label: "Фиксированная комиссия — без платы за регистрацию и абонентской платы" },
      { value: "24 ч", label: "Обычный срок проверки объявления" },
      { value: "100%", label: "Арендаторы проходят проверку личности до получения" },
    ],
    benefitsTitle: "Почему владельцы автопарков выбирают Zentrip",
    benefits: [
      {
        icon: "wallet",
        title: "Больше броней, меньше простоя",
        body: "Покажите простаивающие авто арендаторам, которые активно ищут в вашем городе, включая спрос в аэропорту и помесячную аренду.",
      },
      {
        icon: "calendar",
        title: "Цены и доступность у вас",
        body: "Устанавливайте дневные и месячные тарифы, депозиты, лимиты пробега и блокируйте любые даты. Ничего не бронируется без ваших условий.",
      },
      {
        icon: "shield",
        title: "Каждый арендатор проверен",
        body: "Проверка личности (KYC) и возвратный депозит происходят до подтверждения поездки — сдавайте уверенно.",
      },
      {
        icon: "chart",
        title: "Прозрачный доход",
        body: "Удобный кабинет владельца показывает активные объявления, входящие запросы и месячный доход по каждому авто.",
      },
      {
        icon: "phone",
        title: "Создано для Узбекистана",
        body: "Локальные способы оплаты, цены в UZS и продукт на узбекском, русском и английском.",
      },
      {
        icon: "headset",
        title: "Поддержка, когда важно",
        body: "Разрешение споров и защита на уровне платформы поддержат вас, если на поездке что-то пойдёт не так.",
      },
    ],
    stepsTitle: "Размещение займёт минуты",
    stepsSubtitle: "От регистрации до первого запроса на бронирование.",
    steps: [
      { title: "Создайте аккаунт владельца", body: "Зарегистрируйтесь как владелец и пройдите разовую проверку личности (KYC)." },
      { title: "Добавьте свои авто", body: "Загрузите фото, задайте цену, депозит, пробег и варианты получения или доставки." },
      { title: "Пройдите модерацию", body: "Наша команда проверяет каждое объявление — обычно за день — чтобы держать качество." },
      { title: "Принимайте брони", body: "Одобряйте входящие запросы, передавайте ключи и получайте оплату после каждой поездки." },
    ],
    controlTitle: "Контроль остаётся у вас",
    controlSubtitle: "Zentrip — это маркетплейс, а не посредник, который забирает ваш бизнес.",
    controls: [
      { icon: "calendar", title: "Ваши цены", body: "Дневные и месячные тарифы, депозиты и стоимость доставки всегда задаёте вы." },
      { icon: "lock", title: "Ваша доступность", body: "Блокируйте даты мгновенно. Брони попадают только на открытые вами даты." },
      { icon: "handshake", title: "Ваше одобрение", body: "Проверяйте каждого арендатора через запрос на бронирование или включите мгновенное бронирование." },
    ],
    faqTitle: "Вопросы партнёров",
    faqs: [
      {
        question: "Сколько стоит размещение?",
        answer: `Размещение бесплатно. Zentrip берёт фиксированную комиссию ${feePct}% с завершённых бронирований — без платы за регистрацию и абонплаты.`,
      },
      {
        question: "Сохраняю ли я контроль над ценами и доступностью?",
        answer: "Да. Вы задаёте каждую цену, депозит и лимит пробега и можете блокировать даты в любой момент. Мы не меняем ваши цены.",
      },
      {
        question: "Принесёт ли это больше бронирований?",
        answer: "Ваши авто появляются в результатах поиска по городу, аэропорту, доставке и помесячной аренде перед готовыми к брони арендаторами.",
      },
      {
        question: "Как я узнаю, что арендаторы надёжны?",
        answer: "Каждый арендатор проходит проверку личности (KYC) и возвратный депозит до подтверждения поездки.",
      },
      {
        question: "Можно ли разместить весь автопарк проката?",
        answer: "Конечно. Вы можете добавить столько авто, сколько у вас есть, и управлять ими из одного кабинета владельца.",
      },
    ],
    finalTitle: "Готовы заполнить календарь?",
    finalSubtitle: "Присоединяйтесь к прокатам и владельцам, которые уже зарабатывают на Zentrip.",
    finalCta: "Разместить автопарк",
  },
};

const trust: Record<Locale, TrustContent> = {
  en: {
    eyebrow: "Trust & safety",
    title: "Every trip is built on verified people and protected payments",
    subtitle:
      "Zentrip is designed so renters and owners can transact with strangers safely. Here is exactly how we keep the marketplace trustworthy.",
    pillarsTitle: "How we keep you safe",
    pillars: [
      {
        icon: "verified",
        title: "Identity verification (KYC)",
        body: "Owners and renters upload government ID for manual review. Bookings can only be confirmed once verification is approved.",
      },
      {
        icon: "car",
        title: "Reviewed listings",
        body: "Our team reviews every vehicle before it goes live, checking photos, pricing, and insurance details.",
      },
      {
        icon: "lock",
        title: "Refundable deposits",
        body: "A refundable deposit is held for each trip and released after the car is returned in agreed condition.",
      },
      {
        icon: "shield",
        title: "Dispute resolution",
        body: "If something goes wrong, you can open a dispute and our team steps in to help resolve it fairly.",
      },
    ],
    flowTitle: "A safer booking flow",
    flowSubtitle: "Sensitive details are only shared when they need to be.",
    flow: [
      { title: "Browse with confidence", body: "Plate numbers and exact addresses stay private while you browse — you see the car, specs, and city." },
      { title: "Request to book", body: "Choose your dates and pay. Your deposit is held, not spent, and the rental is only requested." },
      { title: "Owner approves", body: "The owner confirms your verified request. Only then are exact pickup details shared with you." },
      { title: "Trip & return", body: "Pick up, drive, return. Your deposit is released and you and the owner leave reviews." },
    ],
    privacyTitle: "Your privacy is protected",
    privacy: [
      { icon: "lock", title: "Hidden plate numbers", body: "Vehicle plate numbers are never shown publicly — they are shared after a booking is confirmed." },
      { icon: "shield", title: "Approximate location only", body: "Listings show the city and area, not a precise address, until the owner approves your trip." },
      { icon: "users", title: "Protected contact", body: "Phone numbers and personal contacts are exchanged inside a confirmed booking, not on public pages." },
    ],
    faqTitle: "Safety questions",
    faqs: [
      {
        question: "When do I see the exact pickup address?",
        answer: "The precise address and plate number are revealed after the owner approves your booking, not while browsing.",
      },
      {
        question: "Is my deposit safe?",
        answer: "Yes. The deposit is held as a refundable hold and released after the trip ends in agreed condition.",
      },
      {
        question: "What if there is a problem on a trip?",
        answer: "Open a dispute from your booking. Our team reviews the case and helps both sides reach a fair resolution.",
      },
      {
        question: "Who can list a car?",
        answer: "Only owners who have completed identity verification can publish listings, and each listing is manually reviewed.",
      },
    ],
    ctaTitle: "Rent or list with confidence",
    ctaSubtitle: "Join a marketplace built around verification and protection.",
    ctaRenter: "Browse cars",
    ctaOwner: "List your fleet",
  },
  uz: {
    eyebrow: "Ishonch va xavfsizlik",
    title: "Har bir safar tasdiqlangan odamlar va himoyalangan to'lovlarga asoslanadi",
    subtitle:
      "Zentrip ijarachilar va egalar notanish odamlar bilan xavfsiz ishlashi uchun yaratilgan. Bozorni ishonchli saqlash yo'limiz mana shunday.",
    pillarsTitle: "Sizni qanday himoya qilamiz",
    pillars: [
      {
        icon: "verified",
        title: "Shaxsni tasdiqlash (KYC)",
        body: "Egalar va ijarachilar hujjatlarini ko'rib chiqish uchun yuklaydi. Bron faqat tasdiq olingach yakunlanadi.",
      },
      {
        icon: "car",
        title: "Ko'rib chiqilgan e'lonlar",
        body: "Jamoamiz har bir avtomobilni efirga chiqishidan oldin rasm, narx va sug'urta ma'lumotlarini tekshiradi.",
      },
      {
        icon: "lock",
        title: "Qaytariladigan depozit",
        body: "Har bir safar uchun qaytariladigan depozit ushlab turiladi va avtomobil kelishilgan holatda qaytarilgach bo'shatiladi.",
      },
      {
        icon: "shield",
        title: "Nizolarni hal qilish",
        body: "Biror narsa noto'g'ri ketsa, nizo ochishingiz mumkin va jamoamiz uni adolatli hal qilishga yordam beradi.",
      },
    ],
    flowTitle: "Xavfsizroq bron jarayoni",
    flowSubtitle: "Maxfiy ma'lumotlar faqat zarur bo'lganda ulashiladi.",
    flow: [
      { title: "Ishonch bilan ko'ring", body: "Ko'rish vaqtida davlat raqami va aniq manzil maxfiy qoladi — siz avtomobil, xususiyatlar va shaharni ko'rasiz." },
      { title: "Bron so'rang", body: "Sanani tanlang va to'lang. Depozitingiz sarflanmaydi, ushlab turiladi va ijara faqat so'raladi." },
      { title: "Egasi tasdiqlaydi", body: "Egasi tasdiqlangan so'rovingizni qabul qiladi. Faqat shundan keyin aniq olish ma'lumotlari sizga beriladi." },
      { title: "Safar va qaytarish", body: "Oling, haydang, qaytaring. Depozitingiz bo'shatiladi va siz hamda egasi sharh qoldirasiz." },
    ],
    privacyTitle: "Maxfiyligingiz himoyalangan",
    privacy: [
      { icon: "lock", title: "Yashirin davlat raqamlari", body: "Avtomobil raqamlari hech qachon commonda ko'rsatilmaydi — ular bron tasdiqlangach ulashiladi." },
      { icon: "shield", title: "Faqat taxminiy joylashuv", body: "E'lonlar egasi safarni tasdiqlamaguncha aniq manzilni emas, shahar va hududni ko'rsatadi." },
      { icon: "users", title: "Himoyalangan aloqa", body: "Telefon raqamlari tasdiqlangan bron ichida almashinadi, ommaviy sahifalarda emas." },
    ],
    faqTitle: "Xavfsizlik savollari",
    faqs: [
      {
        question: "Aniq olish manzilini qachon ko'raman?",
        answer: "Aniq manzil va davlat raqami ko'rish vaqtida emas, egasi bronni tasdiqlagach beriladi.",
      },
      {
        question: "Depozitim xavfsizmi?",
        answer: "Ha. Depozit qaytariladigan ushlash sifatida saqlanadi va safar kelishilgan holatda tugagach bo'shatiladi.",
      },
      {
        question: "Safarda muammo bo'lsa-chi?",
        answer: "Broningizdan nizo oching. Jamoamiz holatni ko'rib chiqib, ikki tomonga adolatli yechimga yordam beradi.",
      },
      {
        question: "Kim avtomobil joylashtira oladi?",
        answer: "Faqat shaxsini tasdiqlagan egalar e'lon chiqara oladi va har bir e'lon qo'lda ko'rib chiqiladi.",
      },
    ],
    ctaTitle: "Ishonch bilan ijaraga oling yoki joylashtiring",
    ctaSubtitle: "Tasdiqlash va himoya atrofida qurilgan bozorga qo'shiling.",
    ctaRenter: "Avtomobillarni ko'rish",
    ctaOwner: "Avtoparkni joylashtirish",
  },
  ru: {
    eyebrow: "Доверие и безопасность",
    title: "Каждая поездка строится на проверенных людях и защищённых платежах",
    subtitle:
      "Zentrip создан так, чтобы арендаторы и владельцы могли безопасно работать с незнакомыми людьми. Вот как мы поддерживаем доверие на маркетплейсе.",
    pillarsTitle: "Как мы вас защищаем",
    pillars: [
      {
        icon: "verified",
        title: "Проверка личности (KYC)",
        body: "Владельцы и арендаторы загружают документы на проверку. Бронь подтверждается только после одобрения.",
      },
      {
        icon: "car",
        title: "Проверенные объявления",
        body: "Наша команда проверяет каждое авто перед публикацией — фото, цены и данные о страховке.",
      },
      {
        icon: "lock",
        title: "Возвратные депозиты",
        body: "На каждую поездку удерживается возвратный депозит, который возвращается после сдачи авто в оговорённом состоянии.",
      },
      {
        icon: "shield",
        title: "Разрешение споров",
        body: "Если что-то пойдёт не так, вы можете открыть спор, и наша команда поможет решить его справедливо.",
      },
    ],
    flowTitle: "Более безопасный процесс бронирования",
    flowSubtitle: "Чувствительные данные раскрываются только когда это необходимо.",
    flow: [
      { title: "Смотрите спокойно", body: "Госномера и точные адреса остаются скрытыми при просмотре — вы видите авто, характеристики и город." },
      { title: "Запросите бронь", body: "Выберите даты и оплатите. Депозит удерживается, а не тратится, и аренда лишь запрашивается." },
      { title: "Владелец одобряет", body: "Владелец подтверждает ваш проверенный запрос. Только тогда раскрываются точные данные получения." },
      { title: "Поездка и возврат", body: "Получите, поездите, верните. Депозит возвращается, а вы и владелец оставляете отзывы." },
    ],
    privacyTitle: "Ваша приватность защищена",
    privacy: [
      { icon: "lock", title: "Скрытые госномера", body: "Номера авто никогда не показываются публично — они раскрываются после подтверждения брони." },
      { icon: "shield", title: "Только примерная локация", body: "Объявления показывают город и район, а не точный адрес, пока владелец не одобрит поездку." },
      { icon: "users", title: "Защищённый контакт", body: "Телефоны передаются внутри подтверждённой брони, а не на публичных страницах." },
    ],
    faqTitle: "Вопросы безопасности",
    faqs: [
      {
        question: "Когда я увижу точный адрес получения?",
        answer: "Точный адрес и госномер раскрываются после одобрения брони владельцем, а не при просмотре.",
      },
      {
        question: "Безопасен ли мой депозит?",
        answer: "Да. Депозит удерживается как возвратный и возвращается после завершения поездки в оговорённом состоянии.",
      },
      {
        question: "Что если на поездке возникнет проблема?",
        answer: "Откройте спор из вашей брони. Команда рассмотрит случай и поможет обеим сторонам прийти к справедливому решению.",
      },
      {
        question: "Кто может разместить авто?",
        answer: "Публиковать объявления могут только владельцы, прошедшие проверку личности, и каждое объявление проверяется вручную.",
      },
    ],
    ctaTitle: "Арендуйте или размещайте с уверенностью",
    ctaSubtitle: "Присоединяйтесь к маркетплейсу, построенному на проверке и защите.",
    ctaRenter: "Смотреть авто",
    ctaOwner: "Разместить автопарк",
  },
};

const partnerBand: Record<Locale, PartnerBandContent> = {
  en: {
    eyebrow: "Own a car or a fleet?",
    title: "Earn with your cars on Uzbekistan's trusted rental marketplace",
    subtitle:
      "List in minutes, keep full control of pricing and availability, and rent only to identity-verified customers.",
    bullets: [
      "You set prices, deposits, and availability",
      "Every renter is KYC-verified",
      `Flat ${feePct}% fee — no signup or monthly cost`,
    ],
    primaryCta: "List your fleet",
    secondaryCta: "See how it works",
    stats: [
      { value: `${feePct}%`, label: "Flat service fee" },
      { value: "24h", label: "Listing review" },
      { value: "3", label: "Languages supported" },
    ],
  },
  uz: {
    eyebrow: "Avtomobil yoki avtoparkingiz bormi?",
    title: "O'zbekistonning ishonchli ijara bozorida avtomobillaringiz bilan daromad oling",
    subtitle:
      "Bir necha daqiqada joylashtiring, narx va mavjudlikni to'liq nazorat qiling va faqat shaxsi tasdiqlangan mijozlarga ijaraga bering.",
    bullets: [
      "Narx, depozit va mavjudlikni siz belgilaysiz",
      "Har bir ijarachi KYC orqali tasdiqlangan",
      `Belgilangan ${feePct}% to'lov — ro'yxat yoki oylik to'lovsiz`,
    ],
    primaryCta: "Avtoparkni joylashtirish",
    secondaryCta: "Qanday ishlashini ko'rish",
    stats: [
      { value: `${feePct}%`, label: "Belgilangan xizmat to'lovi" },
      { value: "24 soat", label: "E'lonni ko'rib chiqish" },
      { value: "3", label: "Qo'llab-quvvatlanadigan til" },
    ],
  },
  ru: {
    eyebrow: "Есть авто или автопарк?",
    title: "Зарабатывайте на своих авто на надёжном маркетплейсе аренды в Узбекистане",
    subtitle:
      "Разместите за минуты, сохраните полный контроль над ценами и доступностью и сдавайте только проверенным клиентам.",
    bullets: [
      "Вы задаёте цены, депозиты и доступность",
      "Каждый арендатор проверен через KYC",
      `Фиксированная комиссия ${feePct}% — без регистрации и абонплаты`,
    ],
    primaryCta: "Разместить автопарк",
    secondaryCta: "Как это работает",
    stats: [
      { value: `${feePct}%`, label: "Фиксированная комиссия" },
      { value: "24 ч", label: "Проверка объявления" },
      { value: "3", label: "Поддерживаемых языка" },
    ],
  },
};

export function getHostContent(locale: Locale): HostContent {
  return host[locale];
}

export function getTrustContent(locale: Locale): TrustContent {
  return trust[locale];
}

export function getPartnerBandContent(locale: Locale): PartnerBandContent {
  return partnerBand[locale];
}
