const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    set: (value) => {
      return value.trim().toLowerCase();
    },
    validate: [
      (email) => {
        return (email.match(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i) != null);
      }, 'Invalid email'
    ]
  },
  password: String,
  admin: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('User', userSchema);
