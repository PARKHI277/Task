const BlogPost = require("../models/blogPostModel");
const { validationResult } = require("express-validator");

exports.getAllBlogPosts = async (req, res) => {
  try {
    const blogPosts = await BlogPost.find().populate("author", "username");
    res.status(200).json(blogPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getBlogPostById = async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id).populate(
      "author",
      "username"
    );
    if (!blogPost) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.status(200).json(blogPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a new blog post
exports.createBlogPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    const newBlogPost = new BlogPost({
      title,
      content,
      author: req.user.userId,
    });
    await newBlogPost.save();

    res.status(201).json({ message: "Blog post created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.updateBlogPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    const blogPost = await BlogPost.findById(req.params.id);

    if (!blogPost) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Check if the authenticated user is the author of the blog post
    if (blogPost.author.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this blog post" });
    }

    blogPost.title = title;
    blogPost.content = content;
    blogPost.updatedAt = Date.now();
    await blogPost.save();

    res.status(200).json({ message: "Blog post updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.deleteBlogPost = async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id);

    if (!blogPost) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Check if the authenticated user is the author of the blog post
    if (blogPost.author.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this blog post" });
    }

    await blogPost.remove();

    res.status(200).json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
