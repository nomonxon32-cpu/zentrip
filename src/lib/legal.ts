import type { Locale } from "@/lib/i18n-dictionary";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocumentContent = {
  title: string;
  draftNotice: string;
  intro: string;
  lastUpdatedLabel: string;
  lastUpdatedValue: string;
  sections: LegalSection[];
  contactTitle: string;
  contactBody: string;
  contactLabel: string;
  contactEmail: string;
};

export function getLegalUi(locale: Locale) {
  if (locale === "uz") {
    return {
      privacyPolicy: "Maxfiylik siyosati",
      termsOfUse: "Foydalanish shartlari",
      registerAgreementError: "Davom etish uchun Foydalanish shartlari va Maxfiylik siyosatiga rozilik bildiring.",
      registerAgreementLead: "Men ",
      and: " va ",
      agreeSuffix: " ga roziman.",
      bookingAgreementLead: "Bronni tasdiqlash orqali siz Zentrip'ning ",
      bookingAgreementSuffix: "ga rozilik bildirasiz.",
      listingAgreementLead:
        "Men ushbu avtomobilni joylashtirishga egaligim yoki vakolatim borligini tasdiqlayman va Zentrip'ning ",
      listingAgreementSuffix: "ga roziman.",
      listingAgreementError:
        "Bron uchun yuborishdan oldin avtomobilni joylashtirish vakolatingizni va Foydalanish shartlariga roziligingizni tasdiqlang.",
    };
  }

  if (locale === "ru") {
    return {
      privacyPolicy: "Политика конфиденциальности",
      termsOfUse: "Условия использования",
      registerAgreementError: "Чтобы продолжить, подтвердите согласие с Условиями использования и Политикой конфиденциальности.",
      registerAgreementLead: "Я соглашаюсь с ",
      and: " и ",
      agreeSuffix: ".",
      bookingAgreementLead: "Подтверждая бронирование, вы соглашаетесь с ",
      bookingAgreementSuffix: " Zentrip.",
      listingAgreementLead:
        "Я подтверждаю, что владею этим автомобилем или уполномочен размещать его, и соглашаюсь с ",
      listingAgreementSuffix: " Zentrip.",
      listingAgreementError:
        "Перед отправкой объявления подтвердите право размещать автомобиль и согласие с Условиями использования.",
    };
  }

  return {
    privacyPolicy: "Privacy Policy",
    termsOfUse: "Terms of Use",
    registerAgreementError: "You must agree to the Terms of Use and Privacy Policy to continue.",
    registerAgreementLead: "I agree to the ",
    and: " and ",
    agreeSuffix: ".",
    bookingAgreementLead: "By confirming this booking, you agree to Zentrip's ",
    bookingAgreementSuffix: ".",
    listingAgreementLead:
      "I confirm that I own or am authorized to list this vehicle and agree to Zentrip's ",
    listingAgreementSuffix: ".",
    listingAgreementError:
      "You must confirm that you are authorized to list this vehicle and agree to the Terms of Use.",
  };
}

