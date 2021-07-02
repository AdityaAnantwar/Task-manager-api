const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(!(value.length > 6))
                throw new Error('Password needs to be longer')
            if(value.includes('password'))
                throw new Error('Password cannot be password')
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Not a valid age')
            }
        }            
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if(!user)
        throw new Error('Unable to login')
    
    const isMatched = await bcrypt.compare(password, user.password)

    if(!isMatched)
        throw new Error('Unable to login')
    
    return user
}

userSchema.methods.toJSON = function() {
    const user = this
    console.log('runs')
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = await jwt.sign({_id: user._id.toString()}, 'task-app')

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}

//hashing the password before saving it to db in case user updates password
userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//deleteing all tasks of a user when user is deleted
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({owner: user._id})

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User