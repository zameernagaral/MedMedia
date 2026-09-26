import prisma from '../data/prismaClient';

export async function createNotification(input: {
  recipientId: string;
  actorId?: string;
  type: string;
  message: string;
  entityId?: string;
}) {
  if (input.actorId && input.actorId === input.recipientId) return null;

  return prisma.notification.create({
    data: input
  });
}
