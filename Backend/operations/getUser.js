const { v4: uuidv4 } = require('uuid');
const User = require('../models/User')

module.exports = async (filter, options) => {
    let user = (await User.findOne({ UserEmail: filter.UserEmail }));
    if (user?.UserID || user?.UserEmail) return user;
    else {
        user = {
            UserID: uuidv4(),
            UserEmail: filter.UserEmail,
            Name: filter.Name,
            Bamboo: 10,
            PandaSize: 150,
            ProfilePicture: filter?.ProfilePicture,
            "CreatedAt": new Date().toISOString(),
            "Preferences": {
                "ReadingLevel": 5
            }
        }
        await new User(user).save();
        return user;
    }
}