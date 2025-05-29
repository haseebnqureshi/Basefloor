const { GoogleGenerativeAI } = require('@google/generative-ai')

module.exports = ({ providerVars, providerName }) => {

	const NAME = providerName
	const ENV = providerVars

	const genAI = new GoogleGenerativeAI(providerVars.apiKey)
	const models = providerVars.models

	return {

		NAME,
		ENV,
		
		message: async ({ model, max_tokens, temperature, messages, textPrompt }) => {
			model = model || models.default || 'gemini-pro'
			
			// Get the generative model
			const geminiModel = genAI.getGenerativeModel({ model })
			
			// Convert messages to a single prompt for Gemini
			let prompt = ''
			if (messages && messages.length > 0) {
				// Convert chat messages to a single prompt
				prompt = messages.map(msg => {
					if (msg.role === 'user') return `User: ${msg.content}`
					if (msg.role === 'assistant') return `Assistant: ${msg.content}`
					if (msg.role === 'system') return `System: ${msg.content}`
					return msg.content
				}).join('\n')
			} else if (textPrompt) {
				prompt = textPrompt
			}

			// Add timestamp to prevent caching and for better message management
			prompt += `\n[generated_at: ${Date.now()}]`

			// Configure generation parameters
			const generationConfig = {
				maxOutputTokens: max_tokens || 1000,
				temperature: temperature !== null && temperature !== undefined ? temperature : 0.9,
			}

			let res
			try {
				const result = await geminiModel.generateContent({
					contents: [{ role: 'user', parts: [{ text: prompt }] }],
					generationConfig
				})
				
				const response = await result.response
				
				// Format response to match other providers
				res = {
					choices: [{
						message: {
							role: 'assistant',
							content: response.text()
						},
						finish_reason: 'stop'
					}],
					usage: {
						prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
						completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
						total_tokens: response.usageMetadata?.totalTokenCount || 0
					},
					model: model,
					provider: 'google'
				}
				
				return res
			}
			catch (err) {
				console.log('Google AI Error:', err)
				return undefined
			}
		},

		// Generate content with vision support
		generateContent: async ({ model, prompt, image }) => {
			model = model || models.vision || 'gemini-pro-vision'
			
			const geminiModel = genAI.getGenerativeModel({ model })
			
			try {
				let content = [{ text: prompt }]
				
				// Add image if provided
				if (image) {
					content.push({
						inlineData: {
							mimeType: image.mimeType || 'image/jpeg',
							data: image.data // Base64 encoded image data
						}
					})
				}
				
				const result = await geminiModel.generateContent(content)
				const response = await result.response
				
				return {
					text: response.text(),
					usage: response.usageMetadata,
					model: model,
					provider: 'google'
				}
			}
			catch (err) {
				console.log('Google AI Generate Content Error:', err)
				return undefined
			}
		},

		// Stream content generation
		generateContentStream: async ({ model, prompt }) => {
			model = model || models.default || 'gemini-pro'
			
			const geminiModel = genAI.getGenerativeModel({ model })
			
			try {
				const result = await geminiModel.generateContentStream(prompt)
				return result.stream
			}
			catch (err) {
				console.log('Google AI Stream Error:', err)
				return undefined
			}
		},

		// Count tokens
		countTokens: async ({ model, prompt }) => {
			model = model || models.default || 'gemini-pro'
			
			const geminiModel = genAI.getGenerativeModel({ model })
			
			try {
				const result = await geminiModel.countTokens(prompt)
				return result
			}
			catch (err) {
				console.log('Google AI Count Tokens Error:', err)
				return undefined
			}
		}
	}
} 