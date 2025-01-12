const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = 5678;
const AI_TEMP_URL = "http://ai_temp:1234/ai/temp";

app.use(cors());
app.use(express.json());

app.post("/ai/request", async (req, res) => {
    try {
        const { query } = req.body;
        const response = await axios.get(AI_TEMP_URL);

        res.json(response.data);
    } catch (error) {
        console.error("Ошибка при обработке запроса:", error);
        res.status(500).json({ error });
    }
});

app.listen(PORT, () => {
    console.log(`Сервис /ai/request запущен на ${AI_TEMP_URL}${PORT}`);
});
