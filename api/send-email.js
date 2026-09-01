// Vercel Serverless Function to send emails via Brevo (formerly Sendinblue)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, emailType, memberName, data } = req.body;

    // Validate required fields
    if (!to || !subject || !emailType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate email HTML based on type
    const emailHTML = generateEmailTemplate(emailType, memberName, data);

    // Send email via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'DarkKnight Fitness',
          email: process.env.FROM_EMAIL || 'noreply@darkknightfitness.com'
        },
        to: [{ email: to, name: memberName }],
        subject: subject,
        htmlContent: emailHTML
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Brevo API error:', result);
      return res.status(response.status).json({ 
        success: false, 
        error: result.message || 'Failed to send email' 
      });
    }

    // Log the email
    console.log('Email sent via Brevo:', result);

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: result.messageId,
      debug: {
        to: to,
        from: process.env.FROM_EMAIL || 'noreply@darkknightfitness.com',
        hasApiKey: !!process.env.BREVO_API_KEY
      }
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Email template generator
function generateEmailTemplate(emailType, memberName, data) {
  const baseStyle = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
      .content { padding: 40px 30px; color: #1e293b; }
      .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      .highlight { background: #f0f4ff; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
    </style>
  `;

  switch (emailType) {
    case 'welcome':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to DarkKnight Fitness!</h1>
            </div>
            <div class="content">
              <h2>Hi ${memberName}! 👋</h2>
              <p>Your account has been approved! We're excited to have you join our fitness community.</p>
              
              <div class="highlight">
                <strong>Your Account Details:</strong><br>
                Email: ${data.email}<br>
                Membership Type: ${data.membershipType}<br>
                ${data.expiryDate ? `Valid Until: ${new Date(data.expiryDate).toLocaleDateString()}` : ''}
              </div>

              <p>You can now:</p>
              <ul>
                <li>✅ Access your member dashboard</li>
                <li>✅ Scan QR codes at gym entrance/exit</li>
                <li>✅ Track your attendance history</li>
                <li>✅ Manage your profile</li>
              </ul>

              <center>
                <a href="${process.env.SITE_URL || 'https://darkknightfitness.vercel.app'}/member-dashboard.html" class="button">
                  Go to Your Dashboard
                </a>
              </center>

              <p style="margin-top: 30px;">See you at the gym! 💪</p>
            </div>
            <div class="footer">
              <p>DarkKnight Fitness | Stay Strong, Stay Fit</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'expiring-soon':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Membership Expiring Soon</h1>
            </div>
            <div class="content">
              <h2>Hi ${memberName}!</h2>
              <p>This is a friendly reminder that your membership is expiring soon.</p>
              
              <div class="highlight" style="border-left-color: #f59e0b; background: #fffbeb;">
                <strong>⚠️ Expiry Date:</strong> ${new Date(data.expiryDate).toLocaleDateString()}<br>
                <strong>Days Remaining:</strong> ${data.daysRemaining} days
              </div>

              <p>To continue enjoying your gym access without interruption, please renew your membership.</p>

              <center>
                <a href="${process.env.SITE_URL || 'https://darkknightfitness.vercel.app'}/member-dashboard.html" class="button">
                  Renew Membership
                </a>
              </center>

              <p style="margin-top: 30px;">Questions? Contact us anytime!</p>
            </div>
            <div class="footer">
              <p>DarkKnight Fitness | Stay Strong, Stay Fit</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'expired':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
              <h1>🚨 Membership Expired</h1>
            </div>
            <div class="content">
              <h2>Hi ${memberName}!</h2>
              <p>Your gym membership has expired as of ${new Date(data.expiryDate).toLocaleDateString()}.</p>
              
              <div class="highlight" style="border-left-color: #ef4444; background: #fef2f2;">
                <strong>Status:</strong> Expired<br>
                <strong>Expired On:</strong> ${new Date(data.expiryDate).toLocaleDateString()}
              </div>

              <p>We'd love to have you back! Renew your membership to regain access to:</p>
              <ul>
                <li>✅ All gym equipment and facilities</li>
                <li>✅ QR code attendance tracking</li>
                <li>✅ Member dashboard</li>
              </ul>

              <center>
                <a href="${process.env.SITE_URL || 'https://darkknightfitness.vercel.app'}" class="button">
                  Renew Now
                </a>
              </center>
            </div>
            <div class="footer">
              <p>DarkKnight Fitness | Stay Strong, Stay Fit</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyle}</head>
        <body>
          <div class="container">
            <div class="header">
              <h1>DarkKnight Fitness</h1>
            </div>
            <div class="content">
              <h2>Hi ${memberName}!</h2>
              <p>You have a notification from DarkKnight Fitness.</p>
            </div>
            <div class="footer">
              <p>DarkKnight Fitness | Stay Strong, Stay Fit</p>
            </div>
          </div>
        </body>
        </html>
      `;
  }
}
