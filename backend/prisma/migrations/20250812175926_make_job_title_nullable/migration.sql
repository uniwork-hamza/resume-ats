-- AlterTable
-- Make jobTitle column nullable to allow AI-generated titles
ALTER TABLE "analyses" ALTER COLUMN "jobTitle" DROP NOT NULL;
