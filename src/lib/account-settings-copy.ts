import type { Locale } from "@/lib/i18n-dictionary";

export function getAccountSettingsCopy(locale: Locale) {
  if (locale === "uz") {
    return {
      profileTitle: "Profil ma'lumotlari",
      profileDescription: "Ism, telefon raqami va shaharni yangilang.",
      emailTitle: "Email manzili",
      emailDescription: "Email tasdiqlovi hozircha o'chirilgan, shuning uchun manzil darhol yangilanadi.",
      securityTitle: "Xavfsizlik",
      securityDescription: "Parolingizni o'zgartirish uchun joriy parolni tasdiqlang.",
      statusTitle: "Hisob holati",
      statusDescription: "Rol va KYC holati bu yerda faqat ko'rish uchun beriladi.",
      saveProfile: "Profilni saqlash",
      updateEmail: "Emailni yangilash",
      changePassword: "Parolni almashtirish",
      currentPassword: "Joriy parol",
      newPassword: "Yangi parol",
      confirmPassword: "Yangi parolni tasdiqlang",
      accountStatus: "Hisob holati",
      profileUpdated: "Profil yangilandi.",
      profileUpdatedAndKycReset: "Profil yangilandi. KYC qayta ko'rib chiqish uchun tiklandi.",
      emailUpdated: "Email yangilandi.",
      passwordUpdated: "Parol yangilandi.",
      currentPasswordIncorrect: "Joriy parol noto'g'ri.",
      emailAlreadyInUse: "Bu email allaqachon ishlatilmoqda.",
      nameResetNote: "To'liq ismni o'zgartirish KYC tekshiruvini qayta talab qiladi.",
      nameResetWarning:
        "To'liq ismingizni o'zgartirish yangi shaxsni tasdiqlash tekshiruvini talab qiladi. KYC holatingiz tiklanadi va hujjatlarni qayta yuklashingiz kerak bo'lishi mumkin.",
      updateNameAndResetKyc: "Ismni yangilash va KYC ni tiklash",
      cancelNameReset: "Bekor qilish",
      nameResetRequired:
        "To'liq ismni yangilash uchun KYC qayta tekshiruvini tasdiqlang.",
    };
  }

  if (locale === "ru") {
    return {
      profileTitle: "Данные профиля",
      profileDescription: "Обновите имя, номер телефона и город.",
      emailTitle: "Email",
      emailDescription: "Проверка email сейчас отключена, поэтому адрес обновляется сразу.",
      securityTitle: "Безопасность",
      securityDescription: "Подтвердите текущий пароль, чтобы установить новый.",
      statusTitle: "Статус аккаунта",
      statusDescription: "Роль и статус KYC здесь доступны только для просмотра.",
      saveProfile: "Сохранить профиль",
      updateEmail: "Обновить email",
      changePassword: "Изменить пароль",
      currentPassword: "Текущий пароль",
      newPassword: "Новый пароль",
      confirmPassword: "Подтвердите новый пароль",
      accountStatus: "Статус аккаунта",
      profileUpdated: "Профиль обновлен.",
      profileUpdatedAndKycReset: "Профиль обновлен. Статус KYC сброшен для повторной проверки.",
      emailUpdated: "Email обновлен.",
      passwordUpdated: "Пароль обновлен.",
      currentPasswordIncorrect: "Текущий пароль указан неверно.",
      emailAlreadyInUse: "Этот email уже используется.",
      nameResetNote: "Изменение полного имени потребует повторной проверки KYC.",
      nameResetWarning:
        "Изменение полного имени требует новой проверки личности. Ваш статус KYC будет сброшен, и вам может потребоваться загрузить документы заново.",
      updateNameAndResetKyc: "Обновить имя и сбросить KYC",
      cancelNameReset: "Отмена",
      nameResetRequired:
        "Подтвердите сброс KYC, чтобы обновить полное имя.",
    };
  }

  return {
    profileTitle: "Profile details",
    profileDescription: "Update your name, phone number, and city.",
    emailTitle: "Email address",
    emailDescription: "Email verification is disabled for now, so your address updates immediately.",
    securityTitle: "Security",
    securityDescription: "Confirm your current password before setting a new one.",
    statusTitle: "Account status",
    statusDescription: "Your role and KYC status stay read-only here.",
    saveProfile: "Save profile",
    updateEmail: "Update email",
    changePassword: "Change password",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    accountStatus: "Account status",
    profileUpdated: "Profile updated.",
    profileUpdatedAndKycReset: "Profile updated. Your KYC status was reset for another review.",
    emailUpdated: "Email updated.",
    passwordUpdated: "Password updated.",
    currentPasswordIncorrect: "Current password is incorrect.",
    emailAlreadyInUse: "Email is already in use.",
    nameResetNote: "Changing your full name will require KYC review again.",
    nameResetWarning:
      "Changing your full name requires a new identity review. Your KYC status will be reset and you may need to upload documents again.",
    updateNameAndResetKyc: "Update name and reset KYC",
    cancelNameReset: "Cancel",
    nameResetRequired:
      "Confirm the KYC reset before updating your full name.",
  };
}
