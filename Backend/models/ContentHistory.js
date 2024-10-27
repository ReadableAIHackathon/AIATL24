const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    "UserID": String,
    "ContentID": { type: String, unique: true },
    History: [
        {
            SectionID: String,
            SectionNumber: Number,
            "Date": Date,
            "ReadingLevel": Number,
            "Completed": Boolean,
            "QuizResults": [
                {
                    "SectionID": Number,
                    "Score": Number,
                    "Timestamp": Date,
                    QuizID: Number,
                    Answers: [{
                        QuestionID: Number,
                        UserAnswer: Number,
                        Score: Number
                    }]
                }
            ]
        }
    ]
});

module.exports = mongoose.model("userlevels", Schema);
