import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
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

  const safetyCulture = await prisma.company.create({
    data: {
      name: 'SafetyCulture',
      logo: '/logos/safetyculture.png',
      website: 'https://safetyculture.com',
      industry: 'Technology',
      location: 'Sydney, Australia',
      size: '600+',
      description: 'Workplace safety and quality solutions'
    }
  })

  const zapier = await prisma.company.create({
    data: {
      name: 'Zapier',
      logo: '/logos/zapier.png',
      website: 'https://zapier.com',
      industry: 'Technology',
      location: 'San Francisco, USA',
      size: '1,000+',
      description: 'Automation platform that connects apps and services'
    }
  })

  // Create case studies
  const atlassianCaseStudy = await prisma.caseStudy.create({
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

  const brevilleCaseStudy = await prisma.caseStudy.create({
    data: {
      title: "How customer insights power Breville's product innovation",
      subtitle: "Breville combines everything into one single place for customer data analysis",
      slug: 'breville-product-innovation',
      content: `
        <h2>The Challenge</h2>
        <p>Breville was using multiple programs and platforms to gather and analyze customer data, leading to fragmented insights and inefficient workflows.</p>
        
        <h2>The Solution</h2>
        <p>By consolidating all customer data into a single platform, Breville streamlined their research process and improved insight quality.</p>
        
        <h2>The Results</h2>
        <ul>
          <li>94% increase in insight quality</li>
          <li>Unified 5 different platforms into 1</li>
          <li>Faster time-to-market for new products</li>
        </ul>
      `,
      excerpt: 'At Breville, we previously used multiple programs and platforms to gather and analyze customer data. Now we have everything in one single place.',
      featuredImage: '/case-studies/breville-hero.jpg',
      tags: ['Consumer goods', 'Innovation', 'Data Analysis', 'Efficiency'],
      metrics: {
        'quality_increase': '94% increase in insight quality',
        'platform_consolidation': 'Unified 5 platforms into 1',
        'efficiency': 'Faster product development'
      },
      published: true,
      featured: false,
      readTime: 4,
      companyId: breville.id
    }
  })

  const canvaCaseStudy = await prisma.caseStudy.create({
    data: {
      title: "Dovetail helps Canva empower the world to design",
      subtitle: "One customer insight at a time",
      slug: 'canva-empower-design',
      content: `
        <h2>The Challenge</h2>
        <p>Canva needed to make research analysis more approachable and fun for non-researchers while maintaining high-quality insights.</p>
        
        <h2>The Solution</h2>
        <p>By implementing an intuitive research platform, Canva democratized access to customer insights across their organization.</p>
        
        <h2>The Results</h2>
        <ul>
          <li>More approachable research for non-researchers</li>
          <li>Increased collaboration across teams</li>
          <li>Better product decisions based on customer insights</li>
        </ul>
      `,
      excerpt: 'Especially for non-researchers, our platform makes getting started with research analysis more approachable and even fun.',
      featuredImage: '/case-studies/canva-hero.jpg',
      tags: ['Technology', 'Design', 'Collaboration', 'User Research'],
      metrics: {
        'accessibility': 'More approachable research',
        'collaboration': 'Increased team collaboration',
        'decisions': 'Better product decisions'
      },
      published: true,
      featured: true,
      readTime: 6,
      companyId: canva.id
    }
  })

  // Create testimonials
  await prisma.testimonial.create({
    data: {
      quote: 'Whenever someone comes and brings the customer insight, that really wins the discussion—because it really reflects what our customers think and how they act.',
      author: 'Martin Jerkovic',
      position: 'Lead Product Designer',
      avatar: '/avatars/martin-jerkovic.jpg',
      featured: true,
      companyId: atlassian.id,
      caseStudyId: atlassianCaseStudy.id
    }
  })

  await prisma.testimonial.create({
    data: {
      quote: 'At Breville, we previously used multiple programs and platforms to gather and analyze customer data. Our platform has allowed us to combine everything into one single place.',
      author: 'Andrew Gregorace',
      position: 'Senior UX Designer',
      avatar: '/avatars/andrew-gregorace.jpg',
      featured: true,
      companyId: breville.id,
      caseStudyId: brevilleCaseStudy.id
    }
  })

  await prisma.testimonial.create({
    data: {
      quote: 'Especially for non-researchers, our platform makes getting started with research analysis more approachable and even fun.',
      author: 'Becky White',
      position: 'Head of Design Research',
      avatar: '/avatars/becky-white.jpg',
      featured: true,
      companyId: canva.id,
      caseStudyId: canvaCaseStudy.id
    }
  })

  await prisma.testimonial.create({
    data: {
      quote: 'Everything\'s in one place and the team only needs to remember one link. It\'s absolutely our tool end-to-end. I don\'t know what we\'d do without it, actually.',
      author: 'Jules Lipman',
      position: 'Product Designer',
      avatar: '/avatars/jules-lipman.jpg',
      featured: true,
      companyId: safetyCulture.id
    }
  })

  await prisma.testimonial.create({
    data: {
      quote: 'Our platform helps us simplify the process of pouring all our customer data and all our insights into one spot.',
      author: 'Roy Olende',
      position: 'Head of UX Research',
      avatar: '/avatars/roy-olende.jpg',
      featured: true,
      companyId: zapier.id
    }
  })

  console.log('Database has been seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })