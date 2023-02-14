var express = require('express');
const mongodb = require('mongodb');
const { connectDb, closeConnection } = require('../config');
var router = express.Router();

//Add Comment
router.post('/add-comment/:qId', async  function(req, res, next) {
  
    try {
        const db = await connectDb();
        await db.collection("comments").insertOne({questionId : mongodb.ObjectId(req.params.qId) ,...req.body});
        await closeConnection();

        res.json({message : "Comment Added Successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something Went Wrong in Adding Comment"})
    }
});

router.get('/view-comments/:qId', async function(req,res,next){

    try {
        const db = await connectDb();
        const comments = await db.collection("comments").aggregate([{$match : {questionId : mongodb.ObjectId(req.params.qId)}}]).toArray();
        await closeConnection();
        
        res.json(comments)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something Went Wrong in loading Comment"})
    }
})

module.exports = router;
