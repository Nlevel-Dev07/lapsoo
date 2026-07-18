-- CreateTable
CREATE TABLE `Technician` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `RepairRequest`
    ADD COLUMN `estimateAmount` INTEGER NULL,
    ADD COLUMN `technicianId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `RepairRequest_technicianId_idx` ON `RepairRequest`(`technicianId`);

-- AddForeignKey
ALTER TABLE `RepairRequest` ADD CONSTRAINT `RepairRequest_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `Technician`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `SellExchangeLead`
    ADD COLUMN `type` ENUM('SELL', 'EXCHANGE') NOT NULL DEFAULT 'SELL';

-- DropIndex
DROP INDEX `SellExchangeLead_status_idx` ON `SellExchangeLead`;

-- CreateIndex
CREATE INDEX `SellExchangeLead_type_status_idx` ON `SellExchangeLead`(`type`, `status`);
