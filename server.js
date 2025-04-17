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

//ending pooling connection on app termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error while closing MongoDB connection:', err);
    process.exit(1);
  }
});