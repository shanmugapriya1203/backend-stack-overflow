var express = require('express');
const { connectDb, closeConnection } = require('../config');
var bcrypt = require('bcrypt');
var router = express.Router();
const jwt = require('jsonwebtoken');
const { json } = require('express');
var mongodb  = require("mongodb");
var nodemailer = require('nodemailer');

//Register user
router.post('/create', async function(req, res, next) {
  try {

    const db = await connectDb();
    var salt = await bcrypt.genSalt(10)
    var hash = await bcrypt.hash(req.body.password,salt);
    req.body.password = hash;
    await db.collection("users").insertOne(req.body);
    await closeConnection();

    res.json({message:"User Registered Successfully"})

  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Something Went Wrong in creating user"})
  }
});

router.get('/:userId',async  function(req,res,next){
  try {

    const db = await connectDb();
    const user = await db.collection("users").findOne({_id : mongodb.ObjectId(req.params.userId)});
    await closeConnection();

    res.json(user)

  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Something Went Wrong in creating user"})
  }
})

router.post("/login",async (req,res,next)=>{

  try {
    const db = await connectDb();
    const user = await db.collection("users").findOne({username : req.body.username})
    await closeConnection();
    if(user){
      const compare = await bcrypt.compare(req.body.password,user.password)
      if(compare){
        const token = jwt.sign({_id:user._id,name:user.name},process.env.JWT_SECRET,{expiresIn:"12h"})
        res.json({"userId" : user._id , "Name" : user.name})
      }else{
        res.status(401).json({message:"Username/password is Incorrect"})
      }
    }else{
      res.status(401).json({message:"Username/password is Incorrect"})
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Something Went Wrong in login"})
  }
})

router.post("/forgot-password", async(req,res,next)=>{
  
  try {
    const db = await connectDb();
    const user = await db.collection("users").findOne({username : req.body.username})
    if(user){
      const token = jwt.sign({_id:user._id,username:user.username},process.env.JWT_SECRET,{expiresIn:"15m"})
      const link = `https://stackoverflow-server.onrender.com/register/reset-password/${user._id}/${token}`;
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'dhanushvarmanj66@gmail.com',
          pass: 'cmskelsyfieblemd'
        }
      });
      
      var mailOptions = {
        from: 'dhanushvarmanj66@gmail.com',
        to: user.username,
        subject: 'Password Reset Link',
        text: link
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      res.json({message:"Email Sent Successfuly"})
    }else{
      res.status(404).json({message:"Username not found"})
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Something Went Wrong in Forgot Password"})
  }
})

router.get("/reset-password/:id/:token", async(req,res,next)=>{

  try {
    const {id,token} = req.params;
    const db = await connectDb();
    const user = await db.collection("users").findOne({_id : mongodb.ObjectId(id) })
    if(user){
      const verify = jwt.verify(token,process.env.JWT_SECRET);
      res.render("index",{username:verify.username ,status : "Not Verified"})
    }else{
      res.status(401).json({message:"Username not found"})
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Something Went Wrong in Reset Password"})
  }
})

router.post("/reset-password/:id/:token", async(req,res,next)=>{

  try {
    const {id,token} = req.params;
    const {password} = req.body.password;
    const db = await connectDb();
    const user = await db.collection("users").findOne({_id : mongodb.ObjectId(id) })
    if(user){
      const verify = jwt.verify(token,process.env.JWT_SECRET);
      var salt = await bcrypt.genSalt(10);
      var hash = await bcrypt.hash(req.body.password,salt);
      req.body.password = hash;
      await db.collection("users").updateOne({_id : mongodb.ObjectId(id)},{$set : {password : hash}})

      res.render("index",{username:verify.username, status:"Verified"})
    }else{
      res.status(401).json({message:"Username not found"})
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Something Went Wrong in Reset Password"})
  }
})

module.exports = router;
