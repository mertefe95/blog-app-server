const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const { uuid } = require('uuidv4');

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
    },
    createdDate: {
        type: Date,
        default: Date.now()
    },
    activationKey: {
        type: String,
        default: uuid
    },
    activatedDateTime: {
        type: Date,
        default: Date.now()
    },
    lastUpdated: {
        type: Date,
        default: null
    },
    forgotToken: {
        type: String,
        default: null
    }
},{
    timestamps: true
})


const User = mongoose.model('User', userSchema)

module.exports = User;