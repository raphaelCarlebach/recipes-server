const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const multer = require('multer');
require('dotenv').config()


// express
///////////////////////////////
const app = express();

// bodyParser
///////////////////////////////
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cors
///////////////////////////////
app.use(cors())

// db connecsion
///////////////////////////////
// mongoose.connect('mongodb://localhost/matconim', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB connect'));

mongoose.connect(`mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASS}@cluster0.ean0g.mongodb.net/matcinim`, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB connect'));



// models
///////////////////////////////
const { userModel, validUser, validLogin, validEditUser, validEditPass } = require("./models/users_model");
const { recipeModel } = require("./models/recipes_model");

// middleware
///////////////////////////////
const { authToken } = require("./middleware/auth");

app.get('/auth', authToken, async (req, res) => {
  let user = await userModel.findById(req.user.id).select('-pass');
  res.json({ message: "authToken works", status: "ok", user });
});


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

function fileFilter(req, file, cb) {
  if (file.mimetype === 'image/jpeg' || 'image/png') {
    cb(null, true)
  } else {
    cb(new Error('jpeg / png files only'), false)
  }

};

const upload = multer({ storage: storage, fileFilter: fileFilter });


//uploads
///////////////////////////////
app.use('/uploads', express.static('uploads'));


// Routes
///////////////////////////////
app.get('/', (req, res) => {
  res.send('welcome, <br> my recipes app')
});

// users   
///////////////////////////////
app.get('/allUsers', (req, res) => {
  userModel.find({})
    .then(data => {
      console.log(data);
      res.json(data)
    })
    .catch(err => {
      res.status(400).json(err)
    })
});

app.get('/singelUser', (req, res) => {
  userModel.find({ _id: req.query.user_id }, { userName: 1, _id: 1 })
    .then(data => {
      console.log(data);
      res.json(data)
    })
    .catch(err => {
      res.status(400).json(err)
    })
});

app.post("/regester", async (req, res) => {
  let valid = validUser(req.body);
  if (!valid.error) {
    let salt = await bcrypt.genSalt(10);
    req.body.pass = await bcrypt.hash(req.body.pass, salt);
    try {
      let data = await userModel.insertMany([req.body]);
      res.status(200).json({ message: "user secsefully added" });
      console.log(data)
    }
    catch (err) {
      res.status(400).json({ message: "user already in system ", code: "duplicate" });
    }
  }
  else {
    res.status(400).json(valid.error.details);
  }
});

app.post("/login", async (req, res) => {
  let valid = validLogin(req.body)
  if (!valid.error) {
    try {
      let user = await userModel.findOne({ email: req.body.email })
      if (user) {
        let validPass = await bcrypt.compare(req.body.pass, user.pass);
        if (!validPass) { res.status(400).json({ message: "incorrect password" }) }
        else {
          console.log(user)
          let myToken = jwt.sign({ id: user.id }, 'hash-brownie', {
            expiresIn: 43200
          });

          let logged_info = {
            token: myToken,
            user_info: user
          }

          res.json({ status: 200, user_info: logged_info });
          // res.json({message:"user is loged", token: myToken })
        }
      }
      else {
        res.status(400).json({ message: "user not found" })
      }
    }
    catch (err) {
      res.status(400).json(err);
    }
  }
  else {
    res.status(400).json(valid.error.details);
  }
});

app.put("/edituserinfo", async (req, res) => {
  let valid = validEditUser(req.body);
  if (!valid.error) {

    try {
      let data = await userModel.updateOne({ _id: req.body.id }, req.body);
      res.json(data)
    }
    catch (err) {
      res.status(400).json({ message: "user already in system ", code: "duplicate" });
    }
  }
  else {
    res.status(400).json(valid.error.details);
  }
})


app.put("/editPass", async (req, res) => {
  let valid = validEditPass(req.body);
  if (!valid.error) {   
    let salt = await bcrypt.genSalt(10);
    req.body.pass = await bcrypt.hash(req.body.pass, salt);

    try {
      let user = await userModel.findOne({ _id: req.body.id })
      if (user) {
        let validPass = await bcrypt.compare(req.body.oldPass, user.pass);
        if (!validPass) {
          res.status(400).json({ message: "password not good" })
        }
        else {
          try {
            let data = await userModel.updateOne({ _id: req.body.id }, req.body);
            res.json(data)
          }
          catch (err) {
            res.status(400).json("pass is not valid " + err);
          }
        }
      }
      else {
        res.status(400).json({ message })
      }

    }
    catch (err) {
      res.status(400).json("pass is not valid " + err);
    }
  }
  else {
    res.status(400).json(valid.error.details);
  }
});


//recipes
///////////////////////////////
app.get('/allRecipes', (req, res) => {
  recipeModel.find({})
    .then(data => {
      console.log(data);
      res.json(data)
    })
    .catch(err => {
      res.status(400).json(err)
    })
});

app.get('/catRecipes', (req,res) => {
  recipeModel.find({ Category: req.query.category })
  .then(data => {
    console.log(data);
    res.json(data)
  })
  .catch(err => {
    res.status(400).json(err)
  })
});

app.get('/singleRecipe', (req, res) => {
  recipeModel.find({ _id: req.query.id })
    .then(data => {
      console.log(data);
      res.json(data)
    })
    .catch(err => {
      res.status(400).json(err)
    })
});


app.post('/addRecipe', upload.single('Image'), authToken, (req, res) => {
  console.log(req.body)
  console.log(req.user.id)
  console.log(req.file)
  var user_id = req.user.id

  var date_obj = new Date();
  var date = ("0" + date_obj.getDate()).slice(-2);
  var month = ("0" + (date_obj.getMonth() + 1)).slice(-2);
  var year = date_obj.getFullYear();
  var now = year + "-" + month + "-" + date;

  var recipe = new recipeModel({
    Title: req.body.Title,
    Description: req.body.Description,
    UthorID: user_id, // id by token
    Date: now, // js date
    Image: req.file.path, //by formData multer
    Category: req.body.Category,
    Ingredients: JSON.parse(req.body.Ingredients), //array
    ProductName: req.body.ProductName,
    ProductQuantity: req.body.ProductQuantity,
    WeightType: req.body.WeightType,
    Instructions: JSON.parse(req.body.Instructions) //array 
  });

  recipe.save().then(data => {
    console.log(data);
    res.json(data)
  })
    .catch(err => {
      res.status(400).json(err)
    })
});


app.get('/userRecipes', authToken, (req, res) => {
  console.log(req.user.id)
  recipeModel.find({ UthorID: req.user.id })
    .then(data => {
      console.log(data);
      res.json(data)
    })
    .catch(err => {
      res.status(400).json(err)
    })
});

app.post('/deleteRecipes', authToken, (req, res) => { 
  var recipeID = req.body.recipeID;
  console.log(req.body);
  recipeModel.deleteOne({ _id: recipeID })
    .then(data => {
      console.log(data);
      res.json(data)
    })
    .catch(err => {
      res.status(400).json(err)
    })
});

app.post('/addToFavorites',authToken, (req, res) => {
  console.log(req.body); 
  console.log(req.user.id); 

  var user_id = req.user.id;  
  var recipeID = req.body.recipeID;

  favorite_recipe = { recipeID: recipeID };
  
  
  userModel.updateOne({ _id: user_id }, { $push: { favorites: favorite_recipe } }).then((result) => {
    console.log(result);
  }).catch(err => {
    res.status(400).json(err)
  });

  res.send(200);
});


app.post('/delFromFavorites',authToken, (req, res) => {  
  console.log(req.body); 
  console.log(req.user.id); 
  var user_id = req.user.id; 

  userModel.updateMany({ _id: user_id }, { $pull: { favorites: { recipeID: req.body.recipeID } } }).then((result) => {
    console.log(result);
  }).catch(err => {
    res.status(400).json(err)
  });

  res.send(200);
});

app.get('/userFavoriteRecipes', authToken, (req, res) => {
  console.log(req.user.id)
  userModel.find({ _id: req.user.id } , { favorites: 1, _id: 1 })
    .then(data => {
      console.log(data);
      res.json(data)
    })
    .catch(err => {
      res.status(400).json(err)
    })
});

app.post('/addReview', (req, res) => {
  console.log(req.body);

  var date_obj = new Date();
  var date = ("0" + date_obj.getDate()).slice(-2);
  var month = ("0" + (date_obj.getMonth() + 1)).slice(-2);
  var year = date_obj.getFullYear();
  var now = year + "-" + month + "-" + date;

  var recipe_id = req.body.recipe_id;

  comment = {
    Stars: req.body.Stars,
    Review: req.body.Review,
    Date_Review: now,
    User: req.body.User
  };

  recipeModel.updateMany({ _id: recipe_id }, { $push: { Rating: comment } }).then((result) => {
    console.log(result);
  }).catch(err => {
    res.status(400).json(err)
  });

  res.send(200);
});

// port
///////////////////////////////
const port = process.env.PORT || 4000;
app.listen(port, function () {
  console.log('Server is running with port ' + port);
});