-- AlterTable
ALTER TABLE `booking` ADD COLUMN `endMileage` INTEGER NULL,
    ADD COLUMN `startMileage` INTEGER NULL;

-- AlterTable
ALTER TABLE `resource` ADD COLUMN `currentMileage` INTEGER NULL;

-- CreateTable
CREATE TABLE `mileageLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resourceId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `bookingId` INTEGER NULL,
    `mileage` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `loggedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MileageLog_resourceId_fkey`(`resourceId`),
    INDEX `MileageLog_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mileageLog` ADD CONSTRAINT `mileageLog_resourceId_fkey` FOREIGN KEY (`resourceId`) REFERENCES `resource`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mileageLog` ADD CONSTRAINT `mileageLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
