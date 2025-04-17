import express from 'express';
import connectDB from "./src/db/mongoose.js";
import ticketController from './src/controllers/TicketController.js';
import deviceConfigController from './src/controllers/DeviceConfigController.js';
//Db connection
connectDB();

const app = express();
app.use(express.json());

//ticket routes
app.post('/process-ticket', ticketController.processTicket);

//device config routes
app.post('/device-config', deviceConfigController.createDeviceConfig);
app.put('/device-config/:deviceId', deviceConfigController.updateDeviceConfig);
app.get('/device-config/:deviceId', deviceConfigController.getDeviceConfig);
app.get('/device-config', deviceConfigController.getAllDevices);
app.delete('/device-config/:deviceId', deviceConfigController.deleteDeviceConfig);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});