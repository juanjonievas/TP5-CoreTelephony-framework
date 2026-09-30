import { Router } from 'express';

export const uploadRouter = Router();

uploadRouter.post('/', (req, res) => {
  const size = req.body ? req.body.length : 0;
  
  res.status(200).json({
    status: 'ok',
    message: 'Data received successfully',
    receivedBytes: size
  });
});
