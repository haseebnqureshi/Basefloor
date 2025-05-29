import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Basefloor Documentation',
  description: 'Comprehensive documentation for the Basefloor framework',
  base: '/',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/reference/' },
      { text: 'Examples', link: '/examples/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        }
      ],
      
      '/reference/': [
        {
          text: 'Core Concepts',
          collapsed: false,
          items: [
            { text: 'Models', link: '/reference/models' },
            { text: 'Routes', link: '/reference/routes' },
            { text: 'Authentication', link: '/reference/authentication' },
            { text: 'Permissions', link: '/reference/permissions' }
          ]
        },
        {
          text: 'Features',
          collapsed: false,
          items: [
            { text: 'File Management', link: '/reference/files' },
            { text: 'Audio Transcription', link: '/reference/transcription' },
            { text: 'AI Integration', link: '/reference/ai' },
            { text: 'Email Notifications', link: '/reference/emails' }
          ]
        }
      ],
      
      '/examples/': [
        {
          text: 'Examples',
          collapsed: false,
          items: [
            { text: 'Basic Setup', link: '/examples/basic-setup' },
            { text: 'Complete Configuration', link: '/examples/complete-config' },
            { text: 'Blog API Example', link: '/examples/blog-api' }
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'API Reference',
          collapsed: false,
          items: [
            { text: 'REST Endpoints', link: '/api/endpoints' },
            { text: 'File Operations', link: '/api/files' },
            { text: 'Error Codes', link: '/api/errors' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/haseebnqureshi/basefloor' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-2025 Basefloor'
    },
    
    search: {
      provider: 'local'
    }
  },
  
  markdown: {
    theme: 'github-dark',
    lineNumbers: true
  }
}) 