import deviceConfigService from '../services/DeviceConfigService.js';

class DeviceConfigController {
    async createDeviceConfig(req, res) {
        try {
            const deviceConfig = await deviceConfigService.createDeviceConfig(req.body);

            // Send 201 Created status with the new resource
            res.status(201).send({
                message: 'Device configuration created successfully',
                deviceConfig,
                deviceId: deviceConfig.deviceId
            });
        } catch (error) {
            console.error('Error creating device configuration:', error);

            if (error.message.includes('already exists')) {
                return res.status(409).send({ error: error.message });
            }

            if (error.message.includes('must be between')) {
                return res.status(400).send({ error: error.message });
            }

            res.status(500).send({ error: 'Internal server error' });
        }
    }

    async updateDeviceConfig(req, res) {
        try {
            const { deviceId } = req.params;
            const deviceConfig = await deviceConfigService.updateDeviceConfig(deviceId, req.body);
            res.status(200).send(deviceConfig);
        } catch (error) {
            console.error('Error updating device configuration:', error);

            if (error.message.includes('must be between')) {
                return res.status(400).send({ error: error.message });
            }

            res.status(500).send({ error: 'Internal server error' });
        }
    }
    async deleteDeviceConfig(req, res) {
        try {
            const { deviceId } = req.params;
            const deviceConfig = await deviceConfigService.deleteDeviceConfig(deviceId);

            if (!deviceConfig) {
                return res.status(404).send({ error: 'Device configuration not found' });
            }

            res.status(200).send({ message: 'Device configuration deleted successfully' });
        } catch (error) {
            console.error('Error deleting device configuration:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
    }

    async getAllDevices(req, res) {
        try {
            const result = await deviceConfigService.getAllDevices(req.query);
            res.status(200).send(result);
        } catch (error) {
            console.error('Error retrieving devices:', error);
            res.status(500).send({ error: 'Error retrieving devices' });
        }
    }
    async getDeviceConfig(req, res) {
        try {
            const { deviceId } = req.params;
            const deviceConfig = await deviceConfigService.getDeviceConfigByDeviceId(deviceId);

            if (!deviceConfig) {
                return res.status(404).send({ error: 'Device configuration not found' });
            }

            res.status(200).send(deviceConfig);
        } catch (error) {
            console.error('Error retrieving device configuration:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
    }


}

export default new DeviceConfigController();