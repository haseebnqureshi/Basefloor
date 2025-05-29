# Email Services

Basefloor provides built-in email functionality with support for multiple providers and template systems.

## Configuration

Configure email services in your `basefloor.config.js`:

### Postmark

```javascript
module.exports = (API) => ({
  api: {
    emails: {
      enabled: true,
      provider: '@postmark/emails',
      templates: {
        welcome: {
          subject: 'Welcome to {{appName}}!',
          html: '<h1>Welcome {{name}}!</h1><p>Thanks for joining {{appName}}.</p>',
          text: 'Welcome {{name}}! Thanks for joining {{appName}}.'
        }
      }
    }
  },
  providers: {
    '@postmark/emails': {
      serverToken: process.env.POSTMARK_SERVER_TOKEN,
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
    }
  }
})
```

### SendGrid

```javascript
module.exports = (API) => ({
  api: {
    emails: {
      enabled: true,
      provider: '@sendgrid/emails',
      templates: {
        welcome: {
          subject: 'Welcome to {{appName}}!',
          html: '<h1>Welcome {{name}}!</h1><p>Thanks for joining {{appName}}.</p>',
          text: 'Welcome {{name}}! Thanks for joining {{appName}}.'
        }
      }
    }
  },
  providers: {
    '@sendgrid/emails': {
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
    }
  }
})
```

### Mailgun

```javascript
module.exports = (API) => ({
  api: {
    emails: {
      enabled: true,
      provider: '@mailgun/emails',
      templates: {
        welcome: {
          subject: 'Welcome to {{appName}}!',
          html: '<h1>Welcome {{name}}!</h1><p>Thanks for joining {{appName}}.</p>',
          text: 'Welcome {{name}}! Thanks for joining {{appName}}.'
        }
      }
    }
  },
  providers: {
    '@mailgun/emails': {
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
    }
  }
})
```

### Multiple Providers

```javascript
module.exports = (API) => ({
  api: {
    emails: {
      enabled: true,
      providers: {
        'Transactional': '@postmark/emails',
        'Marketing': '@sendgrid/emails'
      },
      templates: {
        welcome: {
          subject: 'Welcome to {{appName}}!',
          html: '<h1>Welcome {{name}}!</h1><p>Thanks for joining {{appName}}.</p>',
          text: 'Welcome {{name}}! Thanks for joining {{appName}}.'
        }
      }
    }
  },
  providers: {
    '@postmark/emails': {
      serverToken: process.env.POSTMARK_SERVER_TOKEN,
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
    },
    '@sendgrid/emails': {
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
    }
  }
})
```

## Usage

### Simple Email

```javascript
// Send a simple email
await API.Emails.send({
  to: 'user@example.com',
  subject: 'Welcome to our platform',
  text: 'Thank you for signing up!',
  html: '<h1>Thank you for signing up!</h1>'
});
```

### Template Email

```javascript
// Send using a local template (defined in config)
await API.Emails.sendTemplate({
  to: 'user@example.com',
  template: 'welcome',
  variables: {
    name: 'John Doe',
    appName: 'My Awesome App'
  }
});
```

### Bulk Email

```javascript
// Send to multiple recipients
await API.Emails.sendBulk({
  recipients: [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' }
  ],
  subject: 'Newsletter',
  template: 'newsletter',
  variables: {
    date: new Date().toLocaleDateString()
  }
});
```

## Built-in Email Types

Basefloor automatically sends emails for:

### User Registration

```javascript
// Automatically sent when a user registers
{
  template: 'emailVerification',
  variables: {
    verificationUrl: 'https://yourapp.com/verify?token=...'
  }
}
```

### Password Reset

```javascript
// Automatically sent when user requests password reset
{
  template: 'passwordReset',
  variables: {
    resetUrl: 'https://yourapp.com/reset?token=...'
  }
}
```

## Environment Variables

Set up your email provider credentials in your `.env` file:

```env
# Postmark
POSTMARK_SERVER_TOKEN=your-postmark-token

# SendGrid
SENDGRID_API_KEY=your-sendgrid-key

# Mailgun
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-domain.com

# Common
EMAIL_FROM=noreply@yourdomain.com
APP_NAME=Your App Name
APP_AUTHOR=Your Company
APP_AUTHOR_EMAIL=support@yourdomain.com
```

## Examples

### Custom Email Handler

```javascript
// Custom email for order confirmation
app.post('/orders', async (req, res) => {
  const order = await API.Orders.create(req.body);
  
  // Send confirmation email using template
  await API.Emails.sendTemplate({
    to: order.customer_email,
    template: 'orderConfirmation',
    variables: {
      orderNumber: order._id,
      items: order.items,
      total: order.total
    }
  });
  
  res.json(order);
});
```

### Email Queue

```javascript
// Queue emails for background processing
await API.Emails.queue({
  to: 'user@example.com',
  subject: 'Daily Report',
  template: 'dailyReport',
  variables: reportData,
  sendAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Send tomorrow
});
```

### Multiple Provider Usage

```javascript
// Send transactional email via Postmark
await API.Emails.Transactional.send({
  to: 'user@example.com',
  subject: 'Password Reset',
  html: '<p>Click here to reset your password...</p>'
});

// Send marketing email via SendGrid
await API.Emails.Marketing.sendTemplate({
  to: 'subscriber@example.com',
  template: 'newsletter',
  variables: {
    month: 'January',
    content: 'This month in our app...'
  }
});
```

## Error Handling

Email operations include proper error handling:

```javascript
try {
  await API.Emails.send(emailData);
  console.log('Email sent successfully');
} catch (error) {
  console.error('Email failed:', error.message);
  // Handle email failure (retry, log, notify admin, etc.)
}
``` 