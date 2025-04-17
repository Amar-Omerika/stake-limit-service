import express from 'express';
import connectDB from "./src/db/mongoose.js";
import DeviceConfig from './src/models/DeviceConfig.js';
import StakeLog from './src/models/StakeLog.js';

connectDB();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Add a device config
app.post('/device-config', async (req, res) => {
  try {
    const deviceConfig = new DeviceConfig(req.body);
    await deviceConfig.save();
    res.status(201).send(deviceConfig);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Add a stake log
app.post('/stake-log', async (req, res) => {
  try {
    const stakeLog = new StakeLog(req.body);
    await stakeLog.save();
    res.status(201).send(stakeLog);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});