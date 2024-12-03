
module.exports = (API, {}) => {

	const Anthropic = require('@anthropic-ai/sdk')

	API.AI = {
		Anthropic: { 
			client: new Anthropic({
				apiKey: process.env.ANTHROPIC_API_KEY
			}),
			model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
		}
	}

	API.AI.Anthropic.message = async ({ model, max_tokens, temperature, messages, textPrompt }) => {
		model = model || API.AI.Anthropic.model
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
						}
					]
				} 
			]
		}


		return await API.AI.Anthropic.client.messages.create({ model, max_tokens, temperature, messages })

	}

	return API

}