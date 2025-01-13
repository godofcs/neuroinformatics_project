import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const ChatApp = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedImageBase64, setUploadedImageBase64] = useState(null);

    const chatBoxRef = useRef(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTo({
                top: chatBoxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputValue.trim() === "" && !uploadedImageBase64) return;

        setIsSending(true);

        const newMessages = [];

        if (inputValue.trim() && !uploadedImageBase64) {
            const userMessage = { type: "text", content: inputValue, sender: "user" };
            newMessages.push(userMessage);
        }

        if (uploadedImageBase64) {
            const imageMessage = {
                type: "image",
                content: `data:image/jpeg;base64,${uploadedImageBase64}`,
                sender: "user",
            };
            newMessages.push(imageMessage);
        }

        setMessages((prevMessages) => [...prevMessages, ...newMessages]);

        const data = uploadedImageBase64 ? { image: uploadedImageBase64 } : { message: inputValue };

        setInputValue("");
        setUploadedImage(null);
        setUploadedImageBase64(null);

        try {
            const response = await axios.post("http://localhost:5678/ai/request", data, {
                headers: { "Content-Type": "application/json" },
            });

            const responseMessage = {
                type: "text",
                content: response.data.caption || response.data.error || "Ответ не найден",
                sender: "server",
            };

            setMessages((prevMessages) => [...prevMessages, responseMessage]);
        } catch (error) {
            console.error("Ошибка при запросе:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: "text", content: "Ошибка сервера. Попробуйте еще раз.", sender: "server" },
            ]);
        }

        setIsSending(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "image/jpeg") {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(file);
                setUploadedImageBase64(reader.result.split(",")[1]);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Пожалуйста, загрузите файл в формате JPG.");
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
            <div ref={chatBoxRef} style={styles.chatBox}>
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
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexDirection: "row" }}>
                    <div style={styles.inputContainer}>
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={styles.textarea}
                            placeholder="Введите запрос..."
                            disabled={isSending || uploadedImageBase64}
                        />
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                        <button onClick={handleSendMessage} style={styles.button} disabled={isSending}>
                            {isSending ? "Отправка..." : "Отправить"}
                        </button>
                        <label style={styles.uploadButton}>
                            Загрузить
                            <input
                                type="file"
                                accept=".jpg"
                                onChange={handleImageUpload}
                                style={styles.fileInput}
                                disabled={isSending}
                            />
                        </label>
                    </div>
                </div>
                {uploadedImage ? (
                    <div style={{ ...styles.uploadedFileName, display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>Загружен файл: {uploadedImage.name}</span>
                        <button
                            onClick={() => setUploadedImage(null)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "red",
                                fontSize: "16px",
                                cursor: "pointer",
                            }}
                        >
                            ✖
                        </button>
                    </div>
                ) : (
                    <div style={{ height: "44px" }}></div>
                )}
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
        textAlign: "left",
        lineHeight: "1.5",
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
        backgroundColor: "#28a745",
        color: "#fff",
        cursor: "pointer",
    },
    uploadButton: {
        position: "relative",
        padding: "10px",
        fontSize: "14px",
        textAlign: "center",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#007bff",
        color: "#fff",
        cursor: "pointer",
    },
    fileInput: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        opacity: 0,
        cursor: "pointer",
    },
    uploadedFileName: {
        fontSize: "14px",
        color: "black",
        backgroundColor: "#e5ddd5",
        padding: "10px",
        borderRadius: "8px",
    },
};

export default ChatApp;
