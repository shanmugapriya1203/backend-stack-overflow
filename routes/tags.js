var express = require('express');
var mongodb = require('mongodb')
const { connectDb, closeConnection } = require('../config');
var router = express.Router();

router.get('/view-tag/',async (req,res,next)=>{

    try {
        const db = await connectDb();
        const questions = await db.collection("tags").aggregate([{$match : {tag : req.query.tag}}]).toArray();
        var questionDetail = [];
        questions.map(async (question)=>{
            let q = await db.collection("questions").findOne({_id : mongodb.ObjectId(question.questionId)})
            var detail = {
                Question : q,
                Comments : []
            }
            var comment = await db.collection("comments").aggregate([{$match : {questionId : mongodb.ObjectId(q._id)}}]).toArray();
            comment.map((com)=>{
                detail.Comments.push(com.Comment)
            })
            questionDetail.push(detail)

            if(questions.length == questionDetail.length){
                res.json(questionDetail)
                await closeConnection();
            }
        })
        

    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something Went Wrong in tag section"})
    }
})

router.get('/all-tags', async function(req,res,next){

    try {
        const db = await connectDb();
        const tags = await db.collection("tags").find({}).toArray();
        await closeConnection();

        res.json(tags)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something Went Wrong in tags section"})
    }
})

module.exports = router;