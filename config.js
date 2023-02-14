var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
let db;
let connection;

async function connectDb(req,res,next){
    try {
        connection = await mongoClient.connect(process.env.DB);
        db = await connection.db("Stackoverflow")
        return db
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something Went Wrong"})
    }
} 

async function closeConnection(req,res,next){
    if(connection){
        await connection.close()
    }else{
        console.log("No Connection")
    }
}

module.exports = {connectDb,closeConnection,db,connection}