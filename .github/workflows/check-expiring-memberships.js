// GitHub Action script to check for expiring memberships
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const vercelApiUrl = process.env.VERCEL_API_URL || 'https://darkknightfitness.vercel.app';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExpiringMemberships() {
  console.log('🔍 Checking for expiring memberships...');

  try {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // Get members whose membership expires in 7 days
    const { data: expiringMembers, error: expiringError } = await supabase
      .from('members')
      .select('*')
      .eq('active', true)
      .gte('membership_expiry', today.toISOString().split('T')[0])
      .lte('membership_expiry', sevenDaysFromNow.toISOString().split('T')[0]);

    if (expiringError) throw expiringError;

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

    const { data: expiredMembers, error: expiredError } = await supabase
      .from('members')
      .select('*')
      .eq('active', true)
      .gte('membership_expiry', yesterday.toISOString().split('T')[0])
      .lt('membership_expiry', today.toISOString().split('T')[0]);

    if (expiredError) throw expiredError;

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
      await supabase
        .from('members')
        .update({ active: false })
        .eq('id', member.id);

      console.log(`Marked ${member.name} as inactive`);
    }

    console.log('✅ Email check completed successfully');

  } catch (error) {
    console.error('❌ Error checking memberships:', error);
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
    console.error('Error sending email:', error);
  }
}

// Run the check
checkExpiringMemberships();
