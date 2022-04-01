/*
  Warnings:

  - You are about to drop the `Date` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Date`;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NULL,
    `isAssigned` BOOLEAN NOT NULL DEFAULT false,
    `partnerName` VARCHAR(191) NULL,
    `isGroupDate` BOOLEAN NOT NULL DEFAULT false,
    `maxParticipants` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `note` VARCHAR(255) NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
