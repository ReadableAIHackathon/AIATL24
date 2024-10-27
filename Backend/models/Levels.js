const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    "Level": Number,
    "Complexity": {
        "SentenceStructure": String,
        "VocabularyFamiliarity": String,
        "ConceptualDensity": String,
        "Cohesion": String
    },
    "Examples": Array,
    "Description": String
});

module.exports = mongoose.model("baselevels", Schema);