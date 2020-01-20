const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    sender: {
      type: String
    },
    reciever: {
      type: String
    },
    message: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

let Message = mongoose.model("messages", MessageSchema);

module.exports = Message;
