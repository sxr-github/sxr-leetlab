/*
  Warnings:

  - You are about to drop the column `codesnippet` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `contraints` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `dificulty` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `codeSnippets` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `constraints` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "codesnippet",
DROP COLUMN "contraints",
DROP COLUMN "dificulty",
ADD COLUMN     "codeSnippets" JSONB NOT NULL,
ADD COLUMN     "constraints" TEXT NOT NULL,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL;

-- DropEnum
DROP TYPE "Dificulty";
