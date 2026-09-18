import { Router } from 'express';
import { Role } from '../../generated/prisma/client';
import { prisma } from '../prismaClient';
import { authenticateUser, requireRole } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

// All routes require ADMINISTRATOR role
router.use(authenticateUser);
router.use(requireRole([Role.ADMINISTRATOR]));

// GET /api/users
router.get('/', async (req, res) => {
  const { search, role, page = '1', limit = '10' } = req.query;

  const take = parseInt(limit as string, 10);
  const skip = (parseInt(page as string, 10) - 1) * take;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role as Role;
  }

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          requiresPasswordChange: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
        take,
        skip,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      total,
      page: parseInt(page as string, 10),
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  const { name, email, role, isActive, initialPassword } = req.body;

  if (!name || !email || !role || !initialPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!Object.values(Role).includes(role as Role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(initialPassword, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role as Role,
        isActive: isActive !== undefined ? isActive : true,
        passwordHash,
        requiresPasswordChange: true, // Always true for new users created by Admin
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        requiresPasswordChange: true,
        createdAt: true,
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/users/:id
router.patch('/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { name, email, role, isActive, initialPassword } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (role && Object.values(Role).includes(role as Role)) {
      updateData.role = role;
    }

    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      updateData.email = email;
    }

    if (isActive !== undefined && existingUser.isActive !== isActive) {
      // Admin cannot deactivate themselves (BR-07)
      if (userId === req.user!.id && !isActive) {
        return res.status(400).json({ error: 'You cannot deactivate your own account' });
      }

      // BR-08: Cannot deactivate last admin. Let's check how many active admins remain.
      if (!isActive && existingUser.role === Role.ADMINISTRATOR) {
        const activeAdmins = await prisma.user.count({
          where: { role: Role.ADMINISTRATOR, isActive: true }
        });
        if (activeAdmins <= 1) {
          return res.status(400).json({ error: 'Cannot deactivate the last active administrator' });
        }
      }

      updateData.isActive = isActive;
    }

    if (initialPassword) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(initialPassword, salt);
      updateData.requiresPasswordChange = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        requiresPasswordChange: true,
        createdAt: true,
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
