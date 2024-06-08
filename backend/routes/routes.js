const express = require('express');
const route = express.Router();
const DbController = require('../controllers/dbController');
const db = new DbController();

const DataClass = require('../controllers/defaultData.js');
const data = new DataClass();


route.get('/chart/:width', function(req, res, next){
    console.log('>>get chart', req.params.width)
    const chart = data.getDefaultData(parseInt(req.params.width))
    res.send(chart);
    res.end();

});

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