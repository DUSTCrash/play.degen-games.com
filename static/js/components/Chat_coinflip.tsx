import React, { useEffect, useState } from "react";

import axios from "axios";

import TextareaAutosize from "react-textarea-autosize";

import { useDispatch, useSelector } from "react-redux";

import Countdown from "react-countdown";
import Svg from "react-inlinesvg";

import "../css/Chat.css";
import User from "../interfaces/User";
import { CombinedReducer } from "../store";
import { createAvatar } from "@dicebear/avatars";
import * as avatarStyle from "@dicebear/adventurer";
import { toast } from "react-toastify";
import { Sockets } from "../reducers/sockets";
import { Link } from "react-router-dom";
import Message from "../interfaces/Message";
import { useRef } from "react";
import { displayName } from "../utils/displayName";

function Chat_coinflip() {
  const messagesRef = useRef<null | HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const dispatch = useDispatch();
  const user = useSelector<CombinedReducer, User>((state) => state.user);
  const sockets = useSelector<CombinedReducer, Sockets>(
    (state) => state.sockets
  );

  const sendMessage = async () => {
    if (message.length === 0) return toast.error("Message can not be empty");

    try {
      await axios.post("/api/message", { content: message });
      dispatch({ type: "UPDATE_USER_LAST_MESSAGE_AT" });
    } catch (e: any) {
      toast.error(e.response.data.message.toString());
    }

    setMessage("");
  };

  const scrollMessagesToBottom = () => {
    if (!messagesRef.current) return;

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  };

  const inputMessage = (content: string) => {
    const contentWords = content.split(" ").map((c) => c.trim());

    setMessage(contentWords.join(" "));
  };

  useEffect(() => {
    const getLast = async () => {
      const messages = (await axios.get("/api/message/last")).data;
      console.log({ messages });

      setMessages(messages);
    };

    getLast();
    scrollMessagesToBottom();
  }, []);

  useEffect(() => {
    scrollMessagesToBottom();
  }, [messages]);

  useEffect(() => {
    if (!sockets.message) return;

    sockets.message.on("newMessage", (message: Message) => {
      setMessages((old) => [message, ...old]);
    });
  }, [sockets]);

  return (
    <div className="Chat Chat_coinflip box_coinflip">
      <div className="chat">
        <h2 className="chatHeader_coinflip">Live Chat</h2>
        <div ref={messagesRef} className="messages">
          {Array.isArray(messages) &&
            messages
              .map((message) => (
                <div key={message._id} className="message">
                  <div className="sender">
                    <img className="avatar" src="/img/masterchip.png" />
                    <Link
                      to={`/u/${message.creator.publicKey}`}
                      className="address profileLink"
                    >
                      {displayName(message.creator)}:
                    </Link>
                    <div className="content">
                      <p className="text"> {message.content}</p>
                    </div>
                  </div>
                </div>
              ))
              .reverse()}
        </div>
        <div className="inputMessage">
          {user ? (
            Date.now() - user.lastMessageAt > 3000 ? (
              <>
                <TextareaAutosize
                  onChange={(event) =>
                    inputMessage((event.target as HTMLTextAreaElement).value)
                  }
                  onKeyPress={(event) =>
                    event.key === "Enter" ? sendMessage() : null
                  }
                  value={message}
                  placeholder="Type Message..."
                />
                <button onClick={() => sendMessage()} className="sendMsgB">
                  <Svg src="/img/send.svg" />
                </button>
              </>
            ) : (
              <>
                <TextareaAutosize
                  onChange={(event) =>
                    inputMessage((event.target as HTMLTextAreaElement).value)
                  }
                  onKeyPress={(event) =>
                    event.key === "Enter" &&
                    Date.now() - user.lastMessageAt > 3000
                      ? sendMessage()
                      : null
                  }
                  value={message}
                  placeholder="Type Message..."
                />
                <Countdown
                  date={user.lastMessageAt + 3000}
                  intervalDelay={0}
                  precision={1}
                  renderer={(time) =>
                    time.seconds + time.milliseconds > 0 ? (
                      <button className="sendMsgB">
                        {time.seconds}.{time.milliseconds / 100}
                      </button>
                    ) : (
                      <button
                        onClick={() => sendMessage()}
                        className="sendMsgB"
                      >
                        <Svg src="/img/send.svg" />
                      </button>
                    )
                  }
                />
              </>
            )
          ) : (
            <h4>You have to Log In</h4>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat_coinflip;
