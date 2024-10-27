const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    "UserID": String,
    "ContentID": { type: String, unique: true },
    "CurrentSectionID": String,
    "CurrentSectionNumber": Number,
    "ReadingLevel": Number,
    "Completed": Boolean,
    "LastAccessed": Date,
    "QuizResults": [
        {
            "SectionID": Number,
            "Score": Number,
            "Timestamp": Date,
            "QuizID": Number,
            Answers: [{
                QuestionID: Number,
                UserAnswer: Number,
                Score: Number
            }]
        }
    ]
});

module.exports = mongoose.model("progress", Schema);