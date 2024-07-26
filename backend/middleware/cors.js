const cors = require("cors");
const config = require("../config");

const whitelist = new Set(["https://example1.com", "https://example2.com", `http://127.0.0.1:${config.port}`]);
const corsOptions = {
  optionsSuccessStatus: 200,

  origin: function(origin, callback) {
    if (origin === undefined) origin = `http://127.0.0.1:${config.port}`
    if (whitelist.has(origin)) {  
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
  
};

module.exports = cors(corsOptions);
