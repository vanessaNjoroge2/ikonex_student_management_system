-- Add teacher_id column to Stream table and foreign key
ALTER TABLE "Stream" ADD COLUMN "teacher_id" TEXT;
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
