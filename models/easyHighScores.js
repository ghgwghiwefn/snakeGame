const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EasyHighScore = new Schema({
    name: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
})

const EasyHighScores = mongoose.model('easy-high-scores', EasyHighScore);
module.exports = EasyHighScores;