const express = require("express");
const axios = require("axios");
const cors = require("cors");
const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data");

const app = express();
const PORT = 5678;
const AI_URL = "http://ai:8000/generate-caption/";

const REQUEST_QUEUE_NAME = "requestQueue";
const RESPONSE_QUEUE_NAME = "responseQueue";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let channel;
let connection;

const pendingRequests = new Map();

async function connectRabbitMQ() {
    try {
        console.log("Подключение к RabbitMQ...");
        connection = await amqp.connect("amqp://rabbitmq:5672");
        channel = await connection.createChannel();

        await channel.assertQueue(REQUEST_QUEUE_NAME, { durable: true });

        await channel.assertQueue(RESPONSE_QUEUE_NAME, { durable: false });

        console.log("Соединение с RabbitMQ установлено и очереди созданы.");
        processQueue();
    } catch (error) {
        console.error("Ошибка подключения к RabbitMQ:", error);

        setTimeout(connectRabbitMQ, 5000);
    }
}

app.post("/ai/request", async (req, res) => {
    try {
        const { image } = req.body;

        if (!channel) {
            return res.status(500).json({ error: "RabbitMQ канал не инициализирован." });
        }

        if (!image) {
            return res
                .status(200)
                .json({ error: "Спасибо, что отправили нам текст! Но сейчас мы работаем только с картинками)" });
        }

        const correlationId = uuidv4();

        const responsePromise = new Promise((resolve, reject) => {
            pendingRequests.set(correlationId, { resolve, reject });

            setTimeout(() => {
                if (pendingRequests.has(correlationId)) {
                    reject(new Error("Превышено время ожидания ответа"));
                    pendingRequests.delete(correlationId);
                }
            }, 30000);
        });

        await channel.sendToQueue(REQUEST_QUEUE_NAME, Buffer.from(JSON.stringify({ image })), {
            persistent: true,
            correlationId,
            replyTo: RESPONSE_QUEUE_NAME,
        });

        console.log("Сообщение отправлено в очередь с изображением.");

        const response = await responsePromise;
        res.json(response);
    } catch (error) {
        console.error("Ошибка при обработке запроса:", error);
        res.status(500).json({ error: error.message });
    }
});

async function processQueue() {
    if (!channel) {
        console.error("Канал RabbitMQ не доступен для обработки очереди.");
        return;
    }

    const { queue } = await channel.assertQueue(RESPONSE_QUEUE_NAME, { durable: false });

    console.log(`Очередь ответов (${queue}) готова.`);

    channel.consume(
        queue,
        (msg) => {
            const correlationId = msg.properties.correlationId;

            if (pendingRequests.has(correlationId)) {
                const { resolve } = pendingRequests.get(correlationId);
                resolve(JSON.parse(msg.content.toString()));
                pendingRequests.delete(correlationId);
            } else {
                console.error(`Ответ с correlationId ${correlationId} не найден в ожидании.`);
            }
            channel.ack(msg);
        },
        { noAck: false }
    );

    channel.consume(
        REQUEST_QUEUE_NAME,
        async (msg) => {
            if (msg !== null) {
                const { image } = JSON.parse(msg.content.toString());
                try {
                    const buffer = Buffer.from(image, "base64");

                    const formData = new FormData();

                    formData.append("file", buffer, {
                        filename: "image.png",
                        contentType: "image/png",
                    });

                    const response = await axios.post(AI_URL, formData, {
                        headers: formData.getHeaders(),
                    });

                    console.log("Ответ от AI:", response.data);

                    console.log(
                        `Отправляем ответ в очередь ${msg.properties.replyTo} с correlationId ${msg.properties.correlationId}`
                    );

                    channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response.data)), {
                        correlationId: msg.properties.correlationId,
                    });

                    channel.ack(msg);
                } catch (error) {
                    console.error("Ошибка при запросе к AI сервису:", error);
                    channel.nack(msg);
                }
            }
        },
        { noAck: false }
    );
}

connectRabbitMQ().catch((err) => {
    console.error("Ошибка при инициализации RabbitMQ:", err);
});

app.listen(PORT, () => {
    console.log(`Сервис /ai/request запущен на порту ${PORT}`);
});
