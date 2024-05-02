const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediumHighScore = new Schema({
    name: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
})

const MediumHighScores = mongoose.model('medium-high-scores', MediumHighScore);
module.exports = MediumHighScores;