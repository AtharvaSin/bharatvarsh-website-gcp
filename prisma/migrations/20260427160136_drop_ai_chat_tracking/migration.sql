-- DropForeignKey
ALTER TABLE "AiChatSession" DROP CONSTRAINT "AiChatSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "AiChatMessage" DROP CONSTRAINT "AiChatMessage_sessionId_fkey";

-- DropTable
DROP TABLE "AiChatSession";

-- DropTable
DROP TABLE "AiChatMessage";

