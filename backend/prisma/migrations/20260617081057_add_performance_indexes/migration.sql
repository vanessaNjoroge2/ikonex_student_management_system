/*
  Warnings:

  - Made the column `remarks` on table `GradingScale` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GradingScale" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "remarks" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Score_studentId_idx" ON "Score"("studentId");

-- CreateIndex
CREATE INDEX "Score_subjectId_idx" ON "Score"("subjectId");

-- CreateIndex
CREATE INDEX "Score_teacher_id_idx" ON "Score"("teacher_id");

-- CreateIndex
CREATE INDEX "Stream_teacher_id_idx" ON "Stream"("teacher_id");

-- CreateIndex
CREATE INDEX "Student_stream_id_idx" ON "Student"("stream_id");

-- CreateIndex
CREATE INDEX "Student_teacher_id_idx" ON "Student"("teacher_id");

-- CreateIndex
CREATE INDEX "Subject_teacher_id_idx" ON "Subject"("teacher_id");
