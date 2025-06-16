const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  firstName : {
    type : String,
    required : true,
    minLength : 4,
    maxLength : 50,
  },
  lastName : {
    type : String,
    required : true,
  },
  email : {
    type : String,
    lowercase : true,
    required : true,
    unique: true,
    trim : true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error('Enter a valid email address');
      }
    }
  },
  password : {
    type : String,
    required : true,
    validate(value){
      if(value.length < 6){
        throw new Error('Password must be at least 6 characters');
      }
      if(validator.isStrongPassword(value)){
        throw new Error('Password is not strong enough' + value);
      }
    },
    validate(value){
      if(!validator.isStrongPassword(value)){
        throw new Error('Password is not strong enough' + value);
      }
    }
  },
  age : {
    type : Number,
    min : 18
  },
  gender : {
    type : String,
    enum : ['male', 'female', 'other'],
    default : 'male'
  },
  currentAddress : {
    type : String,
    required : true
  },
  permanentAddress : {
    type : String,
    required : true
  },
  pinCodeCurrent : {
    type : Number,
    required : true
  },
  pinCodePermanent : {
    type : Number,
    required : true
  },
  role : {
    type : String,
    required : true
  },
  skills : {
    type : [String],
    validate(value) {
      if (value.length < 1) {
        throw new Error('At least one skill is required');
      }
    }
  }
}, { timestamps : true });


module.exports = mongoose.model('User', UserSchema);
