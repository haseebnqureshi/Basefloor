
const Anthropic = require('@anthropic-ai/sdk')

module.exports = ({ providerVars }) => {

	const client = new Anthropic({
		apiKey: providerVars.apiKey
	})

	const models = providerVars.models

	return {

		message: async ({ model, max_tokens, temperature, messages, textPrompt }) => {
			model = model || models.default
			max_tokens = max_tokens || 1000
			temperature = temperature !== null || temperature !== undefined ? temperature : 0
			if (!messages && textPrompt) {
				messages = [
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: textPrompt,
							},
							{
								type: 'text',
								text: `\ngenerated_at: ${Date.now()}]\n`
							}
						]
					} 
				]
			}
			let res
			try {
				res = await client.messages.create({ model, max_tokens, temperature, messages })
				return res
			}
			catch (err) {
				console.log(err, res)
				return undefined
			}
		}
	}
}