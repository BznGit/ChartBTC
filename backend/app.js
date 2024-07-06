module.exports = function(){
    const settings = require('./nodesSettings')
    const express = require('express');
    const app = express();
    const server = require('http').Server(app);
    const bodyParser = require('body-parser');
    const multer  = require('multer')
    //const history = require('./rewrites_routs/rewrites.js')
    var history = require('connect-history-api-fallback');
    const routes = require('./routes/routes.js');


    
    app.use(bodyParser.json());
    const storageConfig = multer.diskStorage({
        destination: (req, file, cb) =>{
            cb(null, "uploads");
        },
        filename: (req, file, cb) =>{
            cb(null, file.originalname);
        }
    });
    //app.use(multer({storage:storageConfig}).array('file'));
    app.use('/', routes);
    
    server.listen(settings.port, ()=>console.log("ChartBTC2 server started on port: ", settings.port));
    app.use(express.static('./dist')); 
}()


    

