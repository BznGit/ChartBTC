const express = require('express');
const route = express.Router();
const DbController = require('../controllers/dbController');
const db = new DbController();
const DataClass = require('../controllers/defaultData.js');
const data = new DataClass();


const session = require('express-session');
const redis = require('redis');
const redisClient = redis.createClient();
redisClient.connect();
const RedisStore = require("connect-redis").default;

route.use(
    session({
        store: new RedisStore({
            host: '127.0.0.1',
            port: 6379,
            client: redisClient,
        }),
        secret: 'you secret key',
        saveUninitialized: true,
        resave: true,
    })
)

route.get('/chart', function(req, res, next){
    const chart = data.getDefaultData( req.query.division, parseInt(req.query.width), parseInt(req.query.timezone), parseInt(req.query.def))
   if (!req.session.key) req.session.key = req.sessionID;
  
    req.session.chart = chart.arrDays
    console.log('sess->', req.session.chart.length)
    res.send({
        smallChart: chart.smallChart, 
        chart: chart.chart
    });
    res.end(); 
});
route.get('/getchunk', function(req, res, next){
    const chart = data.fetchData(parseInt(req.query.min), parseInt(req.query.max), req.session.chart)
    res.send(chart);
    res.end(); 
});
route.post('/update', function(req, res, next){
    let chart = data.updateData(req.body.changedPointsArr, req.session.chart)
    req.session.chart = chart
    res.end(); 
});


///////////////////////////////////////////////////////
route.get('/snapshot/:hash', function(req, res, next){
    //console.log('/snapshot: ', req.params.hash)
    db.getSnapshot(req.params.hash).then((snapshot)=>{         
        if(snapshot){
            res.send(snapshot);
            res.end();
        }else{
            res.statusCode=403;
            res.send('get snapshot request error in router.js');
            res.end();
        }
    })
});

route.get('/miner/:id', function(req, res, next){
    //console.log('/miner: ', req.params.id)
    db.getMiner(req.params.id).then((miner)=>{         
        if(miner){
            res.send(miner);
            res.end();
        }else{
            res.statusCode=403;
            res.send('get Miner request error in router.js');
            res.end();
        }
    })
});

route.get('/pool/:ip', function(req, res, next){
    //console.log('/pool: ', req.params.ip)
    let node = req.params.ip.replace(/[\-\/]/g,'.')
    //console.log(node)
    db.getPool(node).then((pool)=>{         
        if(pool){
            res.send(pool);
            res.end();
        }else{
            res.statusCode=403;
            res.send('get Pool request error in router.js');
            res.end();
        }
    })
});

route.get('/chart/:period', function(req, res, next){
    //console.log('/chart: ', req.params.period)
    db.getChart(req.params.period).then((chart)=>{         
        if(chart){
            res.send(chart);
            res.end();
        }else{
            res.statusCode=403;
            res.send('get Pool request error in router.js');
            res.end();
        }
    })
});

module.exports = route;