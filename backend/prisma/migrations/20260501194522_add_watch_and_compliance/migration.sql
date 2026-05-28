-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'HOME_WATCHER';

-- CreateTable
CREATE TABLE "WatcherAssignment" (
    "id" TEXT NOT NULL,
    "watcherId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "handsOffMode" BOOLEAN NOT NULL DEFAULT false,
    "inviteToken" TEXT NOT NULL,
    "inviteAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatcherAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchReport" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "watcherId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL,
    "overallCondition" TEXT NOT NULL,
    "photoUrls" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StormAlert" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrls" TEXT[],
    "damageCostEstimate" DOUBLE PRECISION,
    "requiresOwnerApproval" BOOLEAN NOT NULL DEFAULT true,
    "ownerApprovedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StormAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorDispatch" (
    "id" TEXT NOT NULL,
    "stormAlertId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "contractorName" TEXT NOT NULL,
    "contractorPhone" TEXT,
    "contractorEmail" TEXT,
    "trade" TEXT NOT NULL,
    "workDescription" TEXT NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "invoiceUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractorDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceDocument" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceState" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "selectedMuniId" TEXT NOT NULL DEFAULT '',
    "checkedItems" JSONB NOT NULL DEFAULT '{}',
    "paidQuarters" JSONB NOT NULL DEFAULT '{}',
    "nightlyRate" DOUBLE PRECISION NOT NULL DEFAULT 350,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WatcherAssignment_inviteToken_key" ON "WatcherAssignment"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "WatcherAssignment_watcherId_propertyId_key" ON "WatcherAssignment"("watcherId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceState_propertyId_key" ON "ComplianceState"("propertyId");

-- AddForeignKey
ALTER TABLE "WatcherAssignment" ADD CONSTRAINT "WatcherAssignment_watcherId_fkey" FOREIGN KEY ("watcherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatcherAssignment" ADD CONSTRAINT "WatcherAssignment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchReport" ADD CONSTRAINT "WatchReport_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchReport" ADD CONSTRAINT "WatchReport_watcherId_fkey" FOREIGN KEY ("watcherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StormAlert" ADD CONSTRAINT "StormAlert_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StormAlert" ADD CONSTRAINT "StormAlert_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorDispatch" ADD CONSTRAINT "ContractorDispatch_stormAlertId_fkey" FOREIGN KEY ("stormAlertId") REFERENCES "StormAlert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorDispatch" ADD CONSTRAINT "ContractorDispatch_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceDocument" ADD CONSTRAINT "ComplianceDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceState" ADD CONSTRAINT "ComplianceState_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
