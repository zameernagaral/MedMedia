CREATE TABLE `PostLike` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `PostLike_userId_postId_key`(`userId`, `postId`),
    INDEX `PostLike_postId_idx`(`postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ClipLike` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `clipId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `ClipLike_userId_clipId_key`(`userId`, `clipId`),
    INDEX `ClipLike_clipId_idx`(`clipId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PostLike` ADD CONSTRAINT `PostLike_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `PostLike` ADD CONSTRAINT `PostLike_postId_fkey`
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ClipLike` ADD CONSTRAINT `ClipLike_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ClipLike` ADD CONSTRAINT `ClipLike_clipId_fkey`
    FOREIGN KEY (`clipId`) REFERENCES `Medclip`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
