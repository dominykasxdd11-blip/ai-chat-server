import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

/* ===== ПРОВЕРКА СЕРВЕРА ===== */
app.get("/", (req, res) => {
  res.send("🔥 AI News server работает!");
});

/* ===== AI ENDPOINT ===== */
app.post("/ai", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.json({ answer: "❗ Напиши вопрос" });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Нет OPENAI_API_KEY");
      return res.json({
        answer: "⚠️ Сервер не настроен (нет API ключа)"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Ты полезный ИИ-помощник." },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    /* ❗ ПРОВЕРКА ОТВЕТА OPENAI */
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI error:", errorText);

      return res.json({
        answer: "⚠️ ИИ временно недоступен. Попробуй позже.",
      });
    }

    const data = await response.json();

    const answer =
      data?.choices?.[0]?.message?.content ??
      "🤖 Я не смог сформировать ответ";

    res.json({ answer });

  } catch (error) {
    console.error("🔥 SERVER CRASH:", error);

    /* ❌ НИКОГДА НЕ 500 */
    res.json({
      answer: "⚠️ Произошла ошибка, но сервер жив 🙂",
    });
  }
});

/* ===== ЗАПУСК ===== */
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});
