import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create sample templates
    const templates = [
        {
            category: 'Education',
            name: 'Study Summary',
            description: 'Create a concise summary of study material',
            basePrompt: 'Please summarize the following topic in a clear and concise way, highlighting the key points:',
            defaultLanguages: ['en', 'am', 'om'],
        },
        {
            category: 'Education',
            name: 'Explain Like I\'m 5',
            description: 'Simplify complex topics for easy understanding',
            basePrompt: 'Explain the following concept in simple terms that a beginner can understand:',
            defaultLanguages: ['en', 'am'],
        },
        {
            category: 'Coding',
            name: 'Code Explanation',
            description: 'Get detailed explanation of code',
            basePrompt: 'Please explain what this code does, step by step:',
            defaultLanguages: ['en'],
        },
        {
            category: 'Coding',
            name: 'Debug Helper',
            description: 'Find and fix bugs in code',
            basePrompt: 'Help me debug this code. Identify the issue and suggest a fix:',
            defaultLanguages: ['en'],
        },
        {
            category: 'Marketing',
            name: 'Social Media Caption',
            description: 'Create engaging social media captions',
            basePrompt: 'Create an engaging social media caption for the following content:',
            defaultLanguages: ['en', 'am', 'om', 'ti'],
        },
        {
            category: 'Marketing',
            name: 'Product Description',
            description: 'Write compelling product descriptions',
            basePrompt: 'Write a compelling product description for:',
            defaultLanguages: ['en', 'am'],
        },
        {
            category: 'Business',
            name: 'Email Writer',
            description: 'Compose professional emails',
            basePrompt: 'Help me write a professional email about:',
            defaultLanguages: ['en', 'am'],
        },
        {
            category: 'Business',
            name: 'Meeting Summary',
            description: 'Summarize meeting notes',
            basePrompt: 'Create a structured summary of these meeting notes:',
            defaultLanguages: ['en'],
        },
        {
            category: 'Creative',
            name: 'Story Generator',
            description: 'Generate creative stories',
            basePrompt: 'Write a creative short story about:',
            defaultLanguages: ['en', 'am', 'om', 'ti'],
        },
        {
            category: 'Creative',
            name: 'Poem Writer',
            description: 'Create beautiful poems',
            basePrompt: 'Write a poem about:',
            defaultLanguages: ['en', 'am', 'om', 'ti'],
        },
    ];

    for (const template of templates) {
        await prisma.template.create({
            data: template,
        });
    }

    console.log('✅ Database seeded successfully!');
    console.log(`📝 Created ${templates.length} templates`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
