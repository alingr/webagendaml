var mongoose = require('mongoose');
var moment = require('moment');

var currentDate = moment().format('YYYY-MM-DD');

module.exports = mongoose.model('Todo', {
    text: {
        type: String,
        default: ''
    },
    priority: {
        type: String,
        default: 'low'
    },
    dueDate: {
        type: Date,
        default: null
    },
    isDone: {
        type: Boolean,
        default: false
    }
});