-- AlterTable
ALTER TABLE `user` ADD COLUMN `googleCalendarConnected` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `googleRefreshToken` VARCHAR(191) NULL;
