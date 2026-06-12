import { createI18n } from "vue-i18n";
import { message_en } from "./i18n/en";
import { message_zh } from "./i18n/zh";

export const i18n = createI18n({
  legacy: false,
  locale: "zh",
  fallbackLocale: "en",
  messages: {
    en: message_en,
    zh: message_zh,
  },
});
