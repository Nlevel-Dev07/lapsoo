-- Widen ProductImage.url and ProductImage.publicId from VARCHAR(191) to TEXT,
-- since some CDN/Cloudinary URLs (with long paths or query params) exceed 191 characters.
ALTER TABLE `ProductImage` MODIFY `url` TEXT NOT NULL;
ALTER TABLE `ProductImage` MODIFY `publicId` TEXT NOT NULL;
