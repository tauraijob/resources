-- AlterTable
ALTER TABLE `booking` ADD COLUMN `googleEventId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `resource` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'available';

-- CreateIndex
CREATE INDEX `Booking_endTime_idx` ON `Booking`(`endTime`);
