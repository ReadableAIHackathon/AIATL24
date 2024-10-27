const ContentProgress = require('../models/ContentProgress')

module.exports = async (filter, options) => {
    return (await ContentProgress.findOne(filter))
}