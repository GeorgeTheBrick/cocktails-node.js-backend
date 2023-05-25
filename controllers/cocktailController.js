const mongoose = require("mongoose");
const Cocktail = require("../models/cocktailModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.randomCocktail = catchAsync(async (req, res, next) => {
  let cocktails;
  if (req.query.alcoholic === "true") {
    cocktails = await Cocktail.find({ alcoholic: true });
  } else if (req.query.alcoholic === "false") {
    cocktails = await Cocktail.find({ alcoholic: false });
  } else {
    cocktails = await Cocktail.find();
  }

  const randomIndex = Math.trunc(Math.random() * cocktails.length);

  const randomId = cocktails.filter((el, i) => {
    return i === randomIndex;
  });

  const cocktail = await Cocktail.findOne({ _id: randomId });

  res.status(200).json({
    status: "success",
    cocktail,
  });
});

exports.searchCocktails = catchAsync(async (req, res, next) => {
  if (!req.query.search) {
    return next();
  }

  const allCocktails = await Cocktail.find();
  const cocktails = allCocktails.filter((cocktail) => {
    return (
      cocktail.name.toLowerCase().includes(req.query.search) ||
      cocktail.ingredients
        .filter((ing) => ing.name.toLowerCase().includes(req.query.search))
        .join("")
    );
  });

  if (cocktails.length < 1) {
    return next(new AppError("No cocktails found!", 404));
  }

  res.status(200).json({
    status: "success",
    cocktails,
  });
});

exports.getAllCocktails = catchAsync(async (req, res, next) => {
  const cocktails = await Cocktail.find();
  res.status(200).json({
    status: "success",
    results: cocktails.length,
    cocktails,
  });
});

exports.getCocktail = catchAsync(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("No cocktail with that ID", 404));
  }

  const query = Cocktail.findById(req.params.id);
  const cocktail = await query;
  cocktail.cocktailKey = process.env.OPENAI_KEY;

  if (!cocktail) {
    return next(new AppError("No cocktail with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    cocktail,
  });
});

exports.getMyCocktails = catchAsync(async (req, res, next) => {
  const cocktails = await Cocktail.find({ createdBy: req.headers.id });

  if (!cocktails || cocktails.length < 1) {
    return next(new AppError("You have not created any cocktails yet.", 404));
  }

  res.status(200).json({
    status: "success",
    results: cocktails.length,
    cocktails,
  });
});

exports.createCocktail = catchAsync(async (req, res, next) => {
  const cocktail = await Cocktail.create(req.body);
  const currentUser = await User.findById(req.body.createdBy);
  const createdCocktail = await Cocktail.find({ name: req.body.name });
  const cocktailID = createdCocktail[0]._id.valueOf();
  currentUser.myCocktails.push(cocktailID);
  await User.findByIdAndUpdate(req.body.createdBy, currentUser);

  res.status(201).json({
    status: "success",
    cocktail,
  });
});

exports.updateCocktail = catchAsync(async (req, res, next) => {
  const cocktail = await Cocktail.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!cocktail) {
    return next(new AppError("No cocktail with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    cocktail,
  });
});

exports.deleteCocktail = catchAsync(async (req, res, next) => {
  const deletedCocktail = await Cocktail.findById(req.params.id);
  const currentUser = await User.findById(deletedCocktail.createdBy);
  const index = currentUser.myCocktails.indexOf(deletedCocktail._id.valueOf());
  currentUser.myCocktails.splice(index, 1);
  await User.findByIdAndUpdate(deletedCocktail.createdBy, currentUser);

  const cocktail = await Cocktail.findByIdAndDelete(req.params.id);

  if (!cocktail) {
    return next(new AppError("No cocktail with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    cocktail: null,
  });
});
