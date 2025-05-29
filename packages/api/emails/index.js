const loadProvider = require('../providers/loader');

module.exports = (API, { emails, paths, providers, checks }) => {

	API.Emails.enabled = true

	// Simple template processing function for local templates
	const processTemplate = (template, variables) => {
		if (!template || !variables) return template;
		
		let processed = template;
		Object.keys(variables).forEach(key => {
			const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
			processed = processed.replace(regex, variables[key] || '');
		});
		return processed;
	};

	// Enhanced email methods
	const enhanceProvider = (provider, emailConfig) => {
		const enhanced = { ...provider };

		// Add sendTemplate method
		enhanced.sendTemplate = async (options) => {
			const { template, variables, ...emailOptions } = options;
			
			// Check if we have local templates defined
			if (emailConfig.templates && emailConfig.templates[template]) {
				const templateConfig = emailConfig.templates[template];
				
				// Process local template
				const processedEmail = { ...emailOptions };
				
				if (templateConfig.subject) {
					processedEmail.subject = processTemplate(templateConfig.subject, variables);
				}
				if (templateConfig.html) {
					processedEmail.html = processTemplate(templateConfig.html, variables);
				}
				if (templateConfig.text) {
					processedEmail.text = processTemplate(templateConfig.text, variables);
				}
				
				return provider.send(processedEmail);
			}
			
			// If no local template, pass through to provider (for provider-native templates)
			return provider.send(options);
		};

		// Add sendBulk method
		enhanced.sendBulk = async (options) => {
			const { recipients, template, variables: globalVariables, ...emailOptions } = options;
			const results = [];
			
			for (const recipient of recipients) {
				try {
					const recipientVariables = {
						...globalVariables,
						...recipient.variables,
						email: recipient.email,
						name: recipient.name
					};
					
					const emailData = {
						...emailOptions,
						to: recipient.email
					};
					
					let result;
					if (template) {
						result = await enhanced.sendTemplate({
							...emailData,
							template,
							variables: recipientVariables
						});
					} else {
						result = await provider.send(emailData);
					}
					
					results.push({ email: recipient.email, success: true, result });
				} catch (error) {
					results.push({ email: recipient.email, success: false, error: error.message });
				}
			}
			
			return results;
		};

		// Add queue method (simple implementation)
		enhanced.queue = async (options) => {
			const { sendAt, template, ...emailOptions } = options;
			
			if (sendAt && sendAt > new Date()) {
				// Simple setTimeout for future emails
				const delay = sendAt.getTime() - Date.now();
				setTimeout(async () => {
					try {
						if (template) {
							await enhanced.sendTemplate({ template, ...emailOptions });
						} else {
							await provider.send(emailOptions);
						}
					} catch (error) {
						console.error('Queued email failed:', error);
					}
				}, delay);
				
				return { queued: true, sendAt };
			}
			
			// Send immediately if no sendAt or sendAt is in the past
			if (template) {
				return enhanced.sendTemplate({ template, ...emailOptions });
			} else {
				return provider.send(emailOptions);
			}
		};

		return enhanced;
	};

	if (emails.provider) {
		try {
			const provider = loadProvider(`${paths.basefloor}/providers/${emails.provider}`)({ 
				providerVars: providers[emails.provider],
				providerName: emails.provider,
			});
			
			API.Emails = { 
				...API.Emails,
				...enhanceProvider(provider, emails)
			};
		} catch (err) {
			console.error(`Email Service Error: ${err.message}`);
			return API;
		}
		return API;
	}
  
  /*
  for if we decide to enable multiple providers
  could be useful, only use with the following config in config.basefloor.js:
  
  "emails": {
    enabled: true,
    providers: {
      "Transactional": "@mailgun/emails",
      "Marketing": "@postmark/emails",
    },
  },

  */

	else if (emails.providers) {
		for (let key in emails.providers) {
			const name = emails.providers[key];
			try {
				const provider = loadProvider(`${paths.basefloor}/providers/${name}`)({ 
					providerVars: providers[name],
					providerName: name,
				});
				
				API.Emails[key] = enhanceProvider(provider, emails);
			} catch (err) {
				console.error(`Email Service Error (${key}): ${err.message}`);
			}
		}
	}

	return API;
}