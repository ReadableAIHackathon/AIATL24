const User = require('../models/User');

module.exports = async (filter, options) => {
    // Check if the user exists
    const existingUser = await User.findOne({ UserEmail: filter.UserEmail });

    if (!existingUser) {
        return null; // or throw an error if needed
    }

    // Prepare the update fields dynamically
    const updatedFields = {};

    if (filter.Name) updatedFields.Name = filter.Name;
    if (filter.Bamboo !== undefined) updatedFields.Bamboo = filter.Bamboo;
    if (filter.PandaSize !== undefined) updatedFields.PandaSize = filter.PandaSize;
    if (filter.ProfilePicture) updatedFields.ProfilePicture = filter.ProfilePicture;

    if (filter.Preferences?.ReadingLevel !== undefined) {
        updatedFields["Preferences.ReadingLevel"] = filter.Preferences.ReadingLevel;
    }

    // Perform the update only on the existing document
    const updatedUser = await User.findOneAndUpdate(
        { UserEmail: filter.UserEmail }, // Match by email
        { $set: updatedFields }, // Only update specific fields
        {
            new: true,   // Return the updated document
            upsert: false, // Ensure that it does not create a new document
        }
    );

    return updatedUser;
};
