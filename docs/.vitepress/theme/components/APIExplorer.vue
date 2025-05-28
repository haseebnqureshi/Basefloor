<template>
  <div class="api-explorer">
    <div class="api-explorer__header">
      <div class="api-explorer__endpoint">
        <span :class="`api-explorer__method api-explorer__method--${method.toLowerCase()}`">
          {{ method }}
        </span>
        <span class="api-explorer__url">{{ baseUrl }}{{ endpoint }}</span>
      </div>
      <div class="api-explorer__status" v-if="lastResponse">
        <span :class="`api-explorer__status-code api-explorer__status-code--${getStatusClass(lastResponse.status)}`">
          {{ lastResponse.status }}
        </span>
      </div>
    </div>

    <div class="api-explorer__body">
      <!-- Base URL Configuration -->
      <div class="api-explorer__section">
        <h4 class="api-explorer__section-title">Base URL</h4>
        <input 
          v-model="baseUrl" 
          class="api-explorer__input" 
          placeholder="http://localhost:3000"
        >
      </div>

      <!-- Authentication -->
      <div class="api-explorer__section" v-if="requiresAuth">
        <h4 class="api-explorer__section-title">Authentication</h4>
        <div class="api-explorer__auth">
          <select v-model="authType" class="api-explorer__input">
            <option value="bearer">Bearer Token</option>
            <option value="basic">Basic Auth</option>
            <option value="none">None</option>
          </select>
          
          <input 
            v-if="authType === 'bearer'"
            v-model="authToken" 
            class="api-explorer__input" 
            placeholder="JWT token"
            type="password"
          >
          
          <div v-if="authType === 'basic'" class="api-explorer__basic-auth">
            <input 
              v-model="basicAuth.username" 
              class="api-explorer__input" 
              placeholder="Username"
            >
            <input 
              v-model="basicAuth.password" 
              class="api-explorer__input" 
              placeholder="Password"
              type="password"
            >
          </div>
        </div>
      </div>

      <!-- Path Parameters -->
      <div class="api-explorer__section" v-if="pathParams.length > 0">
        <h4 class="api-explorer__section-title">Path Parameters</h4>
        <div v-for="param in pathParams" :key="param" class="api-explorer__param">
          <label class="api-explorer__param-label">{{ param }}</label>
          <input 
            v-model="pathValues[param]" 
            class="api-explorer__input" 
            :placeholder="`Enter ${param}`"
          >
        </div>
      </div>

      <!-- Query Parameters -->
      <div class="api-explorer__section" v-if="showQueryParams">
        <h4 class="api-explorer__section-title">Query Parameters</h4>
        <div class="api-explorer__query-params">
          <div v-for="(param, index) in queryParams" :key="index" class="api-explorer__query-param">
            <input 
              v-model="param.key" 
              class="api-explorer__input" 
              placeholder="Parameter name"
            >
            <input 
              v-model="param.value" 
              class="api-explorer__input" 
              placeholder="Parameter value"
            >
            <button @click="removeQueryParam(index)" class="api-explorer__button api-explorer__button--small">×</button>
          </div>
          <button @click="addQueryParam" class="api-explorer__button api-explorer__button--secondary">
            Add Parameter
          </button>
        </div>
      </div>

      <!-- Request Headers -->
      <div class="api-explorer__section">
        <h4 class="api-explorer__section-title">Headers</h4>
        <div class="api-explorer__headers">
          <div v-for="(header, index) in customHeaders" :key="index" class="api-explorer__header">
            <input 
              v-model="header.key" 
              class="api-explorer__input" 
              placeholder="Header name"
            >
            <input 
              v-model="header.value" 
              class="api-explorer__input" 
              placeholder="Header value"
            >
            <button @click="removeHeader(index)" class="api-explorer__button api-explorer__button--small">×</button>
          </div>
          <button @click="addHeader" class="api-explorer__button api-explorer__button--secondary">
            Add Header
          </button>
        </div>
      </div>

      <!-- Request Body -->
      <div class="api-explorer__section" v-if="hasBody">
        <h4 class="api-explorer__section-title">Request Body</h4>
        <div class="api-explorer__body-type">
          <select v-model="bodyType" class="api-explorer__input">
            <option value="json">JSON</option>
            <option value="form">Form Data</option>
            <option value="text">Raw Text</option>
          </select>
        </div>
        
        <textarea 
          v-if="bodyType === 'json' || bodyType === 'text'"
          v-model="requestBody" 
          class="api-explorer__input api-explorer__textarea" 
          :placeholder="bodyType === 'json' ? 'Enter JSON...' : 'Enter text...'"
        ></textarea>
        
        <div v-if="bodyType === 'form'" class="api-explorer__form-data">
          <div v-for="(field, index) in formData" :key="index" class="api-explorer__form-field">
            <input 
              v-model="field.key" 
              class="api-explorer__input" 
              placeholder="Field name"
            >
            <input 
              v-model="field.value" 
              class="api-explorer__input" 
              placeholder="Field value"
            >
            <button @click="removeFormField(index)" class="api-explorer__button api-explorer__button--small">×</button>
          </div>
          <button @click="addFormField" class="api-explorer__button api-explorer__button--secondary">
            Add Field
          </button>
        </div>
      </div>

      <!-- Send Request Button -->
      <div class="api-explorer__section">
        <button 
          @click="sendRequest" 
          :disabled="isLoading" 
          class="api-explorer__button"
        >
          {{ isLoading ? 'Sending...' : 'Send Request' }}
        </button>
      </div>

      <!-- Response -->
      <div class="api-explorer__section" v-if="lastResponse">
        <h4 class="api-explorer__section-title">Response</h4>
        <div class="api-explorer__response-info">
          <span class="api-explorer__response-time">{{ responseTime }}ms</span>
          <span :class="`api-explorer__status-code api-explorer__status-code--${getStatusClass(lastResponse.status)}`">
            {{ lastResponse.status }} {{ lastResponse.statusText }}
          </span>
        </div>
        
        <div class="api-explorer__response-headers" v-if="showResponseHeaders">
          <h5>Response Headers</h5>
          <pre class="api-explorer__response">{{ formatHeaders(lastResponse.headers) }}</pre>
        </div>
        
        <div class="api-explorer__response-body">
          <h5>Response Body</h5>
          <pre class="api-explorer__response">{{ formatResponse(lastResponse.data) }}</pre>
        </div>
        
        <button @click="showResponseHeaders = !showResponseHeaders" class="api-explorer__button api-explorer__button--secondary">
          {{ showResponseHeaders ? 'Hide' : 'Show' }} Headers
        </button>
      </div>

      <!-- Error Display -->
      <div class="api-explorer__section" v-if="error">
        <h4 class="api-explorer__section-title">Error</h4>
        <pre class="api-explorer__response api-explorer__response--error">{{ error }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'APIExplorer',
  props: {
    method: {
      type: String,
      default: 'GET'
    },
    endpoint: {
      type: String,
      required: true
    },
    requiresAuth: {
      type: Boolean,
      default: false
    },
    sampleBody: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const baseUrl = ref('http://localhost:3000')
    const authType = ref('bearer')
    const authToken = ref('')
    const basicAuth = ref({ username: '', password: '' })
    const pathValues = ref({})
    const queryParams = ref([])
    const customHeaders = ref([])
    const bodyType = ref('json')
    const requestBody = ref(props.sampleBody || '')
    const formData = ref([])
    const isLoading = ref(false)
    const lastResponse = ref(null)
    const responseTime = ref(0)
    const error = ref('')
    const showResponseHeaders = ref(false)

    // Extract path parameters from endpoint
    const pathParams = computed(() => {
      const matches = props.endpoint.match(/:(\w+)/g)
      return matches ? matches.map(match => match.substring(1)) : []
    })

    const hasBody = computed(() => {
      return ['POST', 'PUT', 'PATCH'].includes(props.method.toUpperCase())
    })

    const showQueryParams = computed(() => {
      return ['GET', 'DELETE'].includes(props.method.toUpperCase()) || queryParams.value.length > 0
    })

    // Build final URL with path parameters
    const finalUrl = computed(() => {
      let url = props.endpoint
      pathParams.value.forEach(param => {
        const value = pathValues.value[param] || `:${param}`
        url = url.replace(`:${param}`, value)
      })
      return baseUrl.value + url
    })

    // Initialize path parameters
    watch(() => pathParams.value, (newParams) => {
      newParams.forEach(param => {
        if (!(param in pathValues.value)) {
          pathValues.value[param] = ''
        }
      })
    }, { immediate: true })

    const addQueryParam = () => {
      queryParams.value.push({ key: '', value: '' })
    }

    const removeQueryParam = (index) => {
      queryParams.value.splice(index, 1)
    }

    const addHeader = () => {
      customHeaders.value.push({ key: '', value: '' })
    }

    const removeHeader = (index) => {
      customHeaders.value.splice(index, 1)
    }

    const addFormField = () => {
      formData.value.push({ key: '', value: '' })
    }

    const removeFormField = (index) => {
      formData.value.splice(index, 1)
    }

    const buildHeaders = () => {
      const headers = {
        'Content-Type': bodyType.value === 'json' ? 'application/json' : 
                       bodyType.value === 'form' ? 'application/x-www-form-urlencoded' : 
                       'text/plain'
      }

      // Add authentication
      if (props.requiresAuth && authType.value === 'bearer' && authToken.value) {
        headers['Authorization'] = `Bearer ${authToken.value}`
      } else if (props.requiresAuth && authType.value === 'basic' && basicAuth.value.username) {
        const credentials = btoa(`${basicAuth.value.username}:${basicAuth.value.password}`)
        headers['Authorization'] = `Basic ${credentials}`
      }

      // Add custom headers
      customHeaders.value.forEach(header => {
        if (header.key && header.value) {
          headers[header.key] = header.value
        }
      })

      return headers
    }

    const buildBody = () => {
      if (!hasBody.value) return null

      if (bodyType.value === 'json') {
        try {
          return JSON.parse(requestBody.value || '{}')
        } catch (e) {
          throw new Error('Invalid JSON in request body')
        }
      } else if (bodyType.value === 'form') {
        const formDataObj = new FormData()
        formData.value.forEach(field => {
          if (field.key && field.value) {
            formDataObj.append(field.key, field.value)
          }
        })
        return formDataObj
      } else {
        return requestBody.value
      }
    }

    const buildUrl = () => {
      let url = finalUrl.value
      
      // Add query parameters
      const validParams = queryParams.value.filter(param => param.key && param.value)
      if (validParams.length > 0) {
        const searchParams = new URLSearchParams()
        validParams.forEach(param => {
          searchParams.append(param.key, param.value)
        })
        url += '?' + searchParams.toString()
      }
      
      return url
    }

    const sendRequest = async () => {
      isLoading.value = true
      error.value = ''
      lastResponse.value = null
      
      const startTime = Date.now()

      try {
        const url = buildUrl()
        const headers = buildHeaders()
        const body = buildBody()

        const options = {
          method: props.method.toUpperCase(),
          headers,
          mode: 'cors'
        }

        if (body !== null) {
          options.body = bodyType.value === 'json' ? JSON.stringify(body) : body
        }

        const response = await fetch(url, options)
        responseTime.value = Date.now() - startTime

        let data
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json()
        } else {
          data = await response.text()
        }

        lastResponse.value = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data
        }

      } catch (err) {
        responseTime.value = Date.now() - startTime
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }

    const getStatusClass = (status) => {
      if (status >= 200 && status < 300) return 'success'
      if (status >= 400 && status < 500) return 'client-error'
      if (status >= 500) return 'server-error'
      return 'info'
    }

    const formatResponse = (data) => {
      if (typeof data === 'string') return data
      return JSON.stringify(data, null, 2)
    }

    const formatHeaders = (headers) => {
      return Object.entries(headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
    }

    return {
      baseUrl,
      authType,
      authToken,
      basicAuth,
      pathParams,
      pathValues,
      queryParams,
      customHeaders,
      bodyType,
      requestBody,
      formData,
      isLoading,
      lastResponse,
      responseTime,
      error,
      showResponseHeaders,
      hasBody,
      showQueryParams,
      addQueryParam,
      removeQueryParam,
      addHeader,
      removeHeader,
      addFormField,
      removeFormField,
      sendRequest,
      getStatusClass,
      formatResponse,
      formatHeaders
    }
  }
}
</script>

