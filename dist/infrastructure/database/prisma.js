"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = getPrismaClient;
exports.disconnectPrisma = disconnectPrisma;
const client_1 = require("@prisma/client");
// Singleton Prisma Client
let prisma;
function getPrismaClient() {
    if (!prisma) {
        prisma = new client_1.PrismaClient({
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'error', 'warn']
                : ['error'],
        });
    }
    return prisma;
}
async function disconnectPrisma() {
    if (prisma) {
        await prisma.$disconnect();
    }
}
exports.default = getPrismaClient();
//# sourceMappingURL=prisma.js.map