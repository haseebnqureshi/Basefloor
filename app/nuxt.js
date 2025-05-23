/**
 * Basefloor Nuxt Module
 * Registers all Basefloor components and functionality in a Nuxt project
 */

import { defineNuxtModule, addComponent } from '@nuxt/kit'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const COMPONENTS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'components')

export default defineNuxtModule({
  meta: {
    name: 'basefloor',
    configKey: 'basefloor',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    // Module default options
    apiUrl: 'http://localhost:3000',
  },
  setup(options, nuxt) {
    // Register all components
    const componentsDir = COMPONENTS_DIR
    
    // Auto-register all components in the components directory
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        path: componentsDir,
        prefix: 'Basefloor'
      })
    })
    
    // Add runtime config
    nuxt.options.runtimeConfig.public.basefloor = {
      apiUrl: options.apiUrl
    }
    
    // Make stores available
    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(join(dirname(fileURLToPath(import.meta.url)), 'stores'))
    })
  }
}) 