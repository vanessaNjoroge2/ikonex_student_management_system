/*
  Warnings:

  - You are about to drop the column `admissionNo` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `attendanceRate` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `cumulativeGpa` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `extracurriculars` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `honorsList` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `parentName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `parentPhone` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `streamId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `prismaUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[admission_number]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `admission_number` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_of_birth` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `form_level` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kcpe_score` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parent_name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parent_phone` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relationship` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stream` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stream_id` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'STUDENT';

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_streamId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_teacher_id_fkey";

-- DropIndex
DROP INDEX "Student_admissionNo_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "admissionNo",
DROP COLUMN "attendanceRate",
DROP COLUMN "createdAt",
DROP COLUMN "cumulativeGpa",
DROP COLUMN "extracurriculars",
DROP COLUMN "firstName",
DROP COLUMN "honorsList",
DROP COLUMN "lastName",
DROP COLUMN "parentName",
DROP COLUMN "parentPhone",
DROP COLUMN "status",
DROP COLUMN "streamId",
ADD COLUMN     "admission_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "admission_number" TEXT NOT NULL,
ADD COLUMN     "alt_phone" TEXT,
ADD COLUMN     "attendance_percentage" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_of_birth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "enrollment_status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "form_level" TEXT NOT NULL,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kcpe_score" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "nationality" TEXT DEFAULT 'Kenyan',
ADD COLUMN     "parent_name" TEXT NOT NULL,
ADD COLUMN     "parent_phone" TEXT NOT NULL,
ADD COLUMN     "relationship" TEXT NOT NULL,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "stream" TEXT NOT NULL,
ADD COLUMN     "stream_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "prismaUser";

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp_code" TEXT,
    "otp_expires" TIMESTAMP(3),
    "two_factor_code" TEXT,
    "two_factor_expires" TIMESTAMP(3),
    "refresh_token" TEXT,
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginActivities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginActivities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admission_number_key" ON "Student"("admission_number");

-- CreateIndex
CREATE INDEX "Student_admission_number_idx" ON "Student"("admission_number");

-- CreateIndex
CREATE INDEX "Student_form_level_idx" ON "Student"("form_level");

-- CreateIndex
CREATE INDEX "Student_stream_idx" ON "Student"("stream");

-- CreateIndex
CREATE INDEX "Student_enrollment_status_idx" ON "Student"("enrollment_status");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_stream_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
