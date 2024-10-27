const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    UserID: { type: String, unique: true, required: true },
    UserEmail: { type: String, unique: true, required: true },
    Name: { type: String },
    Bamboo: { type: Number, min: 0, default: 10 },
    PandaSize: { type: Number, min: 0, default: 150 },
    ProfilePicture: { type: String },
    "CreatedAt": Date,
    "Preferences": {
        "ReadingLevel": Number,
        "VoiceAssistance": Boolean
    }
});

module.exports = mongoose.model("users", Schema);