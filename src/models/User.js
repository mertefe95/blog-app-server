const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        validator(value) {
            if(validator.isEmpty(value)) {
                throw new Error('Please enter an username.')
            }
        }
    },
    email: {
        type: String,
        required: true,
        validator(value) {
            if(!validator.isEmpty(value)) {
                throw new Error('Please enter an email.')
            }
            
    }},
    password: {
        type: String,
        required: true,
        validator(value) {
            if(validator.isEmpty(value)) {
                throw new Error('Please enter a password.')
            }
        }
    }
},{
    timestamps: true
})


const User = mongoose.model('User', userSchema)

module.exports = User;