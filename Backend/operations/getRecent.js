const ContentHistory = require('../models/ContentHistory')

module.exports = async (filter, options) => {
    return (await ContentHistory.findOne(filter, options))
}