-- AlterTable
ALTER TABLE `CustomerVerificationCode`
    ADD COLUMN `purpose` ENUM('SIGNUP', 'PASSWORD_RESET') NOT NULL DEFAULT 'SIGNUP';
