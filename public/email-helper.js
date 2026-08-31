// Email Helper Functions
// These functions call the Vercel API to send emails

const EMAIL_API_URL = '/api/send-email'; // Vercel serverless function

// Send welcome email when account is approved
async function sendWelcomeEmail(memberData) {
    try {
        const response = await fetch(EMAIL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: memberData.email,
                subject: '🎉 Welcome to DarkKnight Fitness!',
                emailType: 'welcome',
                memberName: memberData.name,
                data: {
                    email: memberData.email,
                    membershipType: memberData.membership_type,
                    expiryDate: memberData.membership_expiry
                }
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Welcome email sent to:', memberData.email);
        } else {
            console.error('Failed to send welcome email:', result.error);
        }
        
        return result;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
}

// Manual trigger for expiring soon email (for admin)
async function sendExpiringEmail(memberData, daysRemaining) {
    try {
        const response = await fetch(EMAIL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: memberData.email,
                subject: `⏰ Your Membership Expires in ${daysRemaining} Days`,
                emailType: 'expiring-soon',
                memberName: memberData.name,
                data: {
                    expiryDate: memberData.membership_expiry,
                    daysRemaining: daysRemaining
                }
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending expiring email:', error);
        return { success: false, error: error.message };
    }
}

// Export functions
window.emailHelper = {
    sendWelcomeEmail,
    sendExpiringEmail
};
