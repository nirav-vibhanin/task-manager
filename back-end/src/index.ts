import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './server/app.js';
import { logger } from './server/utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = createServer(app);

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
