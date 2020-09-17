const HttpError = require("../models/http-error");
const {validationResult} = require("express-validator");

const DUMMY_PLACES = [
    {
        id: "p1",
        title: "Empire State Building",
        description: "One of the most famous sky scrapers in the world!",
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: "20 W 34th St, New York, NY 10001",
        creator: "u1"
    },
    {
        id: "p2",
        title: "Empire Slate Building",
        description: "One of the most infamous sky scrapers in the world!",
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: "21 W 34th St, New York, NY 10001",
        creator: "u1"
    }
]

const addPlace = (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new HttpError("Invalid inputs passed. Please check data.", 422);
        return next(error);
    }

    console.log("POST request in places");

    const {title, description, coordinates, address, creator} = req.body;

    const place = {
        id: `p${DUMMY_PLACES.length + 1}`,
        title: title,
        description: description,
        location: coordinates,
        address: address,
        creator: creator
    }

    DUMMY_PLACES.push(place);

    res.status(201).json({place});
}

const getPlaceById = (req, res, next) => {
    console.log("GET request in /:placeId");

    const id = req.params.placeId;

    const place = DUMMY_PLACES.find((place) => {
        return place.id === id;
    });

    if(!place){
        const error = new HttpError("Could not find a place for the provided ID.", 404);
        return next(error);
    }

    return res.json({place});
}

const updatePlaceById = (req, res, next) => {
    console.log("PATCH request in /:placeId");

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new HttpError("Invalid inputs passed. Please check data.", 422);
        return next(error);
    }

    const id = req.params.placeId;
    const {title, description} = req.body;

    const place = DUMMY_PLACES.find((place) => {
        return place.id === id;
    });

    if(!place){
        const error = new HttpError("Could not find any places for the provided ID.", 404);
        return next(error);
    }

    const updatedPlace = {
        ...place,
        title: title,
        description: description
    }

    const index = DUMMY_PLACES.findIndex((place) => {
        return place.id === id;
    });

    DUMMY_PLACES[index] = updatedPlace;

    return res.json({updatedPlace});
}

const deletePlaceById = (req, res, next) => {
    console.log("DELETE request in /:placeId");

    const id = req.params.placeId;
    const place = DUMMY_PLACES.find((place) => {
        return place.id === id;
    });

    if(!place){
        const error = new HttpError("Could not find any places for the provided ID.", 404);
        return next(error);
    }

    const index = DUMMY_PLACES.findIndex((place) => {
        return place.id === id;
    });

    DUMMY_PLACES.splice(index, 1);

    return res.json({DUMMY_PLACES});
}

const getPlacesByUserId = (req, res, next) => {
    console.log("GET request in user/:userId");

    const id = req.params.userId;

    const places = DUMMY_PLACES.filter((place) => {
        return place.creator === id;
    });

    if(places.length === 0){
        const error = new HttpError("Could not find any places for the provided User ID.", 404);
        return next(error);
    }

    return res.json({places});
}

module.exports = {
    getPlaceById: getPlaceById,
    getPlacesByUserId: getPlacesByUserId,
    addPlace: addPlace,
    updatePlaceById: updatePlaceById,
    deletePlaceById: deletePlaceById
}