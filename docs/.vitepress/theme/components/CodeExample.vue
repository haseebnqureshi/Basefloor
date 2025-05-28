<template>
  <div class="code-example">
    <div class="code-example__header">
      <div class="code-example__tabs">
        <button 
          v-for="variant in variants" 
          :key="variant.id"
          @click="activeVariant = variant.id"
          :class="['code-example__tab', { 'code-example__tab--active': activeVariant === variant.id }]"
        >
          {{ variant.label }}
        </button>
      </div>
      <div class="code-example__actions">
        <button @click="copyCode" class="code-example__copy">
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button v-if="showRunnable" @click="runCode" class="code-example__copy">
          {{ running ? 'Running...' : 'Run' }}
        </button>
      </div>
    </div>
    
    <div class="code-example__content">
      <pre class="code-example__code"><code v-html="highlightedCode"></code></pre>
    </div>
    
    <!-- Output section for runnable examples -->
    <div v-if="showOutput && output" class="code-example__output">
      <h4>Output:</h4>
      <pre class="code-example__output-content">{{ output }}</pre>
    </div>
    
    <!-- Explanation section -->
    <div v-if="currentVariant.explanation" class="code-example__explanation">
      <h4>Explanation:</h4>
      <div v-html="currentVariant.explanation"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'CodeExample',
  props: {
    variants: {
      type: Array,
      required: true,
      // Expected format:
      // [
      //   {
      //     id: 'javascript',
      //     label: 'JavaScript',
      //     language: 'javascript',
      //     code: 'const example = "code";',
      //     explanation: 'This is how you do it in JS',
      //     runnable: true
      //   }
      // ]
    },
    defaultVariant: {
      type: String,
      default: null
    },
    showRunnable: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const activeVariant = ref(props.defaultVariant || props.variants[0]?.id)
    const copied = ref(false)
    const running = ref(false)
    const output = ref('')
    const showOutput = ref(false)

    const currentVariant = computed(() => {
      return props.variants.find(v => v.id === activeVariant.value) || props.variants[0]
    })

    const highlightedCode = computed(() => {
      const code = currentVariant.value?.code || ''
      const language = currentVariant.value?.language || 'text'
      
      // Basic syntax highlighting for common languages
      return highlightSyntax(code, language)
    })

    // Watch for variant changes to reset state
    watch(activeVariant, () => {
      copied.value = false
      output.value = ''
      showOutput.value = false
    })

    const copyCode = async () => {
      try {
        await navigator.clipboard.writeText(currentVariant.value.code)
        copied.value = true
        setTimeout(() => {
          copied.value = false
        }, 2000)
      } catch (err) {
        console.error('Failed to copy code:', err)
      }
    }

    const runCode = async () => {
      if (!currentVariant.value.runnable) return
      
      running.value = true
      showOutput.value = true
      
      try {
        // For JavaScript examples, we can actually run them
        if (currentVariant.value.language === 'javascript') {
          output.value = await runJavaScript(currentVariant.value.code)
        } else {
          // For other languages, show a mock output or explanation
          output.value = `// This would run the ${currentVariant.value.language} code\n// Output would appear here in a real environment`
        }
      } catch (err) {
        output.value = `Error: ${err.message}`
      } finally {
        running.value = false
      }
    }

    const runJavaScript = async (code) => {
      return new Promise((resolve) => {
        // Create a safe execution context
        const originalLog = console.log
        const logs = []
        
        console.log = (...args) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '))
        }
        
        try {
          // Execute the code
          const result = eval(code)
          
          // Restore console.log
          console.log = originalLog
          
          // Return logs and result
          const output = logs.length > 0 ? logs.join('\n') : ''
          const resultOutput = result !== undefined ? `\nResult: ${JSON.stringify(result, null, 2)}` : ''
          
          resolve(output + resultOutput || 'Code executed successfully (no output)')
        } catch (err) {
          console.log = originalLog
          resolve(`Error: ${err.message}`)
        }
      })
    }

    const highlightSyntax = (code, language) => {
      // Basic syntax highlighting - in a real implementation, you'd use a library like Prism.js
      let highlighted = escapeHtml(code)
      
      switch (language) {
        case 'javascript':
        case 'js':
          highlighted = highlightJavaScript(highlighted)
          break
        case 'json':
          highlighted = highlightJSON(highlighted)
          break
        case 'bash':
        case 'shell':
          highlighted = highlightBash(highlighted)
          break
        case 'curl':
          highlighted = highlightCurl(highlighted)
          break
        default:
          // No highlighting for unknown languages
          break
      }
      
      return highlighted
    }

    const escapeHtml = (text) => {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    }

    const highlightJavaScript = (code) => {
      // Keywords
      code = code.replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new)\b/g, 
        '<span style="color: #569cd6;">$1</span>')
      
      // Strings
      code = code.replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, 
        '<span style="color: #ce9178;">$1$2$1</span>')
      
      // Comments
      code = code.replace(/(\/\/.*$)/gm, 
        '<span style="color: #6a9955;">$1</span>')
      
      // Numbers
      code = code.replace(/\b(\d+\.?\d*)\b/g, 
        '<span style="color: #b5cea8;">$1</span>')
      
      return code
    }

    const highlightJSON = (code) => {
      // Strings (keys and values)
      code = code.replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, 
        '<span style="color: #ce9178;">$1$2$1</span>')
      
      // Numbers
      code = code.replace(/:\s*(\d+\.?\d*)/g, 
        ': <span style="color: #b5cea8;">$1</span>')
      
      // Booleans and null
      code = code.replace(/\b(true|false|null)\b/g, 
        '<span style="color: #569cd6;">$1</span>')
      
      return code
    }

    const highlightBash = (code) => {
      // Commands
      code = code.replace(/^(\w+)/gm, 
        '<span style="color: #569cd6;">$1</span>')
      
      // Flags
      code = code.replace(/(\s-{1,2}\w+)/g, 
        '<span style="color: #dcdcaa;">$1</span>')
      
      // Strings
      code = code.replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, 
        '<span style="color: #ce9178;">$1$2$1</span>')
      
      return code
    }

    const highlightCurl = (code) => {
      // curl command
      code = code.replace(/^curl\b/gm, 
        '<span style="color: #569cd6;">curl</span>')
      
      // Flags
      code = code.replace(/(\s-{1,2}[A-Za-z]+)/g, 
        '<span style="color: #dcdcaa;">$1</span>')
      
      // URLs
      code = code.replace(/(https?:\/\/[^\s]+)/g, 
        '<span style="color: #4ec9b0;">$1</span>')
      
      // Strings
      code = code.replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, 
        '<span style="color: #ce9178;">$1$2$1</span>')
      
      return code
    }

    return {
      activeVariant,
      currentVariant,
      highlightedCode,
      copied,
      running,
      output,
      showOutput,
      copyCode,
      runCode
    }
  }
}
</script>

<style scoped>
.code-example__output {
  border-top: 1px solid var(--bf-border);
  padding: 1rem;
  background: var(--bf-bg-light);
}

.code-example__output h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--bf-text-dark);
}

.code-example__output-content {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 0.75rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  margin: 0;
  white-space: pre-wrap;
  overflow-x: auto;
}

.code-example__explanation {
  border-top: 1px solid var(--bf-border);
  padding: 1rem;
  background: var(--bf-bg-light);
}

.code-example__explanation h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--bf-text-dark);
}

.code-example__explanation p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--bf-text-light);
}

/* Syntax highlighting styles */
.code-example__code {
  line-height: 1.5;
}

.code-example__code .keyword {
  color: #569cd6;
}

.code-example__code .string {
  color: #ce9178;
}

.code-example__code .comment {
  color: #6a9955;
  font-style: italic;
}

.code-example__code .number {
  color: #b5cea8;
}

.code-example__code .function {
  color: #dcdcaa;
}

.code-example__code .variable {
  color: #9cdcfe;
}

@media (max-width: 768px) {
  .code-example__header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .code-example__tabs {
    justify-content: flex-start;
    overflow-x: auto;
  }
  
  .code-example__actions {
    justify-content: flex-end;
  }
}
</style> 