import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, Stack } from "@mui/material";
import io from "socket.io-client";

import "./App.css";

function App() {
  const [textMessage, setTextMessage] = useState("");
  const [isLogIn, setIsLogIn] = useState(false);
  const [nickname, setNickname] = useState("");

  const [messagesFromCurrentUser, setMessagesFromCurrentUser] = useState<
    {
      user: string;
      message: string;
    }[]
  >([]);

  const websocket_host =
    process.env.REACT_APP_WEBSOCKET_HOST || "http://localhost:3000";
  const socket = io(websocket_host, { transports: ["websocket"] });

  console.log("websocket_host===>", websocket_host);

  socket.on("login_server", (responseFromServer) => {
    sessionStorage.setItem(
      "client_id_room",
      responseFromServer?.client_id_room
    );
  });

  socket.on("log_out_other_user", (responseFromServer) => {
    console.log("log_out_other_user");
    init();
    socket.disconnect();
  });

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    socket.on(
      "message_server",
      (message_server: { message: string; user: string }) => {
        const currentMessages = sessionStorage.getItem(
          "MessagesFromCurrentUser"
        )
          ? JSON.parse(
              sessionStorage.getItem("MessagesFromCurrentUser") || "[]"
            )
          : messagesFromCurrentUser;
        const msgs = [
          ...currentMessages,
          { user: message_server.user, message: message_server.message },
        ];
        sessionStorage.setItem("MessagesFromCurrentUser", JSON.stringify(msgs));
        setMessagesFromCurrentUser(msgs);
        setTextMessage("");
      }
    );
  }, [socket]);

  const logOut = () => {
    console.log(
      "sessionStorage.getItem(client_id_room)====>",
      sessionStorage.getItem("client_id_room")
    );
    socket.emit("log_out", {
      client_id_room: sessionStorage.getItem("client_id_room"),
    });
    init();
    socket.disconnect();
  };

  const init = () => {
    setIsLogIn(false);
    sessionStorage.clear();
  };

  const sendMessage = () => {
    console.log(
      "sessionStorage.getItem(client_id_room)===>",
      sessionStorage.getItem("client_id_room")
    );
    socket.emit("clientMessage", {
      message: textMessage,
      user: nickname,
      client_id_room: sessionStorage.getItem("client_id_room"),
    });
  };

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
      noValidate
      autoComplete="off"
    >
      <Stack spacing={2} direction="row">
        <TextField
          id="outlined-required"
          label="nickname"
          onChange={(value) => setNickname(value.target.value)}
        />
        {!isLogIn && (
          <Button
            variant="contained"
            onClick={() => {
              setIsLogIn(true);
              socket.emit("log_in", { client_id: socket.id });
            }}
          >
            Connect
          </Button>
        )}
        {isLogIn && (
          <Button variant="contained" color="error" onClick={logOut}>
            Disconnect
          </Button>
        )}
      </Stack>
      <div>
        <div>
          <div className="chat">
            {messagesFromCurrentUser.map((msg, index) => (
              <div key={index}>
                <div>
                  <b>{msg.user}</b>: {msg.message}
                </div>
              </div>
            ))}
          </div>
          <div className="input">
            <TextField
              id="outlined-multiline-static"
              label="Message"
              multiline
              rows={4}
              value={textMessage}
              onChange={(e) => {
                setTextMessage(e.target.value);
              }}
            />
            <Button variant="contained" onClick={sendMessage}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </Box>
  );
}

export default App;
