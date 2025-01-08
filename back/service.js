const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 5678;
const AI_TEMP_URL = process.env.AI_TEMP_URL || "http://localhost:1234/ai/temp";

app.use(express.json());

app.post("/ai/request", async (req, res) => {
    try {
        const requestBody = req.body;

        const response = await axios.get(AI_TEMP_URL);
        res.json(response.data);
    } catch (error) {
        console.error("Ошибка при обработке запроса:", error);
        res.status(500).json({ error: "Ошибка при обработке запроса" });
    }
});

app.listen(PORT, () => {
    console.log(`Сервис /ai/request запущен на http://localhost:${PORT}`);
});