export function getPrivacyPolicyContent(locale: Locale): LegalDocumentContent {
  if (locale === "uz") {
    return {
      title: "Maxfiylik siyosati",
      draftNotice:
        "Ushbu sahifa Zentrip'ning ishga tushirish uchun tayyorlangan dastlabki loyihasidir va keyinchalik yuridik ko'rib chiqishdan o'tkazilishi mumkin.",
      intro:
        "Zentrip ijarachilar, avtomobil egalari va ijara ofislarini bog'laydigan avtomobil ijarasi marketplace xizmatini yuritadi. Ushbu siyosat xizmatdan foydalanganda qanday ma'lumotlar to'planishi, ishlatilishi va himoya qilinishini tushuntiradi.",
      lastUpdatedLabel: "Oxirgi yangilanish",
      lastUpdatedValue: "2026-yil 6-iyul",
      sections: [
        {
          title: "1. Kirish",
          paragraphs: [
            "Biz foydalanuvchilarning shaxsiy ma'lumotlariga ehtiyotkorlik bilan yondashamiz va marketplace xavfsizligi, bronlash jarayoni va qo'llab-quvvatlash uchun faqat zarur bo'lgan ma'lumotlardan foydalanamiz.",
          ],
        },
        {
          title: "2. Qaysi ma'lumotlarni to'playmiz",
          paragraphs: ["Platformadan foydalanganda quyidagi turdagi ma'lumotlar yig'ilishi mumkin:"],
          bullets: [
            "ism, telefon raqami, email va shahar",
            "KYC uchun pasport, ID karta, haydovchilik guvohnomasi yoki transport hujjatlari",
            "bron, safar va aloqa bo'yicha ma'lumotlar",
            "naqd to'lov oqimi uchun to'lov usuli yoki depozit bo'yicha ma'lumotlar",
            "yuklangan avtomobil rasmlari va qo'shimcha fayllar",
            "qurilma, brauzer va foydalanish bo'yicha texnik ma'lumotlar",
            "qo'llab-quvvatlash, nizolar va xavfsizlik tekshiruvlariga oid yozuvlar",
          ],
        },
        {
          title: "3. Ma'lumotlardan qanday foydalanamiz",
          paragraphs: ["To'plangan ma'lumotlar quyidagi maqsadlarda ishlatiladi:"],
          bullets: [
            "akkaunt yaratish va boshqarish",
            "shaxsni tasdiqlash va marketplace xavfsizligi",
            "bronlarni boshqarish va egalar hamda ijarachilar o'rtasidagi aloqani ta'minlash",
            "firibgarlikning oldini olish va xavfsizlik monitoringi",
            "nizolarni ko'rib chiqish va mijozlarni qo'llab-quvvatlash",
            "qonuniy yoki komplaens majburiyatlarini bajarish",
            "xizmatni tahlil qilish va yaxshilash",
          ],
        },
        {
          title: "4. KYC va tasdiqlov hujjatlari",
          paragraphs: [
            "Shaxsni tasdiqlovchi hujjatlar va haydovchilik guvohnomasi marketplace xavfsizligi, qo'lda verifikatsiya va xavfli holatlarning oldini olish uchun ishlatiladi.",
            "Bunday hujjatlar ommaga ko'rsatilmaydi. Ularni faqat ruxsatli adminlar va tegishli ichki jarayonlar ko'rib chiqishi mumkin.",
          ],
        },
        {
          title: "5. Ma'lumotlarni ulashish",
          paragraphs: ["Biz ma'lumotlarni faqat zarurat bo'lganda ulashamiz:"],
          bullets: [
            "bron tasdiqlangandan keyin tegishli ijarachi va egaga kerakli aloqa yoki pickup ma'lumotlari",
            "adminlar va qo'llab-quvvatlash xodimlari bilan moderatsiya, xavfsizlik yoki nizolar uchun",
            "hosting, saqlash yoki texnik infratuzilma bo'yicha xizmat ko'rsatuvchi provayderlar bilan",
            "qonun talab qilsa yoki huquqni muhofaza qilish so'rovlariga javoban",
          ],
        },
        {
          title: "6. Yuklangan fayllar va saqlash",
          paragraphs: [
            "Avtomobil rasmlari ommaviy ro'yxatlarda ko'rsatilishi mumkin. KYC hujjatlari esa ichki va maxfiy hisoblanadi hamda jamoatchilikka ko'rsatilmasligi kerak.",
            "Fayllar uchinchi tomon bulut saqlash provayderlarida saqlanishi mumkin.",
          ],
        },
        {
          title: "7. Ma'lumotlarni saqlash muddati",
          paragraphs: [
            "Agar akkaunt faol bo'lsa, ma'lumotlar xizmat ko'rsatish uchun saqlanishi mumkin.",
            "Ba'zi yozuvlar xavfsizlik, hisob-kitob, nizolar, audit yoki qonuniy talablar sabab uzoqroq muddat saqlanadi.",
          ],
        },
        {
          title: "8. Foydalanuvchi huquqlari",
          paragraphs: ["Foydalanuvchilar tegishli qonun va texnik imkoniyatlar doirasida quyidagilarni so'rashi mumkin:"],
          bullets: [
            "profil ma'lumotlarini yangilash yoki tuzatish",
            "ba'zi ma'lumotlarni o'chirish yoki cheklash",
            "qo'llab-quvvatlash orqali savol yuborish",
          ],
        },
        {
          title: "9. Xavfsizlik",
          paragraphs: [
            "Biz oqilona texnik va tashkiliy choralarni qo'llaymiz. Biroq hech bir tizim to'liq xavfsiz deb kafolatlanmaydi.",
          ],
        },
      ],
      contactTitle: "10. Bog'lanish",
      contactBody: "Maxfiylik, ma'lumotlarni tuzatish yoki o'chirish bo'yicha savollar uchun quyidagi manzilga yozishingiz mumkin:",
      contactLabel: "Biz bilan bog'laning",
      contactEmail: "zokirovnomonxon@icloud.com",
    };
  }

  if (locale === "ru") {
    return {
      title: "Политика конфиденциальности",
      draftNotice:
        "Эта страница является рабочим запусковым проектом Zentrip и может быть обновлена после юридической проверки.",
      intro:
        "Zentrip управляет маркетплейсом аренды автомобилей, который связывает арендаторов, владельцев автомобилей и прокатные офисы. Эта политика объясняет, какие данные мы собираем, как используем и как защищаем их.",
      lastUpdatedLabel: "Последнее обновление",
      lastUpdatedValue: "6 июля 2026 г.",
      sections: [
        {
          title: "1. Введение",
          paragraphs: [
            "Мы относимся к персональным данным внимательно и используем только ту информацию, которая необходима для безопасности маркетплейса, бронирований и поддержки пользователей.",
          ],
        },
        {
          title: "2. Какие данные мы собираем",
          paragraphs: ["При использовании платформы мы можем собирать следующие категории данных:"],
          bullets: [
            "имя, номер телефона, email и город",
            "KYC-документы: паспорт, ID-карта, водительское удостоверение или документы на автомобиль",
            "данные о бронированиях, поездках и сообщениях",
            "сведения о способе оплаты или депозите для текущего наличного процесса",
            "загруженные фотографии автомобилей и другие файлы",
            "технические данные устройства, браузера и использования сервиса",
            "обращения в поддержку, споры и записи по безопасности",
          ],
        },
        {
          title: "3. Как мы используем данные",
          paragraphs: ["Собранные данные могут использоваться для следующих целей:"],
          bullets: [
            "создание и управление аккаунтом",
            "проверка личности и безопасность маркетплейса",
            "управление бронированиями и взаимодействием владельцев с арендаторами",
            "предотвращение мошенничества и мониторинг рисков",
            "рассмотрение споров и поддержка пользователей",
            "соблюдение правовых и комплаенс-требований",
            "анализ и улучшение сервиса",
          ],
        },
        {
          title: "4. KYC и проверочные документы",
          paragraphs: [
            "Документы, удостоверяющие личность, и водительские удостоверения используются для ручной проверки и повышения безопасности платформы.",
            "Такие документы не публикуются. Они доступны только уполномоченным администраторам и внутренним процессам, связанным с проверкой.",
          ],
        },
        {
          title: "5. Передача данных",
          paragraphs: ["Мы передаем данные только в случаях, когда это действительно необходимо:"],
          bullets: [
            "между владельцем и арендатором для конкретного одобренного бронирования",
            "администраторам и сотрудникам поддержки для модерации, безопасности и споров",
            "техническим и облачным провайдерам, обеспечивающим работу сервиса",
            "если это требуется законом или по законному запросу государственных органов",
          ],
        },
        {
          title: "6. Загруженные файлы и хранение",
          paragraphs: [
            "Фотографии автомобилей могут отображаться публично в объявлениях. KYC-документы считаются внутренними и конфиденциальными и не должны быть общедоступными.",
            "Файлы могут храниться у сторонних облачных провайдеров.",
          ],
        },
        {
          title: "7. Срок хранения данных",
          paragraphs: [
            "Мы можем хранить данные, пока аккаунт активен и необходим для предоставления сервиса.",
            "Отдельные записи могут храниться дольше для безопасности, бухгалтерии, аудита, споров или выполнения требований закона.",
          ],
        },
        {
          title: "8. Права пользователей",
          paragraphs: ["В пределах применимого законодательства пользователи могут запросить:"],
          bullets: [
            "обновление или исправление данных профиля",
            "удаление или ограничение некоторых данных, если это допустимо",
            "обращение в поддержку по вопросам обработки данных",
          ],
        },
        {
          title: "9. Безопасность",
          paragraphs: [
            "Мы применяем разумные технические и организационные меры защиты, но ни одна система не может считаться на 100% безопасной.",
          ],
        },
      ],
      contactTitle: "10. Контакты",
      contactBody: "По вопросам конфиденциальности, исправления или удаления данных вы можете написать нам по адресу:",
      contactLabel: "Связаться с нами",
      contactEmail: "zokirovnomonxon@icloud.com",
    };
  }

  return {
    title: "Privacy Policy",
    draftNotice:
      "This page is a launch-ready working draft for Zentrip and may be updated after lawyer review.",
    intro:
      "Zentrip operates a car rental marketplace connecting renters, vehicle owners, and rental offices. This policy explains what information we collect, how we use it, and how we protect it when you use the platform.",
    lastUpdatedLabel: "Last updated",
    lastUpdatedValue: "July 6, 2026",
    sections: [
      {
        title: "1. Introduction",
        paragraphs: [
          "We handle personal information carefully and use it only where needed for marketplace safety, booking operations, and user support.",
        ],
      },
      {
        title: "2. Information we collect",
        paragraphs: ["When you use the platform, we may collect the following categories of information:"],
        bullets: [
          "name, phone number, email address, and city",
          "identity and KYC documents, including passports, ID cards, driver licenses, or vehicle documents",
          "booking, trip, and communication details",
          "payment method or deposit-related information for the current cash-at-pickup flow",
          "uploaded vehicle photos and other files",
          "device, browser, and service usage information",
          "support requests, disputes, and safety-related records",
        ],
      },
      {
        title: "3. How we use information",
        paragraphs: ["We use collected information for the following purposes:"],
        bullets: [
          "account creation and management",
          "identity verification and marketplace safety",
          "booking management and owner-renter communication",
          "fraud prevention and risk monitoring",
          "support operations and dispute handling",
          "legal, compliance, and recordkeeping needs",
          "service analysis and improvement",
        ],
      },
      {
        title: "4. KYC and verification documents",
        paragraphs: [
          "Identity documents and driver license records are used for manual verification and marketplace safety checks.",
          "These documents are not public. They may be reviewed only by authorized admins and internal teams handling verification or safety matters.",
        ],
      },
      {
        title: "5. Sharing information",
        paragraphs: ["We share information only where needed:"],
        bullets: [
          "between a renter and vehicle owner where necessary for an approved booking",
          "with admins or support staff handling moderation, safety, or disputes",
          "with hosting, storage, and technical service providers supporting the platform",
          "when required by law or in response to lawful government requests",
        ],
      },
      {
        title: "6. Uploaded files and storage",
        paragraphs: [
          "Vehicle photos may appear publicly on listings. KYC documents are treated as private internal records and should not be displayed publicly.",
          "Files may be stored with third-party cloud storage providers.",
        ],
      },
      {
        title: "7. Data retention",
        paragraphs: [
          "We may keep data while an account is active and while it is needed to operate the service.",
          "Some records may be retained longer for disputes, safety reviews, accounting, audits, or legal obligations.",
        ],
      },
      {
        title: "8. User rights",
        paragraphs: ["Where allowed by law and technically feasible, users may request:"],
        bullets: [
          "correction or updating of profile information",
          "deletion or restriction of certain data",
          "support regarding privacy questions or data handling",
        ],
      },
      {
        title: "9. Security",
        paragraphs: [
          "We use reasonable technical and organizational safeguards, but no system can be guaranteed to be 100% secure.",
        ],
      },
    ],
    contactTitle: "10. Contact",
    contactBody: "For privacy questions, correction requests, or deletion requests, contact Zentrip at:",
    contactLabel: "Contact us",
    contactEmail: "zokirovnomonxon@icloud.com",
  };
}

