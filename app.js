const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-route");
const usersRoutes = require("./routes/users-route");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError("Could not find this error", 404);
    next(error);
})

app.use((err, req, res, next) => {
    if(res.headerSent) {
        return next(err);
    }

    res.status(err.code || 500).json({
        message: err.message || "Unknown error occurred!"
    });
});


mongoose.connect("mongodb://Stotteh-PC:27017,Stotteh-PC:27018,Stotteh-PC:27019?replicaSet=rs?retryWrites=false", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})
.then(() => {
    app.listen(5000, () => {
        console.log("Server listening on port 5000");
    });
})
.catch((err) => {
    console.log(err);
});

