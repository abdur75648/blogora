//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request")
const https = require("https");
const { response } = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Use-your-own-API-here", {useNewUrlParser: true,  useUnifiedTopology: true });

const postSchema = {
  title: String,
  body: String,
  writer: String,
  timeAndDate: String
};
const Post = mongoose.model("Post", postSchema);
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function(req,res){
  Post.find({}, function(err, posts){
    res.render("home.ejs",{posts : posts });
  });
})

app.get("/about",function(req,res){
  res.render("about.ejs")
})
app.get("/compose",function(req,res){
  res.render("compose.ejs")
})
app.get("/subscribe",function(req,res){
  res.render("subscribe.ejs")
})
app.get("/post/:postId",function(req,res){
  const requestedPostId = req.params.postId;
  Post.findOne({_id: requestedPostId}, function(err, post){
    if (err){
      return res.status(500).send({ msg: err.message });
      res.redirect("/");
    }
    else{
    res.render("post", {title : post.title , body : post.body, timeAndDate:post.timeAndDate, writer : post.writer });
  }
});
})

app.post("/compose",function(req,res){
  var timeAndDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  timeAndDate = timeAndDate.toLocaleString()
  const post = new Post({ title : req.body.postTitle, body : req.body.postBody, timeAndDate : timeAndDate, writer : req.body.postWriter });
  post.save(function(err){
    if (err){
      return res.status(500).send({ msg: err.message });
      res.redirect("/");
    }
    else{
        res.redirect("/");
    }
  });
  // res.redirect("/")
})

app.post("/subscribe",function(req,res){
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const data = { members : [ { email_address : email, status : "subscribed",
              merge_fields : {
                  NAME : name,
                  PASSWORD : password
              }}]
  }
  const jsonData = JSON.stringify(data);

  const url = 'https://us17.api.mailchimp.com/Use-your-own-API-here'
  const options = { method : "POST", auth : "Use-your-own-Auth-Token-here" }
  const request = https.request(url,options,function(response){
      response.on("data",function(data){
          const newData = JSON.parse(data)
          console.log(newData)
          if(response.statusCode == 200 && newData.error_count == 0 ){
              res.render("success.ejs")
          }
          else{
              if(newData.errors[0].error_code == 'ERROR_CONTACT_EXISTS'){
                res.render("already.ejs")
              }
              else{
                  res.render("failure.ejs")
              }
          }
      })
  })
  
  request.write(jsonData)
  request.end()
  
})


app.listen(process.env.PORT || 3000,function(){
  console.log("Server running on port 3000")
})