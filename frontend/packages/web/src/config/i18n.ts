import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      'nav.chat': 'Chat',
      'nav.goals': 'Goals',
      'nav.settings': 'Settings',
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.logout': 'Logout',
      'chat.newSession': 'New Session',
      'chat.sendMessage': 'Send',
      'common.loading': 'Loading...',
      'common.error': 'Error',
    },
  },
  es: {
    translation: {
      'nav.chat': 'Chat',
      'nav.goals': 'Objetivos',
      'nav.settings': 'Configuración',
      'auth.login': 'Iniciar Sesión',
      'auth.register': 'Registrarse',
      'auth.logout': 'Cerrar Sesión',
      'chat.newSession': 'Nueva Sesión',
      'chat.sendMessage': 'Enviar',
      'common.loading': 'Cargando...',
      'common.error': 'Error',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
