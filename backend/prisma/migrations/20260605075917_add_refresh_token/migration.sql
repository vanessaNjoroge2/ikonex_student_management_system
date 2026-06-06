/*
  Warnings:

  - Added the required column `teacher_id` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_id` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_id` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "teacher_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "teacher_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "teacher_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "prismaUser" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_expires" TIMESTAMP(3),
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "two_factor_code" TEXT,
ADD COLUMN     "two_factor_expires" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "prismaUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "prismaUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "prismaUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
