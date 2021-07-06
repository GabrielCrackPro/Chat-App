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
  const getUserID = () => {
    return `#${socket.id}`;
  };
  users.push({
    connectedOn: getTime(),
    id: socket.id,
  }); // Save user data
  io.emit("chat message", `Welcome to chat room, ${getOnlineUsers(users)}`);
  io.emit(
    "chat message",
    `[Chat Bot 🤖]Your ID is ${getUserID()},connection established at ${getTime()}`
  );
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
      `[Chat Bot 🤖]: user ${socket.id} has left the chat at ${
        (getTime(), getOnlineUsers(users))
      }`
    );
    users.pop(); // Delete user data
    //When someone lefts the chat
  });

  socket.on("chat message", (msg) => {
    messageHistory.push({ msg, messageCount }); //Save messages
    messageCount++;
    switch (msg) {
      case "/link": //Show chat links
        for (let i = 0; i <= messageHistory.length; i++) {
          getLink(messageHistory[i]);
        }
        break;
      case "/history": //Show message history
        io.emit("chat message", "--- Previous Messages ---");
        io.emit(
          "chat message",
          `[Chat Bot 🤖]: ${getMessageHistory()} at ${getTime()}`
        );
        break;
      case "/users": //Show online users
        getOnlineUsers(users);
        break;
      case "/help": //Show all commands
        io.emit("chat message", "--- Chat Commands ---");
        io.emit("chat message", "/history - See previous messages");
        io.emit("chat message", "/link - Check messages that contain a link");
        io.emit("chat message", "/users - Show online users");
        io.emit("chat message", "/help - See this list");
        io.emit("chat message", "More commands will be added in the future");
        break;
      default:
        //Show messages
        console.log(`user ${getUserID()} says ${msg} at ${getTime()}`);
        io.emit(
          "chat message",
          `${messageCount} - [👨🏻‍💻]user ${getUserID()} says: ${msg} at ${getTime()}`
        );
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
const getOnlineUsers = (users) => {
  return `users online: ${users.length}`;
};
const getLink = (msg) => {
  const link = `<a href="${msg}">${msg}</a>`;
  io.emit("chat message", link);
};
http.listen(port, () => {
  console.log(`🚀 Chat running at http://localhost:${port}/`);
});
