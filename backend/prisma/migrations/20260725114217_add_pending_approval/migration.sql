-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
