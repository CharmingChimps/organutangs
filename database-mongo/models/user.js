var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// User Schema
var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
    required: true
  },
  password: {
    type: String
  },
  friends: [String],
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
          newUser.password = hash;
          newUser.save(callback(err, newUser));
          console.log("THIS IS THE HASH ", hash);
          console.log("what is save ", newUser);
      });
  });
};

module.exports.getUserByUsername = function(username, callback){
  var query = {username: username};
  User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      if(err) throw err;
      callback(null, isMatch);
  });
};
