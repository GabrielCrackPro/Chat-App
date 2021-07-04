const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public" + "/index.html");
});

//Socket connection managment
let messageCount = 0;
let users = [];
io.on("connection", (socket) => {
  users.push({
    connectedOn: getTime(),
    id: socket.id,
  });
  io.emit("chat message", "Welcome to chat room");
  io.emit("chat message", `Your ID is #${socket.id}`);
  console.log(`[Chat Bot 🤖]: user connected at ${getTime()}`); //When someone loads the app
  socket.broadcast.emit(
    "chat message",
    `[Chat Bot 🤖]: user ${socket.id} has entered the chat at ${getTime()}`
  ); //When someone enters the chat
  socket.on("disconnect", () => {
    console.log(
      `[Chat Bot 🤖]: user ${socket.id} disconnected at ${getTime()}`
    ); //When someone closes the app
    io.emit(
      "chat message",
      `[Chat Bot 🤖]: user ${socket.id} has left the chat at ${getTime()}`
    );
    //When someone lefts the chat
  });

  socket.on("chat message", (msg) => {
    messageHistory.push({ msg, messageCount }); //Save messages
    messageCount++;
    if (msg === "/link") {
      for (let i = 0; i <= messageHistory.length; i++) {
        getLink(messageHistory[i]);
      }
    }
    if (msg === "/history") {
      io.emit("chat message", "---Previous Messages---");
      io.emit(
        "chat message",
        ` [Chat Bot 🤖]: ${getMessageHistory()} at ${getTime()}`
      ); //See previous messages
      if (msg === "/help") {
        io.emit("chat message", "---Available Commands----");
        io.emit(
          "chat message",
          `[Chat Bot 🤖] /history - Show previous messages`
        );
        io.emit("chat message", "/link -[Chat Bot 🤖] Show previous links");
      }
      if (msg === "/clear") {
        messageHistory = [];
        location.reload();
      }
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
const getLink = (msg) => {
  const link = `<a href="${msg}">${msg}</a>`;
  io.emit("chat message", link);
};
http.listen(port, () => {
  console.log(`🚀 Chat running at http://localhost:${port}/`);
});
