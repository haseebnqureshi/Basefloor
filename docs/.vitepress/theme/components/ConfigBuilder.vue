<template>
  <div class="config-builder">
    <div class="config-builder__header">
      <h3 class="config-builder__title">Configuration Builder</h3>
      <div class="config-builder__actions">
        <button @click="exportConfig" class="bf-button bf-button--secondary">
          Export Config
        </button>
        <button @click="resetConfig" class="bf-button bf-button--secondary">
          Reset
        </button>
      </div>
    </div>

    <div class="config-builder__tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['config-builder__tab', { 'config-builder__tab--active': activeTab === tab.id }]"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="config-builder__content">
      <!-- Basic Settings Tab -->
      <div v-if="activeTab === 'basic'" class="config-builder__basic">
        <div class="bf-form-group">
          <label class="bf-label">Port</label>
          <input v-model.number="config.port" type="number" class="bf-input" placeholder="3000">
        </div>
        
        <div class="bf-form-group">
          <label class="bf-label">Database URI</label>
          <input v-model="config.database.uri" type="text" class="bf-input" placeholder="mongodb://localhost:27017/myapp">
        </div>
        
        <div class="bf-form-group">
          <label class="bf-label">JWT Secret</label>
          <input v-model="config.jwt.secret" type="text" class="bf-input" placeholder="your-secret-key">
        </div>
        
        <div class="bf-form-group">
          <label class="bf-label">CORS Origins</label>
          <input v-model="corsOrigins" type="text" class="bf-input" placeholder="http://localhost:3000, https://myapp.com">
          <small class="bf-text-light">Comma-separated list of allowed origins</small>
        </div>
      </div>

      <!-- Models Tab -->
      <div v-if="activeTab === 'models'" class="config-builder__models">
        <div class="config-builder__models-header">
          <h4>Models</h4>
          <button @click="addModel" class="bf-button">Add Model</button>
        </div>
        
        <div v-for="(model, modelName) in config.models" :key="modelName" class="config-builder__model">
          <div class="config-builder__model-header">
            <input v-model="model.name" class="bf-input" placeholder="Model name">
            <button @click="removeModel(modelName)" class="bf-button bf-button--secondary">Remove</button>
          </div>
          
          <div class="config-builder__model-fields">
            <h5>Fields</h5>
            <div v-for="(field, fieldName) in model.fields" :key="fieldName" class="config-builder__field">
              <input v-model="field.name" class="bf-input" placeholder="Field name">
              <select v-model="field.type" class="bf-select">
                <option value="String">String</option>
                <option value="Number">Number</option>
                <option value="Boolean">Boolean</option>
                <option value="Date">Date</option>
                <option value="ObjectId">ObjectId</option>
                <option value="Array">Array</option>
                <option value="Object">Object</option>
              </select>
              <label class="bf-checkbox">
                <input type="checkbox" v-model="field.required">
                Required
              </label>
              <button @click="removeField(modelName, fieldName)" class="bf-button bf-button--secondary">×</button>
            </div>
            <button @click="addField(modelName)" class="bf-button bf-button--secondary">Add Field</button>
          </div>
        </div>
      </div>

      <!-- Routes Tab -->
      <div v-if="activeTab === 'routes'" class="config-builder__routes">
        <div class="config-builder__routes-header">
          <h4>Routes</h4>
          <button @click="addRoute" class="bf-button">Add Route</button>
        </div>
        
        <div v-for="(route, routePath) in config.routes" :key="routePath" class="config-builder__route">
          <div class="config-builder__route-header">
            <input v-model="route.path" class="bf-input" placeholder="/api/resource">
            <select v-model="route.model" class="bf-select">
              <option value="">Select Model</option>
              <option v-for="(model, modelName) in config.models" :key="modelName" :value="modelName">
                {{ modelName }}
              </option>
            </select>
            <button @click="removeRoute(routePath)" class="bf-button bf-button--secondary">Remove</button>
          </div>
          
          <div class="config-builder__route-operations">
            <h5>Operations</h5>
            <div class="config-builder__operations-grid">
              <label v-for="op in ['c', 'rA', 'r', 'u', 'd']" :key="op" class="bf-checkbox">
                <input type="checkbox" v-model="route.operations" :value="op">
                {{ getOperationLabel(op) }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Tab -->
      <div v-if="activeTab === 'preview'" class="config-builder__preview-container">
        <div class="config-builder__preview-header">
          <h4>Generated Configuration</h4>
          <button @click="copyToClipboard" class="bf-button bf-button--secondary">Copy</button>
        </div>
        <pre class="config-builder__preview">{{ formattedConfig }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'ConfigBuilder',
  setup() {
    const activeTab = ref('basic')
    const corsOrigins = ref('http://localhost:3000')
    
    const tabs = [
      { id: 'basic', label: 'Basic Settings' },
      { id: 'models', label: 'Models' },
      { id: 'routes', label: 'Routes' },
      { id: 'preview', label: 'Preview' }
    ]

    const config = ref({
      port: 3000,
      database: {
        uri: 'mongodb://localhost:27017/myapp'
      },
      jwt: {
        secret: 'your-secret-key'
      },
      cors: {
        origins: []
      },
      models: {
        Users: {
          name: 'Users',
          fields: {
            email: { name: 'email', type: 'String', required: true },
            password: { name: 'password', type: 'String', required: true }
          }
        }
      },
      routes: {
        '/users': {
          path: '/users',
          model: 'Users',
          operations: ['c', 'rA', 'r', 'u', 'd']
        }
      }
    })

    // Watch corsOrigins and update config
    watch(corsOrigins, (newValue) => {
      config.value.cors.origins = newValue.split(',').map(origin => origin.trim()).filter(Boolean)
    })

    const formattedConfig = computed(() => {
      const configCopy = JSON.parse(JSON.stringify(config.value))
      
      // Transform models for output
      const models = {}
      Object.values(configCopy.models).forEach(model => {
        const fields = {}
        Object.values(model.fields).forEach(field => {
          fields[field.name] = {
            type: field.type,
            required: field.required
          }
        })
        models[model.name] = { fields }
      })
      
      // Transform routes for output
      const routes = {}
      Object.values(configCopy.routes).forEach(route => {
        const operations = {}
        route.operations.forEach(op => {
          operations[op] = { allow: true }
        })
        routes[route.path] = {
          model: route.model,
          ...operations
        }
      })

      const output = {
        port: configCopy.port,
        database: configCopy.database,
        jwt: configCopy.jwt,
        cors: configCopy.cors,
        models,
        routes
      }

      return JSON.stringify(output, null, 2)
    })

    const addModel = () => {
      const modelName = `Model${Object.keys(config.value.models).length + 1}`
      config.value.models[modelName] = {
        name: modelName,
        fields: {
          id: { name: 'id', type: 'ObjectId', required: true }
        }
      }
    }

    const removeModel = (modelName) => {
      delete config.value.models[modelName]
    }

    const addField = (modelName) => {
      const fieldName = `field${Object.keys(config.value.models[modelName].fields).length + 1}`
      config.value.models[modelName].fields[fieldName] = {
        name: fieldName,
        type: 'String',
        required: false
      }
    }

    const removeField = (modelName, fieldName) => {
      delete config.value.models[modelName].fields[fieldName]
    }

    const addRoute = () => {
      const routePath = `/route${Object.keys(config.value.routes).length + 1}`
      config.value.routes[routePath] = {
        path: routePath,
        model: '',
        operations: ['r']
      }
    }

    const removeRoute = (routePath) => {
      delete config.value.routes[routePath]
    }

    const getOperationLabel = (op) => {
      const labels = {
        'c': 'Create',
        'rA': 'Read All',
        'r': 'Read',
        'u': 'Update',
        'd': 'Delete'
      }
      return labels[op] || op
    }

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(formattedConfig.value)
        // Could add a toast notification here
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }

    const exportConfig = () => {
      const blob = new Blob([formattedConfig.value], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'basefloor.config.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    const resetConfig = () => {
      // Reset to default config
      config.value = {
        port: 3000,
        database: { uri: 'mongodb://localhost:27017/myapp' },
        jwt: { secret: 'your-secret-key' },
        cors: { origins: [] },
        models: {},
        routes: {}
      }
      corsOrigins.value = 'http://localhost:3000'
    }

    return {
      activeTab,
      tabs,
      config,
      corsOrigins,
      formattedConfig,
      addModel,
      removeModel,
      addField,
      removeField,
      addRoute,
      removeRoute,
      getOperationLabel,
      copyToClipboard,
      exportConfig,
      resetConfig
    }
  }
}
</script>

<style scoped>
.config-builder__actions {
  display: flex;
  gap: 0.5rem;
}

.config-builder__models-header,
.config-builder__routes-header,
.config-builder__preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.config-builder__model,
.config-builder__route {
  border: 1px solid var(--bf-border);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: white;
}

.config-builder__model-header,
.config-builder__route-header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
}

.config-builder__field {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.config-builder__operations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.bf-checkbox {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.bf-text-light {
  color: var(--bf-text-light);
  font-size: 0.75rem;
}
</style> 