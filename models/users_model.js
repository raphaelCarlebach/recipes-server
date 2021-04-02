const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  userName: String,
  email: {
    type: String,
    required: true,
    unique: true
},
  oldPass:String,
  pass: String,  
  rule: {
    type: String, default: "regular"
  },
  favorites: [{
    recipeID:  {
      type: String,
      unique: true,
  }

  }]
});

const userModel = mongoose.model("users",userSchema);

exports.userModel = userModel;

const validUser = (_userObj) => {  
  let schema = Joi.object({
    id:Joi.any(),
    userName:Joi.string().min(2).max(50).required(),
    email: Joi.string().min(2).max(50).email().required(),
    pass:Joi.string().min(5).max(50).required(),
   
  })
  return schema.validate(_userObj);
};

exports.validUser = validUser;

const validEditUser = (_userObj) => {
    let schema = Joi.object({
    id:Joi.any().required(),
    userName:Joi.string().min(2).max(50).required(),
    email: Joi.string().min(2).max(50).email().required()
   
  })
  return schema.validate(_userObj);
};


exports.validEditUser = validEditUser;


const validEditPass = (_userObj) => {  
  let schema = Joi.object({
    id:Joi.any().required(),
   pass:Joi.string().min(5).max(50).required(),
   oldPass:Joi.string().min(1).max(50).required()
  });
  return schema.validate(_userObj);
};

exports.validEditPass = validEditPass;

const validLogin = (_userObj) => {
  let schema = Joi.object({
    email: Joi.string().min(2).max(50).email().required(),
    pass:Joi.string().min(5).max(50).required(),  
  })
  return schema.validate(_userObj);
};

exports.validLogin = validLogin;




