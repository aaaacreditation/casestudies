import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get auth header for basic security
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.NEXTAUTH_SECRET}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create admin user first
    console.log('Creating admin user...')
    const adminEmail = 'admin@casestudies.com'
    const adminPassword = 'admin123'
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    let adminCreated = false
    if (!existingAdmin) {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 12)

      // Create admin user
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        }
      })
      console.log('Admin user created successfully!')
      adminCreated = true
    } else {
      console.log('Admin user already exists')
    }

    // Check if companies already exist
    const existingCompanies = await prisma.company.findMany()
    if (existingCompanies.length > 0) {
      return NextResponse.json({ 
        message: 'Database already seeded',
        adminCreated,
        credentials: {
          email: adminEmail,
          password: adminPassword,
          loginUrl: '/admin/login'
        }
      })
    }

    // Create companies
    const atlassian = await prisma.company.create({
      data: {
        name: 'Atlassian',
        logo: '/logos/atlassian.png',
        website: 'https://atlassian.com',
        industry: 'Technology',
        location: 'Sydney, Australia',
        size: '12,000+',
        description: 'Software development and collaboration tools company'
      }
    })

    const breville = await prisma.company.create({
      data: {
        name: 'Breville',
        logo: '/logos/breville.png',
        website: 'https://breville.com',
        industry: 'Consumer goods',
        location: 'Sydney, Australia',
        size: '1,000+',
        description: 'Kitchen appliances and coffee machines manufacturer'
      }
    })

    const canva = await prisma.company.create({
      data: {
        name: 'Canva',
        logo: '/logos/canva.png',
        website: 'https://canva.com',
        industry: 'Technology',
        location: 'Sydney, Australia',
        size: '4,500+',
        description: 'Online graphic design platform'
      }
    })

    // Create case studies (abbreviated for space)
    await prisma.caseStudy.create({
      data: {
        title: "Atlassian's AI edge for customer-led growth",
        subtitle: "How Atlassian leveraged customer insights to drive product decisions",
        slug: 'atlassian-ai-customer-growth',
        content: `
          <h2>The Challenge</h2>
          <p>Atlassian needed to scale their customer research process across multiple product teams while maintaining high-quality insights that could drive product decisions.</p>
          
          <h2>The Solution</h2>
          <p>By implementing a centralized customer insights platform, Atlassian was able to democratize access to customer feedback and streamline their research workflow.</p>
          
          <h2>The Results</h2>
          <ul>
            <li>86% more customer insights shared across teams</li>
            <li>48+ hours saved per week on research analysis</li>
            <li>Improved product decision-making speed</li>
          </ul>
        `,
        excerpt: 'Whenever someone comes and brings the customer insight, that really wins the discussion—because it really reflects what our customers think and how they act.',
        featuredImage: '/case-studies/atlassian-hero.jpg',
        tags: ['Technology', 'AI', 'Growth', 'Product Management'],
        metrics: {
          'insights_shared': '86% more customer insights shared',
          'time_saved': '48+ hours saved per week',
          'decision_speed': 'Faster product decisions'
        },
        published: true,
        featured: true,
        readTime: 5,
        companyId: atlassian.id
      }
    })

    return NextResponse.json({ 
      message: 'Database seeded successfully!',
      adminCreated,
      credentials: {
        email: adminEmail,
        password: adminPassword,
        loginUrl: '/admin/login'
      }
    })

  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}


