import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Mazání otázek...");
  await prisma.question.deleteMany({});
  
  console.log("Mazání témat...");
  await prisma.topic.deleteMany({});
  
  console.log("Hotovo ✅ Databáze je prázdná.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
