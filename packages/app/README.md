# BasefloorApp

Vue.js frontend framework for the Basefloor ecosystem.

## Installation

```bash
npm install @basefloor/app
```

## Quick Start

```javascript
import { createApp } from 'vue'
import { createBasefloorApp } from '@basefloor/app'

const app = createApp(App)

// Configure BasefloorApp with your API
app.use(createBasefloorApp({
  apiUrl: 'http://localhost:3000',
  // other configuration options
}))

app.mount('#app')
```

## Features

- 🧩 **Pre-built Components** - Ready-to-use Vue components
- 🔗 **API Integration** - Seamless integration with BasefloorAPI
- 🎨 **Theming System** - Customizable themes and styling
- 📱 **Responsive Design** - Mobile-first component library
- 🔧 **Composables** - Reusable Vue composition functions
- 📦 **Tree Shakable** - Import only what you need

## Documentation

For detailed documentation, visit [basefloor.dev](https://basefloor.dev)

## License

MIT © BasefloorAPI 