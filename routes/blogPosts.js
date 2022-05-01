const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const passport = require("../passport-config");

// const passport = require("passport");

function issueJWT(user) {
  const _id = user._id;
  const expiresIn = "1d";
  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
}

//index "redirects" to all blogs - no auth
router.get("/", async function (req, res, next) {
  const blogPosts = await Blog.find({});
  res.json(blogPosts);
});

//show one comment - no auth
router.get("/:blogPostId/comments/:commentId", async function (req, res, next) {
  const comment = await Comment.findById(req.params.commentId);
  res.json(comment);
});

//delete a comment and its ref in blog
router.delete(
  "/:blogPostId/comments/:commentId/delete",
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    const blogPost = await Blog.findById(req.params.blogPostId);
    Comment.findByIdAndDelete(req.params.commentId, function (err, docs) {
      if (err) {
        return next(err);
      } else {
        const newComments = blogPost.comments.filter((value, index, arr) => {
          return value != req.params.commentId;
        });
        blogPost.comments = newComments;
        blogPost.save((err) => {
          if (err) {
            return next(err);
          }
          res.json(blogPost);
        });
      }
    });
  }
);

//show all comments - no auth
router.get("/:blogPostId/comments", async function (req, res, next) {
  const blogPost = await Blog.findById(req.params.blogPostId)
    .populate("comments")
    .exec(function (err, foundPost) {
      if (err) {
        return next(err);
      }
      res.json(foundPost.comments);
    });
});

//show one blogpost - no auth
router.get("/:blogPostId", async function (req, res, next) {
  const blogPost = await Blog.findById(req.params.blogPostId)
    .populate("comments")
    .exec(function (err, foundPost) {
      if (err) {
        return next(err);
      }
      res.json(foundPost);
    });
});

router.delete(
  "/:blogPostId/delete",
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    const blogPost = await Blog.findById(req.params.blogPostId);
    const commentsToDelete = blogPost.comments;
    Comment.deleteMany(
      {
        _id: { $in: commentsToDelete },
      },
      function (err, result) {
        if (err) {
          return next(err);
        }
        Blog.findByIdAndDelete(req.params.blogPostId, (err, deletedPost) => {
          if (err) {
            return next(err);
          }
          res.json(deletedPost);
        });
      }
    );
  }
);

//edit one blogpost
router.put(
  "/:blogPostId/edit",
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    const updatedPost = new Blog({
      title: req.body.title,
      blogPost: req.body.blogPost,
      comments: req.body.comments,
      published: req.body.published,
      _id: req.params.blogPostId,
    });

    Blog.findByIdAndUpdate(
      req.params.blogPostId,
      updatedPost,
      {},
      function (err, updatedBlogPost) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.json(updatedBlogPost);
      }
    );
  }
);

//create new blogpost
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    const newPost = await new Blog({
      title: req.body.title,
      blogPost: req.body.blogPost,
      comments: [],
      published: false,
    });
    await newPost.save((err) => {
      if (err) {
        return next(err);
      }
      res.json(newPost);
    });
  }
);

//create new comment and ammend blogpost - no auth
router.post("/:blogPostId/comments/create", async function (req, res, next) {
  const blogPost = await Blog.findById(req.params.blogPostId);
  const newComment = await new Comment({
    name: req.body.name,
    commentPost: req.body.commentPost,
  });

  await newComment.save((err) => {
    if (err) {
      return next(err);
    }
    blogPost.comments.push(newComment);
    blogPost.save((err) => {
      if (err) {
        return next(err);
      }
      res.json(blogPost);
    });
  });
});

function verifyToken(req, res, next) {
  //get auth header value
  const bearerHeader = req.headers["authorization"];
  //check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    //Split at the space
    const bearer = bearerHeader.split(" ");
    //Get token from array
    const bearerToken = bearer[1];
    //Set token
    req.token = bearerToken;
    //Next middleware
    next();
  } else {
    //Forbidden
    res.sendStatus(403);
  }
}

module.exports = router;