export function getTermsOfUseContent(locale: Locale): LegalDocumentContent {
  if (locale === "uz") {
    return {
      title: "Foydalanish shartlari",
      draftNotice:
        "Ushbu sahifa Zentrip'ning ishga tushirish uchun tayyorlangan dastlabki loyihasidir va keyinchalik yuridik ko'rib chiqishdan o'tkazilishi mumkin.",
      intro:
        "Zentrip barcha avtomobillarning egasi emas. U ijarachilarni avtomobil egalari va ijara ofislari bilan bog'laydigan marketplace platformasidir.",
      lastUpdatedLabel: "Oxirgi yangilanish",
      lastUpdatedValue: "2026-yil 6-iyul",
      sections: [
        {
          title: "1. Kirish",
          paragraphs: [
            "Platformadan foydalanish orqali siz ushbu shartlarga rioya qilishga rozilik bildirasiz. Agar rozi bo'lmasangiz, xizmatdan foydalanmasligingiz kerak.",
          ],
        },
        {
          title: "2. Talablar",
          paragraphs: ["Foydalanuvchilar aniq va rost ma'lumot taqdim etishi kerak."],
          bullets: [
            "ijarachilar tegishli hollarda amaldagi haydovchilik huquqiga ega bo'lishi kerak",
            "egalar avtomobilni joylashtirish bo'yicha qonuniy huquqqa ega bo'lishi kerak",
          ],
        },
        {
          title: "3. Akkaunt majburiyatlari",
          paragraphs: ["Har bir foydalanuvchi o'z akkaunti va platformadagi xatti-harakatlari uchun javobgardir."],
          bullets: [
            "kirish ma'lumotlarini xavfsiz saqlash",
            "rost va to'g'ri ma'lumot berish",
            "platformadan suiiste'mol qilmaslik",
          ],
        },
        {
          title: "4. Egalar majburiyatlari",
          bullets: [
            "avtomobil haqida aniq ma'lumot berish",
            "avtomobilning texnik holatini kuzatish",
            "qonuniy egalik yoki vakolatni ta'minlash",
            "narx va mavjudlikni dolzarb saqlash",
            "tasdiqlangan bronlarni bajarish",
            "pickup va topshirish ma'lumotlarini berish",
          ],
          paragraphs: [],
        },
        {
          title: "5. Ijarachilar majburiyatlari",
          bullets: [
            "avtomobildan mas'uliyat bilan foydalanish",
            "ijara qoidalariga rioya qilish",
            "avtomobilni o'z vaqtida qaytarish",
            "pickup paytida kerakli naqd to'lov va depozitni to'lash",
            "yo'l harakati qoidalariga rioya qilish",
            "avtomobildan noqonuniy yoki xavfli maqsadlarda foydalanmaslik",
          ],
          paragraphs: [],
        },
        {
          title: "6. Bronlar",
          paragraphs: [
            "Bronlar egasi tasdig'ini talab qilishi mumkin. Aniq pickup manzili yoki topshirish tafsilotlari tasdiqlangandan keyin ko'rsatilishi mumkin.",
            "Zentrip taxminiy narxni ko'rsatishi mumkin. Hozircha to'lov pickup yoki topshirish vaqtida naqd amalga oshiriladi.",
          ],
        },
        {
          title: "7. To'lovlar va platforma to'lovlari",
          paragraphs: [
            "Hozirgi ishga tushirish davrida platforma to'lovi ko'rsatilishi mumkin, ammo undirilmaydi.",
            "Qaytariladigan depozit pickup vaqtida talab qilinishi mumkin. Kelajakda online to'lovlar yoki qo'shimcha to'lovlar joriy etilishi mumkin.",
          ],
        },
        {
          title: "8. Bekor qilish va nizolar",
          paragraphs: [
            "Muammolar yuzaga kelsa, foydalanuvchilar support yoki admin bilan bog'lanishi kerak. Zentrip nizolarni ko'rib chiqishi va xavfsizlik choralarini qo'llashi mumkin.",
          ],
        },
        {
          title: "9. KYC va verifikatsiya",
          bullets: [
            "ijarachilar ID yoki pasport hamda haydovchilik guvohnomasini yuklashi mumkin",
            "egalar ID yoki pasport taqdim etishi kerak",
            "egalar transport ro'yxatdan o'tkazish hujjatini ixtiyoriy ravishda yuklashi mumkin",
            "yolg'on yoki chalg'ituvchi hujjatlar akkaunt bloklanishiga olib kelishi mumkin",
          ],
          paragraphs: [],
        },
        {
          title: "10. Taqiqlangan xatti-harakatlar",
          bullets: [
            "soxta e'lonlar yoki soxta bronlar",
            "firibgarlik yoki platformadan tashqari aldov",
            "xavfli yoki noqonuniy avtomobil foydalanishi",
            "haqorat, zo'ravonlik yoki ta'qib",
            "har qanday noqonuniy faoliyat",
          ],
          paragraphs: [],
        },
        {
          title: "11. Javobgarlik",
          paragraphs: [
            "Zentrip marketplace platformasidir. Avtomobil holati, ro'yxat tafsilotlari va topshirish jarayoni bo'yicha asosiy javobgarlik egaga tegishli.",
            "Ijarachi esa ijara davomida avtomobildan foydalanish uchun javobgar bo'ladi. Zentrip qonun ruxsat bergan doirada javobgarligini cheklashi mumkin.",
          ],
        },
        {
          title: "12. Akkauntni to'xtatish",
          paragraphs: [
            "Zentrip firibgarlik, yolg'on hujjatlar, xavfli xatti-harakatlar yoki siyosat buzilishi uchun akkauntlarni vaqtincha yoki doimiy to'xtatishi mumkin.",
          ],
        },
        {
          title: "13. Shartlarni o'zgartirish",
          paragraphs: [
            "Biz ushbu shartlarni yangilashimiz mumkin. Xizmatdan foydalanishni davom ettirish yangilangan shartlarni qabul qilganingizni anglatadi.",
          ],
        },
      ],
      contactTitle: "14. Bog'lanish",
      contactBody: "Shartlar yoki marketplace ishlashi bo'yicha savollar uchun quyidagi manzilga yozing:",
      contactLabel: "Biz bilan bog'laning",
      contactEmail: "zokirovnomonxon@icloud.com",
    };
  }

  if (locale === "ru") {
    return {
      title: "Условия использования",
      draftNotice:
        "Эта страница является рабочим запусковым проектом Zentrip и может быть обновлена после юридической проверки.",
      intro:
        "Zentrip не является владельцем каждого автомобиля на платформе. Сервис выступает маркетплейсом, который соединяет арендаторов с владельцами автомобилей и прокатными офисами.",
      lastUpdatedLabel: "Последнее обновление",
      lastUpdatedValue: "6 июля 2026 г.",
      sections: [
        {
          title: "1. Введение",
          paragraphs: [
            "Используя платформу, вы соглашаетесь соблюдать эти условия. Если вы не согласны, пользоваться сервисом не следует.",
          ],
        },
        {
          title: "2. Право на использование",
          paragraphs: ["Пользователи обязаны предоставлять точную и правдивую информацию."],
          bullets: [
            "арендаторы должны иметь действующее право на управление автомобилем, если это требуется",
            "владельцы должны иметь право размещать транспортные средства",
          ],
        },
        {
          title: "3. Ответственность за аккаунт",
          paragraphs: ["Каждый пользователь отвечает за свой аккаунт и поведение на платформе."],
          bullets: [
            "сохранять безопасность логина и пароля",
            "предоставлять правдивые сведения",
            "не злоупотреблять сервисом",
          ],
        },
        {
          title: "4. Обязанности владельца",
          paragraphs: [],
          bullets: [
            "указывать точные данные об автомобиле",
            "поддерживать автомобиль в надлежащем состоянии",
            "подтверждать законное владение или полномочия",
            "актуализировать цены и доступность",
            "исполнять подтвержденные бронирования",
            "предоставлять информацию о передаче автомобиля",
          ],
        },
        {
          title: "5. Обязанности арендатора",
          paragraphs: [],
          bullets: [
            "использовать автомобиль ответственно",
            "соблюдать правила аренды",
            "возвращать автомобиль вовремя",
            "оплачивать наличные суммы и депозит при получении, если требуется",
            "соблюдать правила дорожного движения",
            "не использовать автомобиль незаконно или небезопасно",
          ],
        },
        {
          title: "6. Бронирования",
          paragraphs: [
            "Бронирования могут требовать одобрения владельца. Точные детали получения автомобиля могут раскрываться после одобрения.",
            "Zentrip может показывать расчетную стоимость. На текущем этапе оплата производится наличными при получении или передаче автомобиля.",
          ],
        },
        {
          title: "7. Платежи и сборы",
          paragraphs: [
            "Платформенный сбор может отображаться, но на этапе запуска не взимается.",
            "Возвратный депозит может требоваться при передаче автомобиля. В будущем платформа может ввести онлайн-платежи или дополнительные сборы.",
          ],
        },
        {
          title: "8. Отмена и споры",
          paragraphs: [
            "При возникновении проблем пользователи должны обращаться в поддержку. Zentrip может рассматривать споры и принимать меры безопасности или модерации.",
          ],
        },
        {
          title: "9. KYC и верификация",
          paragraphs: [],
          bullets: [
            "арендаторы могут быть обязаны загрузить ID/паспорт и водительское удостоверение",
            "владельцы должны предоставить ID/паспорт",
            "владельцы могут дополнительно загрузить документы на автомобиль",
            "ложные документы могут привести к блокировке аккаунта",
          ],
        },
        {
          title: "10. Запрещенное поведение",
          paragraphs: [],
          bullets: [
            "фальшивые объявления или мошеннические бронирования",
            "небезопасное использование автомобиля",
            "внеплатформенное мошенничество",
            "оскорбления, домогательства или угрозы",
            "любая незаконная деятельность",
          ],
        },
        {
          title: "11. Ответственность",
          paragraphs: [
            "Zentrip является маркетплейсом. Владельцы несут основную ответственность за автомобили, их состояние и точность объявлений.",
            "Арендаторы несут ответственность за использование автомобиля в период аренды. Zentrip ограничивает свою ответственность в пределах, разрешенных законом.",
          ],
        },
        {
          title: "12. Блокировка аккаунта",
          paragraphs: [
            "Zentrip может приостановить или закрыть аккаунт за мошенничество, ложные документы, небезопасное поведение или нарушение правил платформы.",
          ],
        },
        {
          title: "13. Изменения условий",
          paragraphs: [
            "Мы можем обновлять эти условия. Продолжение использования сервиса означает принятие обновленных условий.",
          ],
        },
      ],
      contactTitle: "14. Контакты",
      contactBody: "По вопросам условий использования или работы маркетплейса вы можете написать нам по адресу:",
      contactLabel: "Связаться с нами",
      contactEmail: "zokirovnomonxon@icloud.com",
    };
  }

  return {
    title: "Terms of Use",
    draftNotice:
      "This page is a launch-ready working draft for Zentrip and may be updated after lawyer review.",
    intro:
      "Zentrip is a marketplace platform and is not the owner of every vehicle listed on the service. The platform connects renters with vehicle owners and rental offices.",
    lastUpdatedLabel: "Last updated",
    lastUpdatedValue: "July 6, 2026",
    sections: [
      {
        title: "1. Introduction",
        paragraphs: [
          "By using the platform, you agree to follow these Terms of Use. If you do not agree, you should not use the service.",
        ],
      },
      {
        title: "2. Eligibility",
        paragraphs: ["Users must provide accurate information and meet the basic eligibility requirements for their role."],
        bullets: [
          "renters must have valid driving rights or a valid license where required",
          "owners must have the right to list vehicles on the platform",
        ],
      },
      {
        title: "3. Account responsibilities",
        paragraphs: ["Each user is responsible for their own account and conduct on the platform."],
        bullets: [
          "keep login credentials secure",
          "provide truthful and current information",
          "do not misuse or abuse the platform",
        ],
      },
      {
        title: "4. Owner responsibilities",
        paragraphs: [],
        bullets: [
          "list accurate vehicle details",
          "maintain the vehicle in appropriate condition",
          "have lawful ownership or authorization",
          "keep availability and pricing updated",
          "honor confirmed bookings",
          "provide pickup and handover information",
        ],
      },
      {
        title: "5. Renter responsibilities",
        paragraphs: [],
        bullets: [
          "use the vehicle responsibly",
          "follow rental rules and instructions",
          "return the vehicle on time",
          "pay required cash amounts or deposits at pickup if applicable",
          "follow traffic laws and safety rules",
          "do not misuse the vehicle",
        ],
      },
      {
        title: "6. Bookings",
        paragraphs: [
          "Bookings may require owner approval. Exact pickup details may be revealed only after approval.",
          "Zentrip may show estimated pricing. At launch, payment is currently handled in cash at pickup or handover.",
        ],
      },
      {
        title: "7. Payments and fees",
        paragraphs: [
          "Platform fees may be displayed, but they are currently waived during launch.",
          "A refundable deposit may be due at pickup where required. Zentrip may introduce online payments or new fees later.",
        ],
      },
      {
        title: "8. Cancellations and disputes",
        paragraphs: [
          "Users should contact support when issues arise. Admins may review disputes and take reasonable moderation or safety action.",
        ],
      },
      {
        title: "9. KYC and verification",
        paragraphs: [],
        bullets: [
          "renters may need to upload an ID or passport and a driver license",
          "owners may need to upload an ID or passport",
          "owners may optionally upload vehicle registration documents",
          "false or misleading documents may result in suspension",
        ],
      },
      {
        title: "10. Prohibited behavior",
        paragraphs: [],
        bullets: [
          "fake listings or fraudulent bookings",
          "unsafe vehicle use",
          "off-platform fraud or payment scams",
          "harassment, abuse, or threats",
          "illegal activity of any kind",
        ],
      },
      {
        title: "11. Liability",
        paragraphs: [
          "Zentrip is a marketplace platform. Vehicle owners are responsible for their vehicles, listing accuracy, and handover obligations.",
          "Renters are responsible for the vehicle during their rental period. Zentrip limits liability to the extent permitted by law.",
        ],
      },
      {
        title: "12. Account suspension",
        paragraphs: [
          "Zentrip may suspend or restrict accounts for fraud, false documents, unsafe conduct, or other policy violations.",
        ],
      },
      {
        title: "13. Changes to terms",
        paragraphs: [
          "We may update these terms from time to time. Continued use of the platform means you accept the updated terms.",
        ],
      },
    ],
    contactTitle: "14. Contact",
    contactBody: "For questions about these terms or marketplace operations, contact Zentrip at:",
    contactLabel: "Contact us",
    contactEmail: "zokirovnomonxon@icloud.com",
  };
}
