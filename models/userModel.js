const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema(
  {
    socketID: {
      type: String
    },
    username: {
      type: String
    }
  }
);

let User = mongoose.model("Users", usersSchema);

module.exports = User;
