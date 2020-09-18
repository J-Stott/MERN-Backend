const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const {validationResult} = require("express-validator");
const Places = require("../models/place");
const Users = require("../models/user");

const addPlace = async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new HttpError("Invalid inputs passed. Please check data.", 422);
        return next(error);
    }

    console.log("POST request in places");

    try{
        const {title, description, location, image, address, creator} = req.body;

        let foundUser = await Users.findById(creator).exec();
        if(!foundUser){
            const error = new HttpError("User does not exist", 500);
            return next(error);
        }
    
        const place = {
            title: title,
            description: description,
            location: location,
            image: image,
            address: address,
            creator: foundUser._id
        }

        //used when saving multiple related documents
        //if one fails, roll back anything saved
        const session = await mongoose.startSession();

        session.startTransaction();
        const newPlace = new Places(place);
        await newPlace.save({session: session});
        foundUser.places.push(newPlace._id);
        await foundUser.save({session: session});

        await session.commitTransaction();

        return res.status(201).json({place: newPlace});
    } catch(err){
        console.log(err);
        const error = new HttpError("Could not create place", 500);
        return next(error);
    }

}

const getPlaceById = async (req, res, next) => {
    console.log("GET request in /:placeId");

    const id = req.params.placeId;
    let place = null;
    try{
        place = await Places.findOne({_id: id}).exec();

        if(!place) {
            const error = new HttpError("Could not find a place for the provided ID.", 500);
            return next(error);
        }

    } catch(err) {
        const error = new HttpError("Something went wrong for some reason", 500);
        return next(error);
    }

    return res.json({place: place.toObject( {getters: true}) });
}

const updatePlaceById = async (req, res, next) => {
    console.log("PATCH request in /:placeId");

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new HttpError("Invalid inputs passed. Please check data.", 422);
        return next(error);
    }

    const id = req.params.placeId;
    const {title, description} = req.body;
    let place = null;
    try{
        place = await Places.findOne({_id: id}).exec();
        
        if(!place){
            const error = new HttpError("Could not find any places for the provided ID.", 404);
            return next(error);
        }

        place.title = title;
        place.description = description;
        await place.save();

    }catch(err){
        const error = new HttpError("Could not update place.", 500);
        return next(error);
    }

    return res.json({updatedPlace: place.toObject({getters: true})});
}

const deletePlaceById = async (req, res, next) => {
    console.log("DELETE request in /:placeId");

    const id = req.params.placeId;

    try{
        const place = await Places.findById(id).populate("creator").exec();
        if(!place){
            const error = new HttpError("Could not find place for ID", 404);
            return next(error);
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        await place.remove({session: session});
        await place.creator.places.pull(place._id);
        await place.creator.save({session: session});
        await session.commitTransaction();

        return res.json({message: "delete was successful"});
    } catch(err) {
        console.log(err);
        const error = new HttpError("Something went wrong when attempting to delete a place.", 500);
        return next(error);
    }
}

const getPlacesByUserId = async (req, res, next) => {
    console.log("GET request in user/:userId");

    const id = req.params.userId;
    let places = null;
    try {
        places = await Places.find({creator: id}).exec();
    } catch(err) {
        const error = new HttpError("Something went wrong somewhere", 500);
        return next(error);
    }


    if(!places || places.length === 0){
        const error = new HttpError("Could not find any places for the provided User ID.", 404);
        return next(error);
    }

    return res.json({places: places.map((place) => place.toObject({getters: true}))});
}

module.exports = {
    getPlaceById: getPlaceById,
    getPlacesByUserId: getPlacesByUserId,
    addPlace: addPlace,
    updatePlaceById: updatePlaceById,
    deletePlaceById: deletePlaceById
}