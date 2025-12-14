import express from "express";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Anchor backend is alive");
});

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
