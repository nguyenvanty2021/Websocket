import io from "socket.io-client";

import "bootstrap/dist/css/bootstrap.css";
import "./style.css";
import React from "react";
import ReactDOM from "react-dom";
import { useEffect, useState } from "react";
import moment from "moment";

const username = prompt("what is your username");
// này là địa chỉ ip or domain của server
const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});

const App = ({}) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Bước 1: gửi username user vừa nhập lên cho server
    socket.on("connect", () => {
      socket.emit("username", username);
    });
    // Bước 2: server sẽ respon về cho client trạng thái kết nối, nhận data respon từ server vs key là "connected"
    socket.on("connected", (user) => {
      console.log(user);
    //  setUsers((users) => [...users, user]);
    });
    // Bước 3: nhận data respon từ server vs key là "users"
    socket.on("users", (users) => {
      console.log(users);
      // mỗi username gửi lên server, server sẽ lưu lại dưới dạng array và respon về cho client -> 1 user là 1 obj trong array
      setUsers(users);
    });
    // Bước 5: nhận data respon từ server vs key là "message"
    socket.on("message", (message) => {
      console.log(message);
      // server respon object message về cho client, mỗi lần server respon vậy client lưu lại vào mảng
      setMessages((messages) => [...messages, message]);
    });
    // Bước 6: nhận data respon từ server vs key là "disconnected"
    socket.on("disconnected", (id) => {
      console.log(id)
      // mỗi lần user nào tắt tab browser (disconnection) thì server sẽ respon id của user đó
      setUsers((users) => {
        return users.filter((user) => user.id !== id);
      });
    });
  }, []);
  const submit = (event) => {
    event.preventDefault();
    // Bước 4: gửi message input lên cho server
    socket.emit("send", message);
    setMessage("");
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 mt-4 mb-4">
          <h6>Hello {username}</h6>
        </div>
      </div>
      <div className="row">
        <div className="col-md-8">
          <h6>Messages</h6>
          <div id="messages">
            {messages.map(({ user, date, text }, index) => (
              <div key={index} className="row mb-2">
                <div className="col-md-3">
                  {moment(date).format("h:mm:ss a")}
                </div>
                <div className="col-md-2">{user.name}</div>
                <div className="col-md-2">{text}</div>
              </div>
            ))}
          </div>
          <form onSubmit={submit} id="form">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                onChange={(e) => setMessage(e.currentTarget.value)}
                value={message}
                id="text"
              />
              <span className="input-group-btn">
                <button id="submit" type="submit" className="btn btn-primary">
                  Send
                </button>
              </span>
            </div>
          </form>
        </div>
        <div className="col-md-4">
          <h6>Users</h6>
          <ul id="users">
            {users.map(({ name, id }) => (
              <li key={id}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
