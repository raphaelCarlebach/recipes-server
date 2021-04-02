const mongoose = require("mongoose");
const Joi = require("joi");


const recipeSchema = new mongoose.Schema({
   
    // todo: required 

    Title: String,
    Description: String,
    Category: String,
    UthorID: String,
    Date: String,
    Image: String, 
    Ingredients: [{
        ProductName: String,
        ProductQuantity: Number,
        WeightType: String
    }],
    Instructions: Array,
    Rating: [{
        Stars: Number,
        Review: String,
        Date_Review: String,
        User: String
    }]
});



const recipeModel = mongoose.model("recipes", recipeSchema);

exports.recipeModel = recipeModel;


// const ProductSchema = new mongoose.Schema({
//     Products: [{
//         item: {
//             ProductName: String,
//             ProductQuantity: Number,
//             WeightType: String
//         }
//     }]
// });

// const ProducteModel = mongoose.model("recipes", ProductSchema);

// exports.ProducteModel = ProducteModel;

// const stepsSchema = new mongoose.Schema({
//     Steps: [{
//         step: String
//     }]
// });

// const stepsModel = mongoose.model("recipes", stepsSchema);

// exports.stepsModel = stepsModel;

