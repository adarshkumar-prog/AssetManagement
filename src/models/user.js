const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
      if(!(validator.isStrongPassword(value))){
        throw new Error('Password is not strong enough' + value);
      }
    },
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    enum: ['HR', 'Finance', 'Engineering', 'Sales', 'Marketing', 'Other'],
    default: 'Other'
  },
  verificationCode: {
  type: String,
  default: null
},
verificationCodeExpires: {
  type: Date,
  default: null
},
}, 
{ timestamps : true });

UserSchema.methods.getJWT =  async function() {
  const user = this;
  const token = await jwt.sign({_id : user._id }, "ASSET_MANAGEMENT_SECRET" , {
      expiresIn: "1d"
  });
  return token;
}

UserSchema.methods.ValidatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser, passwordHash);
  return isPasswordValid;
}

module.exports = mongoose.model('User', UserSchema);
