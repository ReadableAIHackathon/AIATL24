const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    "ContentID": { type: String, unique: true },
    "SectionID": String,
    SectionNumber: Number,
    QuizID: Number,
    Questions: [{
        QuestionID: Number,
        Question: String,
        Options: [{
            "Option": String,
            AnswerID: Number
        }],
        CorrectAnswer: String,
        Score: Number
    }]
});

module.exports = mongoose.model("quizes", Schema);