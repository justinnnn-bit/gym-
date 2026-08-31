// GitHub Action script to check for expiring memberships
// Uses Supabase REST API directly instead of the JS client

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const vercelApiUrl = process.env.VERCEL_API_URL || 'https://darkknightfitness.vercel.app';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function checkExpiringMemberships() {
  console.log('🔍 Checking for expiring memberships...');

  try {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split('T')[0];
    const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

    // Get members whose membership expires in 7 days using Supabase REST API
    const expiringResponse = await fetch(
      `${supabaseUrl}/rest/v1/members?active=eq.true&membership_expiry=gte.${todayStr}&membership_expiry=lte.${sevenDaysStr}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!expiringResponse.ok) {
      throw new Error(`Supabase API error: ${expiringResponse.status} ${expiringResponse.statusText}`);
    }

    const expiringMembers = await expiringResponse.json();

    console.log(`📧 Found ${expiringMembers?.length || 0} memberships expiring soon`);

    // Send expiring soon emails
    for (const member of expiringMembers || []) {
      const daysRemaining = Math.ceil(
        (new Date(member.membership_expiry) - today) / (1000 * 60 * 60 * 24)
      );

      console.log(`Sending expiring email to ${member.name} (${daysRemaining} days remaining)`);

      await sendEmail({
        to: member.email,
        subject: `⏰ Your Membership Expires in ${daysRemaining} Days`,
        emailType: 'expiring-soon',
        memberName: member.name,
        data: {
          expiryDate: member.membership_expiry,
          daysRemaining: daysRemaining
        }
      });
    }

    // Get members whose membership expired yesterday or today
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const expiredResponse = await fetch(
      `${supabaseUrl}/rest/v1/members?active=eq.true&membership_expiry=gte.${yesterdayStr}&membership_expiry=lt.${todayStr}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!expiredResponse.ok) {
      throw new Error(`Supabase API error: ${expiredResponse.status} ${expiredResponse.statusText}`);
    }

    const expiredMembers = await expiredResponse.json();

    console.log(`🚨 Found ${expiredMembers?.length || 0} expired memberships`);

    // Send expired emails and mark members as inactive
    for (const member of expiredMembers || []) {
      console.log(`Sending expired email to ${member.name}`);

      await sendEmail({
        to: member.email,
        subject: '🚨 Your Membership Has Expired',
        emailType: 'expired',
        memberName: member.name,
        data: {
          expiryDate: member.membership_expiry
        }
      });

      // Mark member as inactive
      await fetch(
        `${supabaseUrl}/rest/v1/members?id=eq.${member.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ active: false })
        }
      );

      console.log(`Marked ${member.name} as inactive`);
    }

    console.log('✅ Email check completed successfully');

  } catch (error) {
    console.error('❌ Error checking memberships:', error.message);
    process.exit(1);
  }
}

async function sendEmail(emailData) {
  try {
    const response = await fetch(`${vercelApiUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('Failed to send email:', result.error);
    } else {
      console.log('✅ Email sent successfully');
    }
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
}

// Run the check
checkExpiringMemberships();
