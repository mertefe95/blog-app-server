const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const postSchema = new Schema({
    blogTitle: {
        type: String,
        required: true,
        validator(value) {
            if(validator.isEmpty(value)) {
                throw new Error('Please enter a title for your post.')
            }
        }
    },
    blogText: {
        type: String,
        required: true,
        validator(value) {
            if(validator.isEmpty(value)) {
                throw new Error('Please enter a text for your post.')
            }
        }
    },
    authorName: {
        type: String,
        required: true,
        validator(value) {
            if(validator.isEmpty(value)) {
                throw new Error('Please enter an author name for your post.')
            }
        }
    }
}, {
    timestamps: true
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
