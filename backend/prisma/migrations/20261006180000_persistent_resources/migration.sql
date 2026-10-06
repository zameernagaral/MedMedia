CREATE TABLE `Resource` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `authorRole` VARCHAR(191) NULL,
    `specialty` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `pageCount` INTEGER NOT NULL DEFAULT 0,
    `fileSize` VARCHAR(191) NOT NULL DEFAULT '',
    `downloadUrl` VARCHAR(191) NOT NULL,
    `keyPearls` TEXT NOT NULL,
    `aiSummary` TEXT NULL,
    `publishedDate` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `Resource_category_specialty_idx`(`category`, `specialty`),
    INDEX `Resource_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ResourceVote` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `resourceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `ResourceVote_userId_resourceId_key`(`userId`, `resourceId`),
    INDEX `ResourceVote_resourceId_idx`(`resourceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Resource` ADD CONSTRAINT `Resource_authorId_fkey`
    FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ResourceVote` ADD CONSTRAINT `ResourceVote_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ResourceVote` ADD CONSTRAINT `ResourceVote_resourceId_fkey`
    FOREIGN KEY (`resourceId`) REFERENCES `Resource`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
