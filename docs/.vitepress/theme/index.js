import DefaultTheme from 'vitepress/theme'
import ConfigBuilder from './components/ConfigBuilder.vue'
import APIExplorer from './components/APIExplorer.vue'
import CodeExample from './components/CodeExample.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register custom components globally
    app.component('ConfigBuilder', ConfigBuilder)
    app.component('APIExplorer', APIExplorer)
    app.component('CodeExample', CodeExample)
  }
} 