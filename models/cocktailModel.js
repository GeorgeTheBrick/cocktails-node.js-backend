const mongoose = require("mongoose");

const ingredientsSchema = new mongoose.Schema({
  name: { type: String },
  measure: { type: String },
});

const cocktailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A cocktail must have a name."],
    trim: true,
    unique: true,
    maxlength: [40, "Name must be shorter than 40 characters. "],
  },

  id: { type: String },
  image: { type: String },
  ingredients: { type: [ingredientsSchema] },
  instructions: { type: String },
  alcoholic: Boolean,
  createdBy: String,
});

const Cocktail = mongoose.model("Cocktail", cocktailSchema);

module.exports = Cocktail;
