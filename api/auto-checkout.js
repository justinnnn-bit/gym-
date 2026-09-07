import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    // Only allow POST requests (for security)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Running midnight auto-checkout for members still checked in...');

        // Get yesterday's date (since we run at midnight, we check out yesterday's members)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];

        // Find all check-ins from yesterday
        const { data: yesterdayCheckIns, error: fetchError } = await supabase
            .from('attendance')
            .select('member_id, check_time')
            .eq('action', 'checkin')
            .gte('check_time', `${yesterdayDate}T00:00:00`)
            .lte('check_time', `${yesterdayDate}T23:59:59`);

        if (fetchError) {
            console.error('Error fetching check-ins:', fetchError);
            return res.status(500).json({ error: 'Failed to fetch check-ins' });
        }

        if (!yesterdayCheckIns || yesterdayCheckIns.length === 0) {
            console.log('No check-ins from yesterday');
            return res.status(200).json({ 
                success: true, 
                message: 'No check-ins from yesterday',
                checkedOut: 0 
            });
        }

        console.log(`Found ${yesterdayCheckIns.length} check-ins from yesterday`);

        // For each check-in, check if they already checked out
        const membersToCheckout = [];
        
        for (const checkIn of yesterdayCheckIns) {
            // Check if this member already has a checkout record from yesterday
            const { data: existingCheckout } = await supabase
                .from('attendance')
                .select('id')
                .eq('member_id', checkIn.member_id)
                .eq('action', 'checkout')
                .gte('check_time', checkIn.check_time)
                .lte('check_time', `${yesterdayDate}T23:59:59`)
                .single();

            // If no checkout exists, add to list (checkout at 11:59 PM yesterday)
            if (!existingCheckout) {
                membersToCheckout.push({
                    member_id: checkIn.member_id,
                    action: 'checkout',
                    check_time: `${yesterdayDate}T23:59:00` // 11:59 PM yesterday
                });
            }
        }

        if (membersToCheckout.length === 0) {
            console.log('All members already checked out');
            return res.status(200).json({ 
                success: true, 
                message: 'All members already checked out',
                checkedOut: 0 
            });
        }

        console.log(`Auto-checking out ${membersToCheckout.length} members at 11:59 PM`);

        // Insert auto-checkout records
        const { error: insertError } = await supabase
            .from('attendance')
            .insert(membersToCheckout);

        if (insertError) {
            console.error('Error inserting auto-checkouts:', insertError);
            return res.status(500).json({ error: 'Failed to auto-checkout members' });
        }

        console.log(`Successfully auto-checked out ${membersToCheckout.length} members`);

        return res.status(200).json({
            success: true,
            message: `Auto-checked out ${membersToCheckout.length} members at midnight`,
            checkedOut: membersToCheckout.length,
            members: membersToCheckout.map(m => m.member_id)
        });

    } catch (error) {
        console.error('Auto-checkout error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
