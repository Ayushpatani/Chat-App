const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017/websocket";

const connectToMongo = ()=>{
    mongoose.connect(mongoURI)
    .then(()=>console.log("database is connected."));
}

module.exports = connectToMongo;