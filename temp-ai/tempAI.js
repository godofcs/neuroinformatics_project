const express = require("express");
const app = express();
const PORT = 1234;

// Обработчик маршрута для URL /ai/temp
app.get("/ai/temp", (req, res) => {
    res.json({ test: "ok" });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
