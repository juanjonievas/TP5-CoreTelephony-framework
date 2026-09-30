import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { downloadRouter } from './routes/download';
import { uploadRouter } from './routes/upload';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Aumentar el límite de payload para pruebas de throughput altas
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

app.use('/health', healthRouter);
app.use('/download', downloadRouter);
app.use('/upload', uploadRouter);

app.listen(PORT, () => {
  console.log(`✅ Network QoS Backend running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`⬇️ Download endpoint: http://localhost:${PORT}/download`);
  console.log(`⬆️ Upload endpoint: http://localhost:${PORT}/upload`);
});
