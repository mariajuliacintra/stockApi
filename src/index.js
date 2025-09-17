const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');

class AppController {
  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
    require('./services/cron/cronjobVerification');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
  }
  middlewares() {
    this.express.use(express.json());
    this.express.use(cors());
  }
  routes() {
    const apiRoutes = require("./routes/apiRoutes");
    this.express.use("/stock", apiRoutes);
  }
}

module.exports = new AppController().express;