<style scoped>
.api-explorer__endpoint {
  display: flex;
  align-items: center;
  flex: 1;
}

.api-explorer__status {
  display: flex;
  align-items: center;
}

.api-explorer__status-code {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.75rem;
}

.api-explorer__status-code--success { background: #10b981; color: white; }
.api-explorer__status-code--client-error { background: #f59e0b; color: white; }
.api-explorer__status-code--server-error { background: #ef4444; color: white; }
.api-explorer__status-code--info { background: #3b82f6; color: white; }

.api-explorer__auth {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.api-explorer__basic-auth {
  display: flex;
  gap: 0.5rem;
}

.api-explorer__param,
.api-explorer__query-param,
.api-explorer__header,
.api-explorer__form-field {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.api-explorer__param-label {
  min-width: 100px;
  font-weight: 600;
  color: var(--bf-text-dark);
}

.api-explorer__button--small {
  padding: 0.25rem 0.5rem;
  min-width: auto;
}

.api-explorer__button--secondary {
  background: var(--bf-secondary);
}

.api-explorer__button--secondary:hover {
  background: var(--bf-text-dark);
}

.api-explorer__response-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: var(--bf-bg-light);
  border-radius: 4px;
}

.api-explorer__response-time {
  font-size: 0.875rem;
  color: var(--bf-text-light);
}

.api-explorer__response--error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

@media (max-width: 768px) {
  .api-explorer__param,
  .api-explorer__query-param,
  .api-explorer__header,
  .api-explorer__form-field {
    flex-direction: column;
    align-items: stretch;
  }
  
  .api-explorer__basic-auth {
    flex-direction: column;
  }
  
  .api-explorer__response-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style> 