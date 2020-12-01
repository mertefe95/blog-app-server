const express = require('express');
const router = new express.Router();
const Post = require('../models/Post');
const mongoose = require('mongoose');


router.get('/posts', async (req, res) => {
    const posts = await Post.find({})

    if (!posts) {
        return res
            .status(400)
            .send({error: "No post has been found."})
    }

    return res
        .status(200)
        .send(posts)
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

    
    try {
        const savedPost = await newPost.save();
        res.json(savedPost)
    } catch (err) {
        console.error(err);
    }

})

router.patch('/posts/:id', async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['blogTitle', 'blogText', 'authorName']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates! '})
    }

    try {
        const post = await Post.findById(req.params.id)

        updates.forEach((update) => post[update] = req.body[update])
        await post.save()

        if (!post) {
            return res.status(404).send()
        }

        res.send(post)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.put('/posts/:id', (req, res) => {

        Post.findById(req.params.id).then(post => {
        post.blogTitle = req.body.blogTitle;
        post.blogText = req.body.blogText;
        post.authorName = req.body.authorName;


        post
            .save()
            .then(() => res.json("The Article is updated successfully."))
            .catch(err => res.status(400).json(`Error: ${err}`))
    })
    .catch(err => res.status(400).json(`Error: ${err}`))

})
/*
router.delete('/posts', (req, res) => {
    const { blogTitle, blogText, authorName } = req.body

    const userFound = User.deleteOne({ blogTitle, blogText, authorName })

    if (!userFound) {
        return res
            .status(400)
            .send({ error: "User does not exists. "})
    }

    return res
        .status(200)
        .send(userFound)
})

*/





router.delete('/posts/:id', async (req,res) => {

        const {id} = req.body
    
        const post = await Post.findByIdAndDelete(id)


        if (!post) {
            return res
                .status(400)
                .send()
        }

        return res
            .status(200)
            .send(post)

})



module.exports = router;

