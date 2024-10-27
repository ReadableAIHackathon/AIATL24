const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    ContentID: { type: String, unique: true },
    "Title": String,
    "Author": String,
    "Metadata": {
        "CoverPage": String,
        "PublishedDate": Date
    },
    TotalSections: Number,
    "Sections": [
        {
            "SectionID": { type: String, unique: true },
            SectionNumber: Number,
            "OriginalText": String,
            SubLevelText: [{
                Level: Number,
                Text: String
            }]
        }
    ]
});

module.exports = mongoose.model("contents", Schema);