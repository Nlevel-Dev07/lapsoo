-- AlterTable
ALTER TABLE `RepairRequest`
    ADD COLUMN `deviceCategoryOther` VARCHAR(191) NULL,
    ADD COLUMN `brandOther` VARCHAR(191) NULL,
    ADD COLUMN `accessoriesOther` VARCHAR(191) NULL,
    ADD COLUMN `issueTypeOther` VARCHAR(191) NULL;
