# Email Service

The Email service provides email sending capabilities to your Basefloor application through various email provider integrations.

## Overview

The Email module enables you to send transactional emails, marketing emails, and other email communications through your application. It supports multiple providers and can be configured for single or multi-provider setups.

## Configuration

### Single Provider Setup

Configure a single email provider in your `basefloor.config.js`:

```javascript
module.exports = (API) => {
  return {
    emails: {
      enabled: true,
      provider: '@postmark/emails', // or '@mailgun/emails'
    },
    providers: {
      '@postmark/emails': {
        serverToken: process.env.POSTMARK_SERVER_TOKEN,
      },
    },
  }
}
```

### Multiple Providers Setup

Configure multiple email providers for different use cases:

```javascript
module.exports = (API) => {
  return {
    emails: {
      enabled: true,
      providers: {
        'Transactional': '@postmark/emails',
        'Marketing': '@mailgun/emails',
      },
    },
    providers: {
      '@postmark/emails': {
        serverToken: process.env.POSTMARK_SERVER_TOKEN,
      },
      '@mailgun/emails': {
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      },
    },
  }
}
```

## Usage

### Single Provider

When using a single provider, access email functionality directly:

```javascript
// In your route handlers
app.post('/api/send-welcome-email', async (req, res) => {
  try {
    const { userEmail, userName } = req.body;
    
    const result = await API.Emails.send({
      from: 'noreply@yourapp.com',
      to: userEmail,
      subject: 'Welcome to Our App!',
      html: `<h1>Welcome ${userName}!</h1><p>Thanks for joining us.</p>`,
      text: `Welcome ${userName}! Thanks for joining us.`,
    });
    
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Multiple Providers

When using multiple providers, access each by its configured name:

```javascript
// Send transactional email via Postmark
await API.Emails.Transactional.send({
  from: 'noreply@yourapp.com',
  to: 'user@example.com',
  subject: 'Password Reset',
  html: '<p>Click here to reset your password...</p>',
});

// Send marketing email via Mailgun
await API.Emails.Marketing.send({
  from: 'marketing@yourapp.com',
  to: 'subscriber@example.com',
  subject: 'Monthly Newsletter',
  html: '<h1>This month in our app...</h1>',
});
```

## Available Providers

### Postmark (@postmark/emails)

Postmark is optimized for transactional emails with high deliverability rates.

**Configuration:**
```javascript
providers: {
  '@postmark/emails': {
    serverToken: process.env.POSTMARK_SERVER_TOKEN,
  },
}
```

**Methods:**
- `send(options)` - Send an email

**Example:**
```javascript
const result = await API.Emails.send({
  from: 'sender@yourapp.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  html: '<h1>Hello World!</h1>',
  text: 'Hello World!',
  tag: 'welcome-email', // Optional: for tracking
  metadata: { // Optional: custom metadata
    userId: '12345',
    campaign: 'onboarding'
  }
});
```

### Mailgun (@mailgun/emails)

Mailgun provides powerful email APIs for both transactional and marketing emails.

**Configuration:**
```javascript
providers: {
  '@mailgun/emails': {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    baseURL: 'https://api.mailgun.net', // Optional, defaults to US region
  },
}
```

**Methods:**
- `send(options)` - Send an email

**Example:**
```javascript
const result = await API.Emails.send({
  from: 'sender@yourapp.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  html: '<h1>Hello World!</h1>',
  text: 'Hello World!',
  tags: ['welcome', 'onboarding'], // Optional: for tracking
  'o:tracking': 'yes', // Optional: enable tracking
});
```

## Common Email Options

All providers support these common options:

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `from` | String | Yes | Sender email address |
| `to` | String/Array | Yes | Recipient email address(es) |
| `subject` | String | Yes | Email subject line |
| `html` | String | No | HTML email content |
| `text` | String | No | Plain text email content |
| `cc` | String/Array | No | CC recipients |
| `bcc` | String/Array | No | BCC recipients |
| `replyTo` | String | No | Reply-to email address |

## Email Templates

### Built-in Auth Templates

The auth module includes pre-built email templates:

```javascript
// Password reset email
const emailArgs = require('./auth/emails/resetPasswordWithCode')(email, {
  code: '123456',
  durationText: '15 minutes',
  appName: 'Your App',
  appAuthor: 'Your Company',
  appAuthorEmail: 'support@yourapp.com',
});

