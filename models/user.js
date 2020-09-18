const mongoose = require("mongoose");
const validator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 8},
    image: {type: String, required: true },
    places: [{type: mongoose.Types.ObjectId, ref: "Place"}]
});

userSchema.plugin(validator);

const Users = mongoose.model("User", userSchema);

module.exports = Users;