// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  // router: {
  //   options: {
  //     hashMode: true,
  //   }
  // },

  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },

  runtimeConfig: {
    public: {
      apiUrl: '',
      storageAccessKey: '',
      storageSecretKey: '',
      storageEndpoint: '',
      storageRegion: '',
      storageBucket: '',
      storageCdnEndpoint: '',
    },
  },

  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    }
  },

  modules: [
    '@pinia/nuxt',
    'nuxt-monaco-editor',
    "@nuxt/image"
  ],

  css: [
    '~/assets/app.sass',
    '~/assets/app.css',
  ],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap' },
        { rel: 'icon', href: '/favicon.png', type: 'image/png' },
      ]
    },
  },

  monacoEditor: {
    locale: 'en',
    componentName: {
      codeEditor: 'MonacoEditor',
      diffEditor: 'MonacoDiffEditor',
    },
    automaticLayout: true,
  },

  compatibilityDate: '2024-09-25'
})