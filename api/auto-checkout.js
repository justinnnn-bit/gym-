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
        console.log('Running auto-checkout for members checked in 4+ hours...');

        // Calculate 4 hours ago
        const fourHoursAgo = new Date();
        fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);

        // Get today's date for filtering
        const today = new Date().toISOString().split('T')[0];

        // Find all check-ins from today that are older than 4 hours
        const { data: oldCheckIns, error: fetchError } = await supabase
            .from('attendance')
            .select('member_id, check_time')
            .eq('action', 'checkin')
            .gte('check_time', `${today}T00:00:00`)
            .lte('check_time', fourHoursAgo.toISOString());

        if (fetchError) {
            console.error('Error fetching check-ins:', fetchError);
            return res.status(500).json({ error: 'Failed to fetch check-ins' });
        }

        if (!oldCheckIns || oldCheckIns.length === 0) {
            console.log('No members need auto-checkout');
            return res.status(200).json({ 
                success: true, 
                message: 'No members need auto-checkout',
                checkedOut: 0 
            });
        }

        console.log(`Found ${oldCheckIns.length} check-ins older than 4 hours`);

        // For each old check-in, check if they already checked out
        const membersToCheckout = [];
        
        for (const checkIn of oldCheckIns) {
            // Check if this member already has a checkout record today
            const { data: existingCheckout } = await supabase
                .from('attendance')
                .select('id')
                .eq('member_id', checkIn.member_id)
                .eq('action', 'checkout')
                .gte('check_time', checkIn.check_time)
                .single();

            // If no checkout exists, add to list
            if (!existingCheckout) {
                membersToCheckout.push({
                    member_id: checkIn.member_id,
                    action: 'checkout',
                    check_time: new Date().toISOString()
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

        console.log(`Auto-checking out ${membersToCheckout.length} members`);

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
            message: `Auto-checked out ${membersToCheckout.length} members`,
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
