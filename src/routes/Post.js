const express = require('express');
const router = new express.Router();
const Post = require('../models/Post');
const mongoose = require('mongoose');

router.get('/posts', async (req, res) => {
    const posts = await Post.find();
    res.json(posts)
})

router.get('/posts/:id', async (req, res) => {
    const post = await Post.findById(req.params.id)
    res.json(post);

})

router.post('/posts', async (req, res) => {
    const { blogTitle, blogText, authorName } = req.body
    const newPost = new Post({
        blogTitle, blogText, authorName
    });

    // save post model
    try {
        const savedPost = await newPost.save();
        res.json(savedPost)
    } catch (err) {
        console.error(err);
    }

})



module.exports = router;

