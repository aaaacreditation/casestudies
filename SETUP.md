# Case Studies System Setup Guide

This is a modern case studies system built with Next.js, Tailwind CSS, Prisma, and PostgreSQL, inspired by Dovetail's customer page design.

## Features

- 🎨 Modern, elegant design with your brand color (#0a4373)
- 📱 Fully responsive layout
- 🔍 Advanced filtering and search functionality
- 🎠 Interactive testimonial carousel
- 📊 Statistics section with animations
- 💬 Testimonial modal with company details
- 🗄️ PostgreSQL database with Prisma ORM
- ⚡ Built with Next.js 15 and React 19

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Headless UI

## Getting Started

### 1. Database Setup

First, you'll need to set up a PostgreSQL database. You have several options:

#### Option A: Local PostgreSQL
Install PostgreSQL locally and create a database.

#### Option B: Supabase (Recommended)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Get your database URL from Settings > Database

#### Option C: Railway
1. Go to [Railway](https://railway.app)
2. Create a new PostgreSQL database
3. Get your database URL

### 2. Environment Setup

Create a \`.env\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/casestudies"

# Replace with your actual database URL
\`\`\`

### 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 4. Database Migration

Generate Prisma client and push the schema:

\`\`\`bash
npm run db:generate
npm run db:push
\`\`\`

### 5. Seed Sample Data

\`\`\`bash
npm run db:seed
\`\`\`

### 6. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your case studies system!

## Project Structure

\`\`\`
casestudies/
├── app/
│   ├── globals.css          # Global styles with brand colors
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main case studies page
├── components/
│   ├── CaseStudyCard.tsx    # Individual case study card
│   ├── CaseStudyFilters.tsx # Filtering component
│   ├── TestimonialCarousel.tsx # Testimonial carousel
│   ├── TestimonialModal.tsx # Testimonial detail modal
│   └── StatsSection.tsx     # Statistics display
├── lib/
│   └── prisma.ts           # Prisma client
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Sample data
├── types/
│   └── index.ts           # TypeScript types
└── public/
    ├── logos/             # Company logos
    ├── avatars/           # Profile pictures
    └── case-studies/      # Case study images
\`\`\`

## Customization

### Brand Colors
The system uses your brand color \`#0a4373\`. You can modify this in:
- \`app/globals.css\` (CSS variables)
- Component files (Tailwind classes)

### Adding Images
Place your images in the appropriate directories:
- Company logos: \`public/logos/\`
- Profile pictures: \`public/avatars/\`
- Case study images: \`public/case-studies/\`

### Database Schema
The system includes three main models:
- **Company**: Company information
- **CaseStudy**: Case study content and metadata
- **Testimonial**: Customer testimonials

## API Integration

To replace mock data with real API calls:

1. Create API routes in \`app/api/\`
2. Update the data fetching in \`app/page.tsx\`
3. Replace mock data with actual API calls

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your database URL to environment variables
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS
- Google Cloud

## Support

For questions or issues:
1. Check the console for any errors
2. Ensure your database connection is working
3. Verify all environment variables are set correctly

Happy coding! 🚀