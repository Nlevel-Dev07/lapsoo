-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `menuKeys` JSON NOT NULL DEFAULT (JSON_ARRAY()),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `store` VARCHAR(191) NULL,
    `roleId` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TeamMember_email_key`(`email`),
    INDEX `TeamMember_roleId_idx`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed a default role for migrated technicians
INSERT INTO `Role` (`id`, `name`, `menuKeys`, `createdAt`, `updatedAt`)
VALUES ('role_default_technician', 'Technician', JSON_ARRAY('repair'), CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

-- Migrate existing Technician rows into TeamMember (no login credentials yet — set up later via the Teams admin page)
INSERT INTO `TeamMember` (`id`, `name`, `phone`, `designation`, `roleId`, `active`, `createdAt`, `updatedAt`)
SELECT CONCAT('tm_', `id`), `name`, `phone`, 'Technician', 'role_default_technician', `active`, `createdAt`, `updatedAt`
FROM `Technician`;

-- AlterTable
ALTER TABLE `RepairRequest`
    ADD COLUMN `estimateCost` INTEGER NULL,
    ADD COLUMN `estimateTime` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('WALK_IN', 'ONLINE') NOT NULL DEFAULT 'ONLINE',
    ADD COLUMN `store` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `assignedToId` VARCHAR(191) NULL;

-- Backfill estimateCost and assignedToId from the old columns
UPDATE `RepairRequest` SET `estimateCost` = `estimateAmount`;
UPDATE `RepairRequest` SET `assignedToId` = CONCAT('tm_', `technicianId`) WHERE `technicianId` IS NOT NULL;

-- DropForeignKey
ALTER TABLE `RepairRequest` DROP FOREIGN KEY `RepairRequest_technicianId_fkey`;

-- DropIndex
DROP INDEX `RepairRequest_technicianId_idx` ON `RepairRequest`;

-- AlterTable
ALTER TABLE `RepairRequest`
    DROP COLUMN `technicianId`,
    DROP COLUMN `estimateAmount`;

-- DropTable
DROP TABLE `Technician`;

-- CreateIndex
CREATE INDEX `RepairRequest_assignedToId_idx` ON `RepairRequest`(`assignedToId`);

-- AddForeignKey
ALTER TABLE `RepairRequest` ADD CONSTRAINT `RepairRequest_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `TeamMember`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
