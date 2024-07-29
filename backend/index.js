require('dotenv').config();
console.log(process.env.PORT) 
const express = require("express");
const router = require("./routes");
const session = require("./middleware/session");
const corsMw = require("./middleware/cors");
const mgb = require('./db/mongo')
const config = require("./config");
const app = express();

const  btcService = require("./service/btc");
btcService.setExchangeformApi()

app.use(express.json());
// if you run behind a proxy (e.g. nginx)
// app.set('trust proxy', 1);

//setup CORS logic
//app.options("*", corsMw);
//app.use(corsMw);

app.use(session);
app.use(router);

app.use(express.static('./dist')); 
app.listen(process.env.PORT, () => console.log(`server is running on port ${process.env.PORT}`));
