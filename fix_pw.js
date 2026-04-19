import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
async function run() {
  await prisma.project.updateMany({ data: { password: "client123" } });
  console.log("Passwords updated to client123");
}
run();
