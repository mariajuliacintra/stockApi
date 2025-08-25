const express = require("express");
const cors = require("cors");
const testConnect = require("./db/testConnect");

class AppController {
  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
    testConnect();
    require('./services/cronjobVerification');
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
