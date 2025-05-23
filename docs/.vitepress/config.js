import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'BasefloorAPI Documentation',
  description: 'Comprehensive documentation for the BasefloorAPI backend framework',
  base: '/',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Reference', link: '/reference/' },
      { text: 'Examples', link: '/examples/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        }
      ],
      
      '/reference/': [
        {
          text: 'Core Concepts',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/reference/' },
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
            { text: 'Email Services', link: '/reference/emails' },
            { text: 'AI Integration', link: '/reference/ai' },
            { text: 'Transcription', link: '/reference/transcription' }
          ]
        }
      ],
      
      '/examples/': [
        {
          text: 'Examples',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Setup', link: '/examples/basic-setup' },
            { text: 'Blog API', link: '/examples/blog-api' },
            { text: 'Complete Config', link: '/examples/complete-config' }
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'API Reference',
          collapsed: false,
          items: [
            { text: 'Files', link: '/api/files' }
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