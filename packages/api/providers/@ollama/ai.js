/**
 * Ollama Provider for Basefloor
 * 
 * This provider enables using local LLMs through Ollama in a Basefloor application.
 * 
 * Requirements:
 * - Ollama must be installed and running locally (default: http://localhost:11434)
 * - Models must be downloaded/installed in Ollama before use
 * - node-fetch package must be installed
 * 
 * Features:
 * - Connect to locally running Ollama instance
 * - Configure default model in basefloor.config.js
 * - Specify custom Ollama endpoint URL if needed
 * - Support for both text and image inputs with multimodal models
 * 
 * Current limitations:
 * - No streaming support currently
 * 
 * Configuration example in basefloor.config.js:
 * ```
 * module.exports = {
 *   ai: {
 *     provider: '@ollama'
 *   },
 *   providers: {
 *     '@ollama': {
 *       baseUrl: 'http://localhost:11434',
 *       models: {
 *         default: 'gemma3:4b-it-qat',
 *         small: 'gemma3:4b-it-qat',
 *         large: 'gemma3:12b-it-qat',
 *         multimodal: 'llava:13b'
 *       }
 *     }
 *   }
 * }
 * ```
 * 
 * Usage:
 * ```
 * const response = await API.AI.message({
 *   textPrompt: "Hello, how are you?",
 *   // Optional parameters:
 *   model: "gemma3:12b-it-qat", // Overrides default model
 *   temperature: 0.7,
 *   max_tokens: 2048
 * });
 * console.log(response.content[0].text);
 * ```
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Helper function to check if a string is a valid URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Helper function to convert image to base64
async function imageToBase64(imagePath) {
  try {
    // Check if the path is a URL
    if (isValidUrl(imagePath)) {
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const buffer = await response.buffer();
      return buffer.toString('base64');
    } else {
      // Assume it's a file path
      const resolvedPath = path.resolve(imagePath);
      const buffer = fs.readFileSync(resolvedPath);
      return buffer.toString('base64');
    }
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

module.exports = ({ providerVars, providerName }) => {
  const NAME = providerName;
  const ENV = providerVars;
  
  // Get the base URL for Ollama, defaulting to localhost:11434
  const baseUrl = providerVars.baseUrl || 'http://localhost:11434';
  
  // Get models configuration with the default model from config
  const models = providerVars.models || { 
    default: 'gemma3:4b-it-qat' // Default model if not specified
  };

  return {
    NAME,
    ENV,
    
    message: async ({ model, max_tokens, temperature, messages, textPrompt }) => {
      model = model || models.default;
      temperature = temperature !== null && temperature !== undefined ? temperature : 0.7;
      
      // Format for Ollama API
      let ollamaRequest = {
        model,
        options: {
          temperature,
          num_predict: max_tokens || 2048,
        },
        stream: false
      };

      // Process messages or textPrompt
      if (!messages && textPrompt) {
        // Simple text prompt
        ollamaRequest.prompt = textPrompt;
      } else if (messages && messages.length > 0) {
        // Check if any messages contain images
        let hasImages = false;
        let formattedPrompt = '';
        
        for (const msg of messages) {
          if (msg.role === 'user') {
            let userText = '';
            let imagePromises = [];
            
            // Process each content item in the message
            if (Array.isArray(msg.content)) {
              for (const contentItem of msg.content) {
                if (contentItem.type === 'text') {
                  userText += contentItem.text + '\n';
                } else if (contentItem.type === 'image' && contentItem.image_url) {
                  hasImages = true;
                  // Create a promise to convert the image to base64
                  const imagePromise = imageToBase64(contentItem.image_url.url || contentItem.image_url)
                    .then(base64 => ({
                      type: 'image',
                      data: base64
                    }));
                  imagePromises.push(imagePromise);
                }
              }
            }
            
            // If there are images, we need to use the multimodal format
            if (hasImages) {
              // Wait for all image conversions to complete
              const images = await Promise.all(imagePromises);
              
              // Create a formatted prompt with images
              ollamaRequest.prompt = userText.trim();
              ollamaRequest.images = images.map(img => img.data);
            } else {
              // Just text content
              formattedPrompt += `User: ${userText.trim()}\n`;
            }
          } else if (msg.role === 'assistant') {
            // Get text from assistant messages
            const assistantText = msg.content[0]?.text || '';
            formattedPrompt += `Assistant: ${assistantText.trim()}\n`;
          }
        }
        
        // If there are no images, use the formatted text prompt
        if (!hasImages) {
          ollamaRequest.prompt = formattedPrompt.trim();
        }
      }

      try {
        const response = await fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ollamaRequest)
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Format the response to match the Anthropic provider's structure
        return {
          id: `ollama-${Date.now()}`,
          model,
          content: [
            {
              type: 'text',
              text: data.response
            }
          ]
        };
      } catch (err) {
        console.error('Ollama API Error:', err);
        return undefined;
      }
    }
  };
}; 