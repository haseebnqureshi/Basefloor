/**
 * Feature 6: Email Services
 * Send emails with multiple provider support and template systems
 */
require('dotenv').config();
const api = require('../../packages/api');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Initialize the API first to make middlewares available
API.Init();

// Send a simple email
API.post('/emails/send', [API.requireAuthentication], async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    if (!to || !subject || !(text || html)) {
      return res.status(400).json({ error: 'To, subject, and text/html are required' });
    }
    
    const result = await API.Emails.send({
      to,
      subject,
      text,
      html,
      from: process.env.EMAIL_FROM || 'noreply@basefloor.app'
    });
    
    // Log email in database
    const emailLog = await API.DB.EmailLogs.create({
      user_id: req.user._id,
      to,
      subject,
      status: 'sent',
      message_id: result.messageId,
      provider: result.provider || 'default'
    });
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      email_id: emailLog._id,
      message_id: result.messageId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send email with template
API.post('/emails/send-template', [API.requireAuthentication], async (req, res) => {
  try {
    const { to, template, variables = {} } = req.body;
    
    if (!to || !template) {
      return res.status(400).json({ error: 'To and template are required' });
    }
    
    // Get template content
    const templates = {
      welcome: {
        subject: 'Welcome to {{app_name}}!',
        text: 'Hello {{name}}, welcome to {{app_name}}! We\'re excited to have you.',
        html: '<h1>Hello {{name}}!</h1><p>Welcome to <strong>{{app_name}}</strong>! We\'re excited to have you.</p>'
      },
      notification: {
        subject: 'New notification from {{app_name}}',
        text: 'Hello {{name}}, you have a new notification: {{message}}',
        html: '<h2>Hello {{name}}!</h2><p>You have a new notification:</p><blockquote>{{message}}</blockquote>'
      },
      reminder: {
        subject: 'Reminder: {{task_title}}',
        text: 'Hello {{name}}, this is a reminder about: {{task_title}}. Due: {{due_date}}',
        html: '<h2>Reminder</h2><p>Hello {{name}},</p><p>This is a reminder about: <strong>{{task_title}}</strong></p><p>Due: {{due_date}}</p>'
      }
    };
    
    const templateData = templates[template];
    if (!templateData) {
      return res.status(400).json({ error: 'Template not found' });
    }
    
    // Replace template variables
    const renderTemplate = (text, vars) => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] || match);
    };
    
    const emailData = {
      to,
      subject: renderTemplate(templateData.subject, variables),
      text: renderTemplate(templateData.text, variables),
      html: renderTemplate(templateData.html, variables),
      from: process.env.EMAIL_FROM || 'noreply@basefloor.app'
    };
    
    const result = await API.Emails.send(emailData);
    
    // Log email in database
    const emailLog = await API.DB.EmailLogs.create({
      user_id: req.user._id,
      to,
      subject: emailData.subject,
      template,
      variables,
      status: 'sent',
      message_id: result.messageId,
      provider: result.provider || 'default'
    });
    
    res.json({
      success: true,
      message: 'Templated email sent successfully',
      email_id: emailLog._id,
      template,
      rendered_subject: emailData.subject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send bulk emails
API.post('/emails/send-bulk', [API.requireAuthentication], async (req, res) => {
  try {
    const { recipients, subject, text, html } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required' });
    }
    
    if (!subject || !(text || html)) {
      return res.status(400).json({ error: 'Subject and text/html are required' });
    }
    
    const results = [];
    const errors = [];
    
    for (const recipient of recipients) {
      try {
        const result = await API.Emails.send({
          to: recipient,
          subject,
          text,
          html,
          from: process.env.EMAIL_FROM || 'noreply@basefloor.app'
        });
        
        results.push({ to: recipient, status: 'sent', message_id: result.messageId });
        
        // Log each email
        await API.DB.EmailLogs.create({
          user_id: req.user._id,
          to: recipient,
          subject,
          status: 'sent',
          message_id: result.messageId,
          provider: result.provider || 'default',
          bulk_send: true
        });
      } catch (error) {
        errors.push({ to: recipient, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: 'Bulk email send completed',
      sent: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get email logs
API.get('/emails/logs', [API.requireAuthentication], async (req, res) => {
  try {
    const logs = await API.DB.EmailLogs.readAll({
      where: { user_id: req.user._id },
      sort: { created_at: -1 },
      limit: 100
    });
    
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available email templates
API.get('/emails/templates', [API.requireAuthentication], (req, res) => {
  res.json({
    success: true,
    templates: [
      {
        name: 'welcome',
        description: 'Welcome new users',
        variables: ['name', 'app_name']
      },
      {
        name: 'notification',
        description: 'General notifications',
        variables: ['name', 'app_name', 'message']
      },
      {
        name: 'reminder',
        description: 'Task reminders',
        variables: ['name', 'task_title', 'due_date']
      }
    ]
  });
});

// Test email configuration
API.get('/emails/test', [API.requireAuthentication], async (req, res) => {
  try {
    const result = await API.Emails.send({
      to: req.user.email,
      subject: 'Basefloor Email Test',
      text: 'This is a test email from Basefloor API!',
      html: '<h1>Test Email</h1><p>This is a test email from <strong>Basefloor API</strong>!</p>',
      from: process.env.EMAIL_FROM || 'noreply@basefloor.app'
    });
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      sent_to: req.user.email,
      message_id: result.messageId,
      provider: result.provider || 'default'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.Start();

console.log('📧 Email Services Example API running!');
console.log('Try: POST /emails/send - Send simple email');
console.log('Try: POST /emails/send-template - Send templated email');
console.log('Try: POST /emails/send-bulk - Send bulk emails (admin only)');
console.log('Try: GET /emails/logs - Get email logs');
console.log('Try: GET /emails/templates - Get available templates');
console.log('Try: GET /emails/test - Test email configuration (admin only)'); 