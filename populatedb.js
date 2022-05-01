#! /usr/bin/env node

console.log(
  "This script populates some test cards and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Blog = require("./models/Blog");
var Comment = require("./models/Comment");
var mongoose = require("mongoose");

var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var blogs = [];
var comments = [];

function blogCreate(title, post, comments, cb) {
  var blogDetail = { title, blogPost: post, comments };

  var blog = new Blog(blogDetail);

  blog.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Blog: " + blog);
    blogs.push(blog);
    cb(null, blog);
  });
}

function commentCreate(name, txt, cb) {
  var comment = new Comment({ name, commentPost: txt });

  comment.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New comment: " + comment);
    comments.push(comment);
    cb(null, comment);
  });
}

function createComments(cb) {
  async.series(
    [
      function (callback) {
        commentCreate("user1", "well wishes", callback);
      },
      function (callback) {
        commentCreate("user1", "I hate it", callback);
      },
      function (callback) {
        commentCreate("user2", "this is ok", callback);
      },
      function (callback) {
        commentCreate(
          "user2",
          "abrasive political statement unrelated to post",
          callback
        );
      },
      function (callback) {
        commentCreate(
          "user4",
          "ad for something unrelated to post / complete scam",
          callback
        );
      },
    ],
    cb
  );
}

function createBlogs(cb) {
  async.series(
    [
      function (callback) {
        blogCreate(
          "my first post",
          "I'm posting on my blog, blah blah blah, I sound like I know what I'm talking about but I don't ",
          [comments[0], comments[2]],
          callback
        );
      },
      function (callback) {
        blogCreate(
          "my second post",
          "Something that could be said in 3 sentences but really drawn out because I need to make sure I have enough words to make a post. Either taht or I really like to hear myself talk. Talk talk talk, my ideas are so great I have to post it on the internet for EVERYONE to see, I am so important and special listen to me",
          [comments[1], comments[3]],
          callback
        );
      },
      function (callback) {
        blogCreate(
          "my last post",
          "I did something terrible and now I am making a half-cocked apology about it. I acted in the best intentions and my actions have been taken out of context, and guys, I've just learned so much since that experience. My life is over, but never do you actually see me say I'm sorry for calling my neighbor's dog a doo doo head",
          [comments[4]],
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createComments, createBlogs],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Blogs: " + blogs);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
