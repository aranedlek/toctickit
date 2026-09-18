import { Router } from 'express';
import { prisma } from '../prismaClient';
import { authenticateUser, requireRole } from '../middleware/auth';
import { Role } from '../../generated/prisma/client';

const router = Router();

// GET /api/related-systems
router.get('/', async (req, res) => {
  try {
    const systems = await prisma.relatedSystem.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(systems);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// All following endpoints require IT_STAFF or ADMINISTRATOR
router.use(authenticateUser);
router.use(requireRole([Role.IT_STAFF, Role.ADMINISTRATOR]));

// POST /api/related-systems
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const system = await prisma.relatedSystem.create({ data: { name } });
    res.status(201).json(system);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/related-systems/:id
router.patch('/:id', async (req, res) => {
  const { name } = req.body;
  const id = parseInt(req.params.id, 10);
  
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const system = await prisma.relatedSystem.update({
      where: { id },
      data: { name },
    });
    res.json(system);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'System not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/related-systems/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    // Check if system is used in tickets
    const count = await prisma.ticket.count({ where: { relatedSystemId: id } });
    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete system in use by tickets' });
    }

    await prisma.relatedSystem.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'System not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
