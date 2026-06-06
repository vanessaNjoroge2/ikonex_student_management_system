-- CreateTable GradingScale
CREATE TABLE "GradingScale" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "letter" TEXT NOT NULL UNIQUE,
    "minScore" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pass',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
