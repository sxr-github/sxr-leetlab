import { readFile } from "node:fs/promises";
import { db } from "./src/libs/db.js";

const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();

if (!email) {
  throw new Error("Set SEED_USER_EMAIL to the email address of the account that should own the starter problem.");
}

const owner = await db.user.findUnique({ where: { email } });
if (!owner) {
  throw new Error(`No user exists for ${email}. Create that account in SXR LEETLAB first.`);
}

const problem = JSON.parse(await readFile(new URL("./sample.json", import.meta.url), "utf8"));
const existing = await db.problem.findFirst({ where: { title: problem.title } });

if (existing) {
  console.log(`Starter problem already exists: ${existing.title}`);
} else {
  await db.problem.create({ data: { ...problem, userId: owner.id } });
  console.log(`Created starter problem: ${problem.title}`);
}

await db.$disconnect();
