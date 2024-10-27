const undici = require('undici');

module.exports = async (sublevels, target_level) => {
    const data = await undici.request(`http://localhost:8020/simplify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text_dict: sublevels,
            target_level: target_level
        })
    });

    return await data.body.json()
}
