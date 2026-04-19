import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient({ datasourceUrl: "file:./dev.db" });
async function run() {
  const p = await prisma.project.findUnique({ where: { id: 'PRJ-001' } });
  console.log("Password:", JSON.stringify(p?.password));
}
run();
