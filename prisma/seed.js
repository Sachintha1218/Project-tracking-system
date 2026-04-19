import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const mockProjects = [
  {
    id: 'PRJ-001',
    title: 'Podcast Series A',
    category: 'Podcast',
    status: 'In Progress',
    progress: 65,
    milestones: {
      create: [
        { title: 'Scripting', status: 'Done', startDate: '2023-10-01', endDate: '2023-10-10' },
        { title: 'Recording', status: 'Done', startDate: '2023-10-15', endDate: '2023-10-20' },
        { title: 'Post-Production', status: 'Current', startDate: '2023-10-22', endDate: '2023-11-05' },
        { title: 'Final Delivery', status: 'Pending', startDate: '2023-11-10', endDate: '2023-11-15' },
      ],
    },
  },
  {
    id: 'PRJ-002',
    title: 'Social Media Campaign Q4',
    category: 'Social Media',
    status: 'Review',
    progress: 85,
    milestones: {
      create: [
        { title: 'Strategy & Planning', status: 'Done', startDate: '2023-09-01', endDate: '2023-09-15' },
        { title: 'Content Creation', status: 'Done', startDate: '2023-09-20', endDate: '2023-10-20' },
        { title: 'Client Review', status: 'Current', startDate: '2023-10-25', endDate: '2023-11-01' },
        { title: 'Launch', status: 'Pending', startDate: '2023-11-05', endDate: '2023-11-10' },
      ],
    },
  },
  {
    id: 'PRJ-003',
    title: 'Corporate E-Learning Module',
    category: 'E-Learning',
    status: 'Completed',
    progress: 100,
    milestones: {
      create: [
        { title: 'Curriculum Design', status: 'Done', startDate: '2023-06-01', endDate: '2023-06-15' },
        { title: 'Video Production', status: 'Done', startDate: '2023-06-20', endDate: '2023-07-20' },
        { title: 'Platform Integration', status: 'Done', startDate: '2023-07-25', endDate: '2023-08-15' },
        { title: 'QA & Launch', status: 'Done', startDate: '2023-08-20', endDate: '2023-08-30' },
      ],
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const p of mockProjects) {
    const project = await prisma.project.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
    console.log(`Created project with id: ${project.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
