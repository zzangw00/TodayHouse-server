const express = require('./config/express');
const { logger } = require('./config/winston');
const app = express();
const port = 3000;
// if (process.env.NODE_ENV == 'development') {
//     port = 3000;
// } else if (process.env.NODE_ENV == 'production') {
//     port = 3001;
// }
express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);
