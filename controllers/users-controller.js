const HttpError = require("../models/http-error");
const {validationResult} = require("express-validator");

const DUMMY_USERS = [
    {
        id: "u1",
        name: "User01",
        email: "test@test.com",
        password: "Test1234",
        places: 4
    },
    {
        id: "u2",
        name: "User02",
        email: "test2@test.com",
        password: "Test1235",
        places: 2
    },
];

const getAllUsers = (req, res, next) => {
    console.log("GET request in /users");

    if(DUMMY_USERS.length === 0){
        const error = new HttpError("Could not find any users", 404);
        return next(error);
    }

    res.status(200).json({users: DUMMY_USERS});
}

const signup = (req, res, next) => {
    console.log("POST request in /signup");

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new HttpError("Invalid inputs passed. Please check data.", 422);
        return next(error);
    }

    const {username, email, password} = req.body;

    const userExists = DUMMY_USERS.find((user) => {
        return user.email === email;
    });

    if(userExists){
        const error = new HttpError("This user already exists", 422);
        return next(error);
    }

    const newUser = {
        id: `u${DUMMY_USERS.length + 1}`,
        name: username,
        email: email,
        password: password,
        places: 0
    }

    DUMMY_USERS.push(newUser);

    return res.status(201).json({newUser});
}

const login = (req, res, next) => {
    console.log("POST request in /:login");

    const {email, password} = req.body;

    const user = DUMMY_USERS.find((user) => {
        return user.email === email;
    });

    if(!user || user.password !== password){
        const error = new HttpError("Could not verify user credentials.", 404);
        return next(error);
    }

    return res.json({user});
}


module.exports = {
    getAllUsers: getAllUsers,
    signup: signup,
    login: login,
}