await API.Emails.send(emailArgs);

// Email verification
const emailArgs = require('./auth/emails/verifyEmail')(email, {
  url: 'https://yourapp.com/verify?token=...',
  appName: 'Your App',
  appAuthor: 'Your Company',
});

await API.Emails.send(emailArgs);
```

### Custom Templates

Create your own email templates:

```javascript
// templates/welcome.js
module.exports = (email, data) => {
  return {
    from: 'welcome@yourapp.com',
    to: email,
    subject: `Welcome to ${data.appName}!`,
    html: `
      <h1>Welcome ${data.userName}!</h1>
      <p>Thanks for joining ${data.appName}.</p>
      <p>Get started by <a href="${data.dashboardUrl}">visiting your dashboard</a>.</p>
    `,
    text: `Welcome ${data.userName}! Thanks for joining ${data.appName}. Get started by visiting your dashboard: ${data.dashboardUrl}`,
  };
};

// Usage
const welcomeEmail = require('./templates/welcome');
const emailArgs = welcomeEmail('user@example.com', {
  userName: 'John Doe',
  appName: 'Your App',
  dashboardUrl: 'https://yourapp.com/dashboard',
});

await API.Emails.send(emailArgs);
```

## Error Handling

The Email service includes built-in error handling:

```javascript
try {
  const result = await API.Emails.send(emailOptions);
  console.log('Email sent successfully:', result.messageId);
} catch (error) {
  console.error('Email Service Error:', error.message);
  // Handle the error appropriately
  // Common errors: invalid email, rate limit, authentication failure
}
```

## Environment Variables

Set up the following environment variables for your chosen providers:

```bash
# Postmark
POSTMARK_SERVER_TOKEN=your_postmark_server_token

# Mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain

# Optional: For EU region
MAILGUN_BASE_URL=https://api.eu.mailgun.net
```

## Dependencies

Each provider requires specific dependencies to be installed:

### Postmark
```bash
npm install postmark
```

### Mailgun
```bash
npm install mailgun.js
```

The system will automatically check for required dependencies and provide installation instructions if any are missing.

## Best Practices

1. **Environment Variables**: Always use environment variables for API keys and sensitive configuration
2. **Error Handling**: Implement proper error handling for email sending
3. **Rate Limiting**: Be aware of provider rate limits and implement appropriate throttling
4. **Email Validation**: Validate email addresses before sending
5. **Unsubscribe Links**: Include unsubscribe links in marketing emails
6. **Testing**: Use provider sandbox/test modes during development
7. **Monitoring**: Monitor email delivery rates and bounce rates

## Testing

### Development Mode

Most providers offer test/sandbox modes:

```javascript
// Postmark test mode (emails won't actually send)
providers: {
  '@postmark/emails': {
    serverToken: 'POSTMARK_API_TEST', // Special test token
  },
}

// Mailgun test mode
providers: {
  '@mailgun/emails': {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    testMode: true, // Enable test mode
  },
}
```

### Email Testing Tools

Consider using email testing tools during development:
- [MailHog](https://github.com/mailhog/MailHog) - Local email testing
- [Mailtrap](https://mailtrap.io/) - Email sandbox service

## Troubleshooting

### Provider Not Loading
If a provider fails to load, check:
1. Required dependencies are installed
2. Environment variables are set correctly
3. API keys are valid
4. Domain is properly configured (for Mailgun)

### Email Not Sending
Common issues:
1. **Authentication**: Verify API keys and tokens
2. **Domain Verification**: Ensure sending domain is verified with provider
3. **Rate Limits**: Check if you've exceeded sending limits
4. **Email Format**: Ensure email addresses are properly formatted
5. **Content Filtering**: Check if content triggers spam filters

### Missing Dependencies
The system will provide specific installation commands if dependencies are missing:
```bash
# Example error message
Missing required dependencies for @postmark/emails:
Please run 'npm install postmark --save' in the Basefloor directory
``` 