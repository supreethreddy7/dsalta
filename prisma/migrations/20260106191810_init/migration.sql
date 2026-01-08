-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('ACCESS_CONTROL', 'POLICY', 'RISK_ASSESSMENT', 'VENDOR_SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('SCREENSHOT', 'DOCUMENT', 'LINK', 'LOG_EXPORT', 'OTHER');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Framework" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Framework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "TaskCategory" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Framework_organizationId_idx" ON "Framework"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Framework_organizationId_name_key" ON "Framework"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Control_frameworkId_idx" ON "Control"("frameworkId");

-- CreateIndex
CREATE UNIQUE INDEX "Control_frameworkId_code_key" ON "Control"("frameworkId", "code");

-- CreateIndex
CREATE INDEX "Task_organizationId_idx" ON "Task"("organizationId");

-- CreateIndex
CREATE INDEX "Task_organizationId_status_idx" ON "Task"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Task_organizationId_category_idx" ON "Task"("organizationId", "category");

-- CreateIndex
CREATE INDEX "Task_organizationId_controlId_idx" ON "Task"("organizationId", "controlId");

-- CreateIndex
CREATE INDEX "Evidence_taskId_idx" ON "Evidence"("taskId");

-- AddForeignKey
ALTER TABLE "Framework" ADD CONSTRAINT "Framework_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
