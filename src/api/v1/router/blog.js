const express = require("express");
const { check } = require("express-validator");
const blogPostController = require("../controller/blog");
const { isUserAuthorized } = require("../middleware/auth.middleware");

const router = express.Router();

/*
    METHOD : GET
    DESCRIPTION: Get all blogs posts
**/
router.get("/blog-posts", blogPostController.getAllBlogPosts);

/*
    METHOD : GET
    DESCRIPTION: Get blog post by id
**/
router.get("/blog-posts/:id", blogPostController.getBlogPostById);

/*
    METHOD : POST
    DESCRIPTION: Create blog post 
**/
router.post(
  "/blog-posts",
  isUserAuthorized,
  [
    check("title")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    check("content")
      .isLength({ min: 10 })
      .withMessage("Content must be at least 10 characters"),
  ],
  blogPostController.createBlogPost
);

/*
    METHOD : PUT
    DESCRIPTION: Update blog
**/
router.put(
  "/blog-posts/:id",
  isUserAuthorized,
  [
    check("title")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    check("content")
      .isLength({ min: 10 })
      .withMessage("Content must be at least 10 characters"),
  ],
  blogPostController.updateBlogPost
);
/*
    METHOD : DELETE
    DESCRIPTION: delete blog
**/
router.delete(
  "/blog-posts/:id",
  isUserAuthorized,
  blogPostController.deleteBlogPost
);

module.exports = router;
