-- AlterTable
ALTER TABLE `RepairRequest`
    ADD COLUMN `location` TEXT NULL,
    ADD COLUMN `mediaUrls` JSON NOT NULL DEFAULT (JSON_ARRAY());

-- AlterTable
ALTER TABLE `SellExchangeLead`
    ADD COLUMN `mediaUrls` JSON NOT NULL DEFAULT (JSON_ARRAY());
