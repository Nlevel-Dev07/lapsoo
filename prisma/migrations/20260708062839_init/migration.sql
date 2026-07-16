-- CreateTable
CREATE TABLE `Brand` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Brand_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `category` ENUM('BUSINESS', 'STUDENT', 'GAMING', 'WORKSTATION', 'MACBOOK', 'TWO_IN_ONE') NOT NULL,
    `condition` ENUM('NEW', 'CERTIFIED_REFURBISHED') NOT NULL,
    `ecosystem` ENUM('LAPANDTOP', 'LAPTOPBAZAAR') NOT NULL,
    `priceFrom` INTEGER NOT NULL,
    `processor` VARCHAR(191) NOT NULL,
    `ram` VARCHAR(191) NOT NULL,
    `storage` VARCHAR(191) NOT NULL,
    `display` VARCHAR(191) NOT NULL,
    `graphics` VARCHAR(191) NOT NULL,
    `battery` VARCHAR(191) NOT NULL,
    `warranty` VARCHAR(191) NOT NULL,
    `screenSize` DOUBLE NOT NULL,
    `availability` ENUM('IN_STOCK', 'LIMITED_STOCK', 'ON_ORDER') NOT NULL DEFAULT 'IN_STOCK',
    `highlights` JSON NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    INDEX `Product_ecosystem_category_idx`(`ecosystem`, `category`),
    INDEX `Product_brandId_idx`(`brandId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductImage_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(500) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `content` JSON NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `readTime` VARCHAR(191) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enquiry` (
    `id` VARCHAR(191) NOT NULL,
    `source` ENUM('GENERAL_ENQUIRY', 'PRODUCT_ENQUIRY', 'CORPORATE_ENQUIRY', 'REPAIR_BOOKING', 'SELL_EXCHANGE', 'CALLBACK_REQUEST') NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `metadata` JSON NULL,
    `productId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Enquiry_source_status_idx`(`source`, `status`),
    INDEX `Enquiry_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CorporateLead` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `company` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL,
    `gstin` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CorporateLead_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepairRequest` (
    `id` VARCHAR(191) NOT NULL,
    `trackingCode` VARCHAR(191) NOT NULL,
    `status` ENUM('BOOKED', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'COMPLETED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'BOOKED',
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `device` VARCHAR(191) NOT NULL,
    `issueType` VARCHAR(191) NOT NULL,
    `message` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RepairRequest_trackingCode_key`(`trackingCode`),
    INDEX `RepairRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SellExchangeLead` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `brand` VARCHAR(191) NOT NULL,
    `age` VARCHAR(191) NOT NULL,
    `condition` VARCHAR(191) NOT NULL,
    `message` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SellExchangeLead_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'MANAGER', 'SUPPORT') NOT NULL DEFAULT 'SUPPORT',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enquiry` ADD CONSTRAINT `Enquiry_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
