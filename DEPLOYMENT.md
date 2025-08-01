# 🚀 Vercel Deployment Guide with Neon PostgreSQL

## 📋 Prerequisites
- Vercel account
- GitHub repository (already set up)
- Neon account for PostgreSQL database

## 🗄️ Step 1: Set up Neon PostgreSQL Database

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Create a new project

### 1.2 Get Database Connection String
1. In your Neon dashboard, go to **Connection Details**
2. Copy the **Connection String** (it looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
3. Save this - you'll need it for Vercel

## 🚀 Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository: `aaaacreditation/casestudies`

### 2.2 Configure Environment Variables
In Vercel project settings, add these environment variables:

```bash
# Required
DATABASE_URL=your-neon-connection-string-here

# Optional (for authentication if needed later)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```

### 2.3 Deploy
1. Click **Deploy**
2. Vercel will automatically:
   - Install dependencies
   - Generate Prisma client
   - Build the Next.js app
   - Deploy to production

## 🗄️ Step 3: Set up Database Schema

### Option A: Automatic (Recommended)
The app will automatically create tables when first accessed.

### Option B: Manual Setup
If you want to set up the database manually:

1. In Vercel dashboard, go to **Functions** tab
2. Find a function log or use Vercel CLI:
   ```bash
   npx vercel env pull .env.local
   npm run db:push
   npm run db:seed
   ```

## 🔧 Build Configuration

The project is configured with:
- **Build Command**: `prisma generate && next build`
- **Install Command**: `npm install` (with postinstall Prisma generation)
- **Output Directory**: `.next`

## 📝 Environment Variables Explanation

### Required for Production:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `NEXTAUTH_URL`: Your Vercel app URL (https://your-app.vercel.app)

### Optional:
- `NEXTAUTH_SECRET`: Random string for session encryption
- `DIRECT_URL`: Usually same as DATABASE_URL for Neon

## 🐛 Troubleshooting

### Build Fails with "DATABASE_URL not found"
- Make sure you added DATABASE_URL in Vercel environment variables
- Redeploy after adding environment variables

### Database Connection Issues
- Verify your Neon connection string is correct
- Make sure the database is not paused (Neon auto-pauses free tier)
- Check Neon dashboard for any issues

### Prisma Issues
- The build process automatically generates Prisma client
- Database schema is automatically pushed on first deployment
- Seed data is added automatically

## 🎯 Expected Result

After successful deployment:
1. ✅ App builds successfully
2. ✅ Database tables are created
3. ✅ Sample data is seeded
4. ✅ App is accessible at your Vercel URL
5. ✅ All features work (testimonial carousel, case studies, etc.)

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables are set
3. Ensure Neon database is active
4. Check this repository's GitHub issues

Your AAA Case Studies platform should now be live! 🎉