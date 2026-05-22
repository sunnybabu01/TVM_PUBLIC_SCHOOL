const nodemailer = require('nodemailer');

let transporter;

// Create SMTP transporter if user/pass is configured, otherwise fallback to mock terminal logging
const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

if (isSmtpConfigured) {
  const port = parseInt(process.env.SMTP_PORT) || 2525;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: port,
    secure: port === 465, // SSL/TLS secure connection for 465, false for others (like STARTTLS on 587)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // Bypasses unauthorized local environments certificate check
    }
  });
  console.log('\x1b[32m[Email Service]\x1b[0m SMTP Mailer configured successfully.');
} else {
  // Mock transporter
  transporter = {
    sendMail: async (mailOptions) => {
      const divider = '='.repeat(60);
      console.log(`
\x1b[35m${divider}\x1b[0m
\x1b[36m[CONSOLE EMAIL FALLBACK - SMTP CREDENTIALS NOT CONFIGURED]\x1b[0m
\x1b[33mFrom:\x1b[0m ${mailOptions.from}
\x1b[33mTo:\x1b[0m ${mailOptions.to}
\x1b[33mSubject:\x1b[0m ${mailOptions.subject}
\x1b[33mBody:\x1b[0m 
------------------------------------------------------------
${mailOptions.text || mailOptions.html.replace(/<[^>]*>/g, '')}
------------------------------------------------------------
\x1b[35m${divider}\x1b[0m
      `);
      return { messageId: 'mock-id-123456789' };
    }
  };
  console.log('\x1b[33m[Email Service]\x1b[0m Running in Console Mailer Mode (OTPs will print to terminal).');
}

const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"TVM Public School" <noreply@tvmpublicschool.com>',
    to,
    subject,
    text,
    html
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('\x1b[31m[Email Send Error]\x1b[0m Could not send email:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };
