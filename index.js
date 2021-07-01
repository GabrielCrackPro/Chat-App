const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public" + "/index.html");
});

//Socket connection managment
let userTotal = 0;
let messageCount = 0;
io.on("connection", (socket) => {
  userTotal++;
  console.log(`[Chat Bot 🤖]: user_${userTotal} connected at ${getTime()}`); //When someone loads the app
  io.emit(
    "chat message",
    `[Chat Bot 🤖]: user_${userTotal} has entered the chat at ${getTime()}`
  ); //When someone enters the chat
  socket.on("disconnect", () => {
    console.log(`[Chat Bot 🤖]: user disconnected at ${getTime()}`); //When someone closes the app
    io.emit(
      "chat message",
      `[Chat Bot 🤖]: user has left the chat at ${getTime()}`
    );
    userTotal--;
    //When someone lefts the chat
  });

  socket.on("chat message", (msg) => {
    messageHistory.push({ msg, messageCount }); //Save messages
    messageCount++;
    if (msg === "/h" || msg === "/history") {
      io.emit("chat message", "---Previous Messages---");
      io.emit(
        "chat message",
        ` [Chat Bot 🤖]: ${getMessageHistory()} at ${getTime()}`
      ); //See previous messages
    } else {
      console.log("message:", msg);
      io.emit(
        "chat message",
        `${messageCount} - [👨🏻‍💻] user says: ${msg} at ${getTime()}`
      ); //Show all messages
    }
  });
});

//Functions
const getTime = () => {
  let hours = new Date().getHours();
  let minutes = new Date().getMinutes();
  let seconds = new Date().getSeconds();

  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;

  return `${hours}:${minutes}:${seconds}`;
};
let messageHistory = [];
const getMessageHistory = () => {
  for (let i = 0; i <= messageHistory.length; i++) {
    io.emit(
      "chat message",
      `[Chat Bot 🤖] ${JSON.stringify(messageHistory[i])} at ${getTime()}`
    );
  }
  messageHistory = [];
};
http.listen(port, () => {
  console.log(`🚀 Chat running at http://localhost:${port}/`);
});
