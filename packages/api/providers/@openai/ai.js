const OpenAI = require('openai')

module.exports = ({ providerVars, providerName }) => {

	const NAME = providerName
	const ENV = providerVars

	const client = new OpenAI({
		apiKey: providerVars.apiKey
	})

	const models = providerVars.models

	return {

		NAME,
		ENV,
		
		message: async ({ model, max_tokens, temperature, messages, textPrompt }) => {
			model = model || models.default || 'gpt-3.5-turbo'
			max_tokens = max_tokens || 1000
			temperature = temperature !== null && temperature !== undefined ? temperature : 0
			
			// Convert textPrompt to messages format if provided
			if (!messages && textPrompt) {
				messages = [
					{
						role: 'user',
						content: textPrompt
					} 
				]
			}

			// Add timestamp to prevent caching and for better message management
			if (messages && messages.length > 0) {
				const lastMessage = messages[messages.length - 1]
				if (lastMessage.role === 'user') {
					lastMessage.content += `\n[generated_at: ${Date.now()}]`
				}
			}

			let res
			try {
				res = await client.chat.completions.create({
					model,
					max_tokens,
					temperature,
					messages
				})
				return res
			}
			catch (err) {
				console.log('OpenAI Error:', err)
				return undefined
			}
		},

		// Additional OpenAI-specific methods
		completion: async ({ model, prompt, max_tokens, temperature }) => {
			model = model || 'gpt-3.5-turbo-instruct'
			max_tokens = max_tokens || 1000
			temperature = temperature !== null && temperature !== undefined ? temperature : 0

			try {
				const res = await client.completions.create({
					model,
					prompt,
					max_tokens,
					temperature
				})
				return res
			}
			catch (err) {
				console.log('OpenAI Completion Error:', err)
				return undefined
			}
		},

		embedding: async ({ model, input }) => {
			model = model || 'text-embedding-ada-002'

			try {
				const res = await client.embeddings.create({
					model,
					input
				})
				return res
			}
			catch (err) {
				console.log('OpenAI Embedding Error:', err)
				return undefined
			}
		}
	}
} 