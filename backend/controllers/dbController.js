const settings = require('../nodesSettings.json');
const MongoClient = require("mongodb").MongoClient;
const url = settings.dataBaseUrl;
const mongoClient = new MongoClient(url);
let db = mongoClient.db('EASCAN'); 

const ApiController = require('./apiController');
const api = new ApiController();

let DbController = class {

    //================================ SETTERS ==============================//
    // Update Pplns -------------------------------------------------------- //
    async updatePplns(data){
        try{ 
            let pplns = db.collection('pplns');
            await pplns.replaceOne({}, data, {upsert: true}); 
        }catch(err){
            console.log('db updatePplns error!', err);
        } 
    };
    
    // Update Nodes -------------------------------------------------------- //
    async updateNodes(data){
        try{ 
            let nodes = db.collection('nodes');
            await nodes.replaceOne({node: data.node}, data, {upsert: true}); 
        }catch(err){
            console.log('db updateNodes error!', err);
        } 
    };

    // Update Pools -------------------------------------------------------- //
    async updatePools(data){
        try{ 
           
            let pools = db.collection('pools');
            await pools.replaceOne({node: data.node}, data, {upsert: true}); 
        }catch(err){
            console.log('db updatePools error!', err);
        } 
    };

    // Set Snapshot -------------------------------------------------------- //
    async setSnapshot(data){
        try{ 
            let snapshots = db.collection('snapshots');
            await snapshots.insertOne(data); 
        }catch(err){
            console.log('db setSnapshot error!', err);
        } 
    };

    // Update Miner -------------------------------------------------------- //
    async updateMiner(data){
        try{ 
            let nodeMiner = db.collection('miners');
            //console.log(data)
            await nodeMiner.replaceOne({$and: [{miner: data.miner}, {node: data.node} ]}, data, {upsert: true}); 
        }catch(err){
            console.log('db updateMiner error!', err);
        } 
    };

    // Up date Hourly Chart ------------------------------------------------ //
    async updateHourlyChartEA(data){
        try{
            let obj = {
                array: data
            } 
            let hourlyChart = db.collection('hourlyChartEA');
            await hourlyChart.replaceOne({}, obj, {upsert: true}); 
        }catch(err){
            console.log('db updateHourlyChart error!', err);
        } 
    };

    // Update Daily Chart ------------------------------------------------ //
    async updateDailyChartEA(data){
        try{
            let obj = {
                array: data
            } 
            let dailyChart = db.collection('dailyChartEA');
            await dailyChart.replaceOne({}, obj, {upsert: true}); 
        }catch(err){
            console.log('db updateDailyChart error!', err);
        } 
    };

    //================================ GETTERS =============================//
    // Get Nodes ---------------------------------------------------------- //
    async getNodes(){
        try{              
            let nodes = db.collection('nodes');
            let res = await nodes.find({}).toArray();
            return res
        }catch(err){
            console.log('db getNodes error!');
        } finally{
            
        }  
    };

    // Get snapshot ---------------------------------------------------------- //
    async getSnapshot(hash){
        try{       
            let nodes = db.collection('snapshots');
            let res = await nodes.findOne({snapshotHash: hash});
            if (res==null){
                console.log('Going to main api for snapshot!')
                await api.getSnapShot(hash).then((result)=>res = result) 
            } 
            return res
        }catch(err){
            console.log('db getSnapshot error!');
        } finally{
            
        }  
    };

        // Get miner ---------------------------------------------------------- //
        async getMiner(id){
            try{              
                let nodes = db.collection('miners');
                let res = await nodes.findOne({ miner: id });
                //console.log(res)
                return res
            }catch(err){
                console.log('db getMiner error!');
            } finally{
                
            }  
        };

        // Get pool ---------------------------------------------------------- //
        async getPool(pool){
            try{              
                let pools = db.collection('pools');
                let res = await pools.findOne({ node: pool });
                //console.log(res)
                return res
            }catch(err){
                console.log('db getMiner error!');
            } finally{
                
            }  
        };

        // Get pool ---------------------------------------------------------- //
        async getChart(period){
        try{      
            let collection = null;       
            switch(period){
                case 'hour': collection = 'hourlyChartEA';
                    break;
                case 'day': collection = 'dailyChartEA';
                    break;
            }
            let coll = db.collection(collection);
            let res = await coll.findOne({});
            //console.log(res)
            return res.array
        }catch(err){
            console.log('db getChart error!');
        } finally{
            
        }  
    };
}

module.exports = DbController;