const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    validate: [
      (value) => {
        return value.length <= 120
      }, 'Title is too long (120 max)'
    ],
    default: 'New Post'
  },
  text: String,
  published: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    set: (value) => {
      return value.toLowerCase().replace(' ', '-');
    }
  }
});

articleSchema.static({
  list: function(callback) {
    this.find({}, null, {sort: {_id: -1}}, callback);
  }
});

module.exports = mongoose.model('Article', articleSchema);
