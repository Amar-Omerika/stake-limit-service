import express from 'express';
import connectDB from "./src/db/mongoose.js";
import ticketController from './src/controllers/TicketController.js';

//Db connection
connectDB();

const app = express();
app.use(express.json());


app.post('/process-ticket', ticketController.processTicket);

app.put('/device-config/:deviceId', deviceConfigController.updateDeviceConfig);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});