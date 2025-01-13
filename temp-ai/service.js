const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 1234;

app.use(cors());

app.get("/ai/temp", (req, res) => {
    res.json({ test: "ok" });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
