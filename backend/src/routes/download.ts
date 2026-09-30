import { Router } from 'express';

export const downloadRouter = Router();

// Buffer pre-generado para la descarga
// 1 MB = 1024 * 1024 bytes
const chunk1MB = Buffer.alloc(1024 * 1024, 'a'); // Llenamos de caracteres 'a'

downloadRouter.get('/', (req, res) => {
  // Permitir configurar el tamaño de descarga en MB a través del query param 'size'
  const sizeMB = parseInt(req.query.size as string) || 1;
  const clampedSize = Math.min(Math.max(sizeMB, 1), 50); // Mínimo 1MB, Máximo 50MB

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', (clampedSize * 1024 * 1024).toString());

  // Enviar chunks de 1MB
  for (let i = 0; i < clampedSize; i++) {
    res.write(chunk1MB);
  }
  
  res.end();
});
