# YojnaMitra - Complete Setup Guide

This guide will help you set up YojnaMitra from scratch in under 30 minutes.

## 📋 Prerequisites

- Node.js v18+ installed
- A Supabase account (free tier works)
- Git (optional)

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose a name: `yojnamitra`
   - Set a strong database password (save it!)
   - Select region closest to India (Singapore recommended)
   - Click "Create new project"
   - Wait 2-3 minutes for setup to complete

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy the **Project URL**
   - Copy the **anon public** key

3. **Update Environment Variables**
   - Open `.env.local`
   - Replace with your actual values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 3: Set Up Database

1. **Open Supabase SQL Editor**
   - In your Supabase dashboard, go to SQL Editor
   - Click "New Query"

2. **Run Database Setup**
   - Copy the entire contents of `database_setup.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for all statements to execute (should take 5-10 seconds)

3. **Verify Setup**
   - Run this query to check tables were created:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

   - You should see: `user_profiles`, `schemes`, `admins`, `user_saved_schemes`, `scheme_checks`

### Step 4: Create Admin User

1. **Sign Up via the App**
   - Start the dev server: `npm run dev`
   - Open http://localhost:5173
   - Click "Sign Up"
   - Create an account with your email

2. **Make Yourself Admin**
   - Go back to Supabase SQL Editor
   - Find your user ID:

   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   ```

   - Copy your user ID
   - Make yourself admin:

   ```sql
   INSERT INTO admins (user_id, role)
   VALUES ('paste-your-user-id-here', 'super_admin');
   ```

3. **Verify Admin Access**
   - Refresh your app
   - You should now see "Admin Panel" in the navbar

### Step 5: Add Sample Schemes

You can either:

**Option A: Add via Admin Panel**

- Login to your app
- Go to Admin Panel → Add New Scheme
- Fill in the form and submit

**Option B: Import Sample Data**

- The `database_setup.sql` already includes one sample scheme (PM-KISAN)
- You can add more by running INSERT statements in SQL Editor

## 🎯 Running the Application

### Development Mode

```bash
npm run dev
```

Open http://localhost:5173

### Production Build

```bash
npm run build
npm run preview
```

## 📱 Testing the Application

### As a User:

1. **Sign Up**
   - Go to http://localhost:5173
   - Click "Sign Up"
   - Create an account

2. **Complete Profile**
   - Fill in your details (age, state, category, etc.)
   - Submit

3. **Check Eligibility**
   - Click "Check Eligibility" from dashboard
   - View matched schemes

4. **Save Schemes**
   - Click "Save Scheme" on any scheme card
   - Go to "Saved Schemes" to track them

### As an Admin:

1. **Access Admin Panel**
   - Login with your admin account
   - Click "Admin Panel" in navbar

2. **View Dashboard**
   - See stats (total schemes, users, etc.)

3. **Manage Schemes**
   - Go to "Scheme Management" tab
   - Activate/Deactivate schemes

4. **Add New Scheme**
   - Go to "Add New Scheme" tab
   - Fill in all details
   - Submit

## 🌐 Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

Your app will be live in 2-3 minutes!

## 🔧 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:** Make sure `.env.local` exists and has correct values:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Issue: "Cannot read properties of null"

**Solution:**

- Check if database tables are created
- Verify RLS policies are enabled
- Make sure you're logged in

### Issue: "No schemes found"

**Solution:**

- Add schemes via Admin Panel
- Or run the sample INSERT query from `database_setup.sql`
- Make sure schemes have `is_active = true`

### Issue: "Admin Panel not showing"

**Solution:**

- Verify you're in the `admins` table:

```sql
SELECT * FROM admins WHERE user_id = 'your-user-id';
```

- If not, add yourself using the INSERT query above
- Logout and login again

### Issue: "Scheme matching not working"

**Solution:**

- Complete your profile with all required fields
- Make sure schemes have proper `eligibility_criteria` JSON
- Check browser console for errors

## 📊 Database Schema Reference

### user_profiles

- Stores user information
- Linked to `auth.users` via `id`

### schemes

- Stores all government schemes
- `eligibility_criteria` is JSONB with matching rules
- `applicable_states` is array of states

### admins

- Stores admin user IDs
- Check this table for admin access

### user_saved_schemes

- Stores user's saved schemes
- Has status: interested, applied, received

### scheme_checks

- Analytics table
- Tracks eligibility checks

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    teal: '#0F766E',  // Change this
    // ...
  }
}
```

### Change Language Default

Edit `src/contexts/LanguageContext.jsx`:

```javascript
const [language, setLanguageState] = useState("en"); // Change to 'en' for English default
```

### Add More States/Categories

Edit `src/utils/constants.js`:

```javascript
export const INDIAN_STATES = [
  // Add more states
];
```

## 📝 Adding More Schemes

### Via Admin Panel (Recommended)

1. Login as admin
2. Go to Admin Panel → Add New Scheme
3. Fill all fields
4. Submit

### Via SQL (Bulk Import)

```sql
INSERT INTO schemes (
  scheme_name,
  scheme_name_hi,
  description,
  description_hi,
  benefit_amount,
  eligibility_criteria,
  documents_required,
  ministry,
  scheme_type,
  applicable_states
) VALUES (
  'Scheme Name',
  'योजना का नाम',
  'Description',
  'विवरण',
  '₹10,000',
  '{
    "age_min": 18,
    "age_max": 60,
    "categories": ["General", "OBC"],
    "states": ["All States"]
  }'::jsonb,
  ARRAY['Aadhaar', 'Bank Account'],
  'Ministry Name',
  'central',
  ARRAY['All States']
);
```

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use service_role key only in backend** - Never in frontend
3. **Keep RLS enabled** - Don't disable Row Level Security
4. **Rotate keys regularly** - Change Supabase keys periodically
5. **Validate admin access** - Always check `admins` table

## 📈 Performance Tips

1. **Use indexes** - Already created in `database_setup.sql`
2. **Limit results** - Use pagination for large datasets
3. **Cache schemes** - Consider caching active schemes
4. **Optimize images** - Use WebP format for scheme images
5. **Enable CDN** - Vercel provides this automatically

## 🎓 Next Steps

1. **Add More Schemes** - Import 70+ government schemes
2. **Customize Design** - Match your brand colors
3. **Add Analytics** - Track user engagement
4. **Email Notifications** - Notify users of new schemes
5. **Mobile App** - Build React Native version

## 📞 Support

- **Documentation:** Check README.md
- **Database Issues:** Review `database_setup.sql`
- **Code Issues:** Check browser console
- **Supabase Issues:** Check Supabase logs

## ✅ Checklist

- [ ] Node.js installed
- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Database tables created
- [ ] RLS policies enabled
- [ ] Admin user created
- [ ] Sample scheme added
- [ ] App running locally
- [ ] User signup tested
- [ ] Scheme matching tested
- [ ] Admin panel accessible
- [ ] Ready for deployment

---

**Congratulations! 🎉 YojnaMitra is now ready to help citizens discover government schemes!**
