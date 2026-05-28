-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "beachSide" TEXT,
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nightlyRate" DOUBLE PRECISION,
ADD COLUMN     "ownerEmail" TEXT,
ADD COLUMN     "ownerPhone" TEXT,
ADD COLUMN     "petFriendly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "town" TEXT;

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnersPick" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ownerNote" TEXT,
    "link" TEXT,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OwnersPick_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnersPick" ADD CONSTRAINT "OwnersPick_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
