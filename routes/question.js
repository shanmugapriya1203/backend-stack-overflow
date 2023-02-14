var express = require('express');
const mongodb = require('mongodb');
const { connectDb, closeConnection } = require('../config');
var router = express.Router();

//Create Question
router.post('/create-question/:userId', async (req, res, next) => {

    try {
        const db = await connectDb();
        const question = await db.collection("questions").insertOne({ userId: mongodb.ObjectId(req.params.userId), ...req.body, views: 0, votes: 0 });
        console.log(question.insertedId)
        await db.collection("tags").insertOne({ tag: req.body.tag, questionId: mongodb.ObjectId(question.insertedId) })
        await closeConnection();

        res.json({ message: "Question Added Successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something Went Wrong in creating user" })
    }
});

router.get('/questions', async (req, res, next) => {

    try {
        const db = await connectDb();
        var questions = await db.collection("questions").find({}).toArray();
        await closeConnection();

        res.json(questions)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something Went Wrong in finding Questions" })
    }
})

router.get('/asked-questions/:userId', async (req, res, next) => {

    try {
        const db = await connectDb();
        var questions = await db.collection("questions").aggregate([{ $match: { userId: mongodb.ObjectId(req.params.userId) } }]).toArray();
        if (questions.length == 0) {
            res.json(questions.length)
        } else {
            var comments = [];
            questions.map(async (question) => {

                try {
                    var comment = await db.collection("comments").aggregate([{ $match: { questionId: mongodb.ObjectId(question._id) } }]).toArray();
                    var commentDetail = {
                        Question: question,
                        Comments: []
                    };
                    comment.map((com) => {
                        commentDetail.Comments.push(com.Comment)
                    })
                    comments.push(commentDetail)

                    if (questions.length == comments.length) {
                        res.json(comments)
                    }
                } catch (error) {
                    console.log(error)
                }

            })
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something Went Wrong in Asked Questions" })
    }
})

router.get('/view-question/:qId', async (req, res, next) => {

    try {
        const db = await connectDb();
        var question = await db.collection("questions").findOne({ _id: mongodb.ObjectId(req.params.qId) });
        await closeConnection();

        res.json(question)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something Went Wrong in View question" })
    }
})

router.put('/:qId/views', async (req, res, next) => {

    try {
        const db = await connectDb();
        var question = await db.collection("questions").findOne({ _id: mongodb.ObjectId(req.params.qId) });
        question.views = question.views + 1;
        await db.collection("questions").updateOne({ _id: mongodb.ObjectId(req.params.qId) }, { $set: { views: question.views } })
        await closeConnection();

        res.json({ message: "View Count increased" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something Went Wrong in View Count" })
    }
})

router.put('/:qId/votes', async (req, res, next) => {

    try {
        const db = await connectDb();
        var question = await db.collection("questions").findOne({ _id: mongodb.ObjectId(req.params.qId) });
        question.votes = question.votes + 1;
        await db.collection("questions").updateOne({ _id: mongodb.ObjectId(req.params.qId) }, { $set: { votes: question.votes } })
        await closeConnection();

        res.json({ message: "Vote Count increased" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something Went Wrong in Vote" })
    }
})
module.exports = router;
