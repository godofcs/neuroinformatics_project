import React, { useState } from "react";
import axios from "axios";

const ChatApp = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSendMessage = async () => {
        if (inputValue.trim() === "") return;

        setIsSending(true);

        const userMessage = { type: "text", content: inputValue, sender: "user" };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        setInputValue("");

        const responseMessage = await getServerResponse(inputValue);
        setMessages((prevMessages) => [...prevMessages, responseMessage]);

        setIsSending(false);
    };

    const getServerResponse = async (userInput) => {
        if (userInput.toLowerCase().includes("video")) {
            return { type: "video", content: "https://www.w3schools.com/html/mov_bbb.mp4", sender: "server" };
        } else if (userInput.toLowerCase().includes("gif")) {
            return {
                type: "gif",
                content: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
                sender: "server",
            };
        } else if (userInput.toLowerCase().includes("image")) {
            return {
                type: "image",
                content: "https://cdn1.flamp.ru/36b29769ceae3a4fc5d88670949e670a.jpg",
                sender: "server",
            };
        } else {
            try {
                const response = await axios.post("http://localhost:5678/ai/request", { query: userInput });
                return { type: "text", content: response.data.test || "Ответ не найден", sender: "server" };
            } catch (error) {
                console.error("Ошибка при запросе:", error);
                return { type: "text", content: "Ошибка сервера. Попробуйте еще раз.", sender: "server" };
            }
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={{ color: "white" }}>AI CHAT</h1>
            <div style={styles.chatBox}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.message,
                            alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
                            backgroundColor: message.sender === "user" ? "#DCF8C6" : "#FFFFFF",
                        }}
                    >
                        {message.type === "text" && message.content}
                        {message.type === "video" && (
                            <video controls style={styles.video}>
                                <source src={message.content} type="video/mp4" />
                                Ваш браузер не поддерживает тег видео.
                            </video>
                        )}
                        {message.type === "gif" && <img src={message.content} alt="GIF" style={styles.image} />}
                        {message.type === "image" && <img src={message.content} alt="img" style={styles.image} />}
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={styles.inputContainer}>
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={styles.textarea}
                        placeholder="Введите запрос..."
                        disabled={isSending}
                    />
                </div>
                <button onClick={handleSendMessage} style={styles.button} disabled={isSending}>
                    {isSending ? "Отправка..." : "Отправить"}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
    },
    chatBox: {
        display: "flex",
        flexDirection: "column",
        width: "700px",
        height: "600px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        overflowY: "scroll",
        backgroundColor: "#e5ddd5",
    },
    message: {
        maxWidth: "70%",
        margin: "5px 0",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "14px",
        wordWrap: "break-word",
    },
    video: {
        maxWidth: "100%",
        borderRadius: "8px",
    },
    image: {
        maxWidth: "100%",
        borderRadius: "8px",
    },
    inputContainer: {
        display: "flex",
        marginTop: "10px",
        width: "600px",
    },
    textarea: {
        flex: 1,
        padding: "10px",
        fontSize: "14px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        outline: "none",
        resize: "none",
        height: "80px",
    },
    button: {
        width: "115px",
        height: "40px",
        padding: "10px 20px",
        fontSize: "14px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#007bff",
        color: "#fff",
        cursor: "pointer",
    },
};

export default ChatApp;
