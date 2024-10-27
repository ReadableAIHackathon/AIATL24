const calculatePoints = require("../methods/points"); // Import the points function
const User = require("../models/User"); // Import the Users model

module.exports = async ({UserEmail, ExpectedText, TranscribedText, Level}) => {
    try {
        // Fetch the user's data to get their ReadingLevel
        const user = await User.findOne({ UserEmail: UserEmail });
        if (!user) throw new Error("User not found");

        // Get the similarity score (1 or 0) from points.js
        const similarityScore = await calculatePoints(ExpectedText, TranscribedText);

        // Calculate points to increment based on similarityScore and ReadingLevel
        const incrementAmount = similarityScore * Level;

        // Update the user's Bamboo by incrementing it with the calculated amount
        const updatedUser = await User.findOneAndUpdate(
            { UserEmail: UserEmail },
            { $inc: { Bamboo: incrementAmount } },
            { new: true }
        );

        return updatedUser; // Return the updated user document
    } catch (error) {
        console.error("Error incrementing points:", error);
        throw error;
    }
};