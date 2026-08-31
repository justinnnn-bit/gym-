# Database Update Instructions

## Add membership_expiry Column

You need to add the `membership_expiry` column to your members table in Supabase.

### Steps:

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the SQL**
   - Copy the contents of `add-membership-expiry-column.sql`
   - Paste it into the SQL editor
   - Click "Run" button

4. **Verify**
   - Go to "Table Editor" in the left sidebar
   - Click on the "members" table
   - You should see a new column called `membership_expiry` (type: date)

### What this SQL does:

1. Adds a `membership_expiry` column (DATE type) to the members table
2. Sets default expiry dates for existing members:
   - If they have a join_date: expiry = join_date + 1 year
   - If no join_date: expiry = today + 1 year

### After running:

- Refresh your website
- The Members page should now work without errors
- You can update expiry dates for any member

---

**SQL File:** `add-membership-expiry-column.sql`
