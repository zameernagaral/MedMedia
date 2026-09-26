-- CreateTable
CREATE TABLE "CommunityMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "communityId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityMessage_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicalEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organizer" TEXT,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "attendees" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SUPPORT',
    "category" TEXT NOT NULL DEFAULT 'general',
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SupportTicket" ("createdAt", "id", "message", "status", "subject", "type", "userId") SELECT "createdAt", "id", "message", "status", "subject", "type", "userId" FROM "SupportTicket";
DROP TABLE "SupportTicket";
ALTER TABLE "new_SupportTicket" RENAME TO "SupportTicket";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phoneNumber" TEXT,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "notifPush" BOOLEAN NOT NULL DEFAULT true,
    "notifEmail" BOOLEAN NOT NULL DEFAULT true,
    "coverPhotoUrl" TEXT
);
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "email", "fullName", "googleId", "id", "passwordHash", "phoneNumber", "role", "updatedAt", "username", "verificationStatus") SELECT "avatarUrl", "bio", "createdAt", "email", "fullName", "googleId", "id", "passwordHash", "phoneNumber", "role", "updatedAt", "username", "verificationStatus" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;