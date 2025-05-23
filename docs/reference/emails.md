# Email Notifications

MinAPI provides built-in email functionality with support for multiple providers and template systems.

## Configuration

Configure email services in your `minapi.config.js`:

### Postmark

```javascript
{
  email: {
    provider: 'postmark',
    from: 'noreply@yourdomain.com',
    providers: {
      postmark: {
        serverToken: process.env.POSTMARK_TOKEN
      }
    },
    templates: {
      welcome: 'template-id',
      passwordReset: 'template-id',
      emailVerification: 'template-id'
    }
  }
}
```

### SendGrid

```javascript
{
  email: {
    provider: 'sendgrid',
    from: 'noreply@yourdomain.com',
    providers: {
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY
      }
    }
  }
}
```

### Mailgun

```javascript
{
  email: {
    provider: 'mailgun',
    from: 'noreply@yourdomain.com',
    providers: {
      mailgun: {
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
      }
    }
  }
}
```

## Usage

### Simple Email

```javascript
// Send a simple email
await API.Email.send({
  to: 'user@example.com',
  subject: 'Welcome to our platform',
  text: 'Thank you for signing up!',
  html: '<h1>Thank you for signing up!</h1>'
});
```

### Template Email

```javascript
// Send using a template
await API.Email.sendTemplate({
  to: 'user@example.com',
  template: 'welcome',
  variables: {
    name: 'John Doe',
    loginUrl: 'https://yourapp.com/login'
  }
});
```

### Bulk Email

```javascript
// Send to multiple recipients
await API.Email.sendBulk({
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

MinAPI automatically sends emails for:

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

Set up your email provider credentials:

```env
# Postmark
POSTMARK_TOKEN=your-postmark-token

# SendGrid
SENDGRID_API_KEY=your-sendgrid-key

# Mailgun
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-domain.com
```

## Examples

### Custom Email Handler

```javascript
// Custom email for order confirmation
app.post('/orders', async (req, res) => {
  const order = await API.Orders.create(req.body);
  
  // Send confirmation email
  await API.Email.send({
    to: order.customer_email,
    subject: `Order Confirmation #${order._id}`,
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
await API.Email.queue({
  to: 'user@example.com',
  subject: 'Daily Report',
  template: 'dailyReport',
  variables: reportData,
  sendAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Send tomorrow
});
```

## Error Handling

Email operations include proper error handling:

```javascript
try {
  await API.Email.send(emailData);
  console.log('Email sent successfully');
} catch (error) {
  console.error('Email failed:', error.message);
  // Handle email failure (retry, log, notify admin, etc.)
}
``` 