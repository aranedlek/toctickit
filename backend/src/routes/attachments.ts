import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/client';

const router = Router();
const prisma = new PrismaClient();

// DELETE /api/attachments/:id
router.delete('/:id', async (req, res) => {
  try {
    const attachmentId = parseInt(req.params.id, 10);
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    if (attachment.deletedAt) {
      return res.status(400).json({ error: 'Attachment already deleted' });
    }

    const updatedAttachment = await prisma.attachment.update({
      where: { id: attachmentId },
      data: { deletedAt: new Date() },
    });

    res.json(updatedAttachment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
