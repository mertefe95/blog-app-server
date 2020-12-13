const express = require('express');
const router = new express.Router();
const Post = require('../models/Post');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');


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
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(400).json(`Error: ${err} `))
})

router.post('/posts', async (req, res) => {
    const newPost = new Post({
        blogTitle: req.body.blogTitle,
        blogText: req.body.blogText,
        userId: req.body.userId,
        authorName: req.body.authorName
    })



    newPost.save()
        .then(() => res.json("New blog post is created."))
        .catch(err => res.status(400).send(err));

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
            return res.status(404).send({
                msg: 'Token does not match. Enter the valid token.'
            })
        }

        res.send(post)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.put('/posts/:id', (req, res) => {


        Post.findOne({id: req.params.id, userId: req.body.userId }).then(post => {
        post.blogTitle = req.body.blogTitle;
        post.blogText = req.body.blogText;

        post
            .save()
            .then(() => res.json("The Post is updated successfully."))
            .catch(err => res.status(400).json({ msg: "No match. "}))
    })
    .catch(err => res.status(400).json({ msg: "Wrong Request" }))

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
    Post.findByIdAndDelete(req.params.id)
        .then(() => res.json('The Post is DELETED.'))
        .catch(err => res.status(400).json( ));
});



module.exports = router;

