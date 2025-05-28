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
      { text: 'API', link: '/api/routes/' },
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
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Interactive Components', link: '/guide/interactive-components' }
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
          text: 'Services',
          collapsed: false,
          items: [
            { text: 'AI Service', link: '/api/ai' },
            { text: 'Email Service', link: '/api/emails' },
            { text: 'Authentication', link: '/api/auth' },
            { text: 'Transcription', link: '/api/transcription' },
            { text: 'Provider System', link: '/api/providers' },
            { text: 'File Management', link: '/api/files' }
          ]
        },
        {
          text: 'API Routes',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/routes/' },
            { text: 'Users', items: [
              { text: 'Create User', link: '/api/routes/users-create' },
              { text: 'List Users', link: '/api/routes/users-readAll' },
              { text: 'Get User', link: '/api/routes/users-read' },
              { text: 'Update User', link: '/api/routes/users-update' },
              { text: 'Delete User', link: '/api/routes/users-delete' }
            ]},
            { text: 'Files', items: [
              { text: 'Upload File', link: '/api/routes/files-create' },
              { text: 'List Files', link: '/api/routes/files-readAll' },
              { text: 'Get File', link: '/api/routes/files-read' },
              { text: 'Update File', link: '/api/routes/files-update' },
              { text: 'Delete File', link: '/api/routes/files-delete' },
              { text: 'Download File', link: '/api/routes/files-download' },
              { text: 'List Child Files', link: '/api/routes/files-list-children' },
              { text: 'Convert File', link: '/api/routes/files-convert' },
              { text: 'Check Conversion', link: '/api/routes/files-check-conversion' }
            ]}
          ]
        },
        {
          text: 'Models',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/models/' },
            { text: 'Users', link: '/api/models/users' },
            { text: 'Files', link: '/api/models/files' }
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