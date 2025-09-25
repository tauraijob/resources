-- AlterTable
ALTER TABLE `user` ADD COLUMN `resetExpiry` DATETIME(3) NULL,
    ADD COLUMN `resetToken` VARCHAR(191) NULL;
