// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your translation files
import translationEN from '../locales/en/translation.json';
import translationFR from '../locales/fr/translation.json';
import translationAF from '../locales/af/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
  af: {
    translation: translationAF,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'af', // Set the default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;