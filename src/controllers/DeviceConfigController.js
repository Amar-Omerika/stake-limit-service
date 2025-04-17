import deviceConfigService from '../services/DeviceConfigService.js';

class DeviceConfigController {
    async updateDeviceConfig(req, res) {
        try {
            const { deviceId } = req.params;
            const deviceConfig = await deviceConfigService.updateDeviceConfig(deviceId, req.body);
            res.status(200).send(deviceConfig);
        } catch (error) {
            console.error('Error updating device configuration:', error);

            // Handle specific validation errors
            if (error.message.includes('must be between')) {
                return res.status(400).send({ error: error.message });
            }

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

}

export default new DeviceConfigController();