import { Router } from 'express';
import { createService, getService, listServices, setServiceStatus, updateService } from '../controllers/serviceController.js';
import { allowRoles, optionalAuth, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', optionalAuth, asyncHandler(listServices));
router.get('/:id', optionalAuth, asyncHandler(getService));
router.post('/', requireAuth, allowRoles('ADMINISTRADOR'), asyncHandler(createService));
router.put('/:id', requireAuth, allowRoles('ADMINISTRADOR'), asyncHandler(updateService));
router.patch('/:id/estado', requireAuth, allowRoles('ADMINISTRADOR'), asyncHandler(setServiceStatus));
export default router;
