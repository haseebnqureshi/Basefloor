// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Use Basefloor app components
  modules: [
    'basefloor/app',
    '@pinia/nuxt'
  ],
  
  // Configure Basefloor
  basefloor: {
    apiUrl: process.env.API_URL || 'http://localhost:4000'
  },
  
  // Runtime config
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:4000'
    }
  },

  // Enable TailwindCSS
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  // App config
  app: {
    head: {
      title: 'Basefloor Example',
      meta: [
        { name: 'description', content: 'An example application using Basefloor' }
      ]
    }
  }
}) 