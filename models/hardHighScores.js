const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HardHighScore = new Schema({
    name: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
})

const HardHighScores = mongoose.model('hard-high-scores', HardHighScore);
module.exports = HardHighScores;