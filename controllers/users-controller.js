const HttpError = require("../models/http-error");
const {validationResult} = require("express-validator");

const Users = require("../models/user");

const getAllUsers = async (req, res, next) => {
    console.log("GET request in /users");

    try {
        const users = await Users.find({}, "-password").exec();
        res.status(200).json({users: users.map((user) => user.toObject({getters: true}))});

    } catch(err) {
        const error = new HttpError("Something went wrong", 500);
        return next(error);
    }


}

const signup = async (req, res, next) => {
    console.log("POST request in /signup");

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new HttpError("Invalid inputs passed. Please check data.", 422);
        return next(error);
    }

    const {name, email, password, image} = req.body;
    let existingUser = null;

    try{
        existingUser = await Users.findOne({email: email}).exec();

        if(existingUser) {
            const error = new HttpError("User already exists. Login instead", 422);
            return next(error);
        }

        const newUser = new Users({
            name: name,
            email: email,
            password: password,
            image: image,
            places: []
        });

        await newUser.save();

        return res.status(201).json({newUser: newUser.toObject({getters: true})});

    } catch(err) {
        console.log(err);
        const error = new HttpError("Something went wrong", 500);
        return next(error);
    }


}

const login = async (req, res, next) => {
    console.log("POST request in /:login");

    const {email, password} = req.body;

    try {
        const user = await Users.findOne({email: email}).exec();

        if(!user || user.password !== password){
            const error = new HttpError("Could not verify user credentials.", 404);
            return next(error);
        }

        return res.json({user});
    } catch(err) {
        const error = new HttpError("Something went wrong", 500);
        return next(error);
    }
}


module.exports = {
    getAllUsers: getAllUsers,
    signup: signup,
    login: login,
}