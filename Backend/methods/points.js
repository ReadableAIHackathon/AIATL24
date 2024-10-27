const undici = require('undici');

module.exports = async (expected_text, transcribed_text, duration) => {
    const data = await undici.request(`http://localhost:8040/calculate_similarity`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            expected_text: expected_text,
            transcribed_text: transcribed_text
        })
    });

    return (await data.body.json())?.Score;
};
