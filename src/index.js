const express = require("express");
const cors = require("cors");
const testConnect = require("./db/testConnect");
const fs = require('fs');
const path = require('path');

class AppController {
  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
    testConnect();
    require('./services/cronjobVerification');
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