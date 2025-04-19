import express from 'express';
import deviceConfigController from '../controllers/DeviceConfigController.js';
import apiKeyAuth from '../middleware/auth.js';

const router = express.Router();

router.post('/', apiKeyAuth, deviceConfigController.createDeviceConfig);
router.put('/:deviceId', apiKeyAuth, deviceConfigController.updateDeviceConfig);
router.get('/:deviceId', apiKeyAuth, deviceConfigController.getDeviceConfig);
router.get('/', apiKeyAuth, deviceConfigController.getAllDevices);
router.delete('/:deviceId', apiKeyAuth, deviceConfigController.deleteDeviceConfig);

export default router;