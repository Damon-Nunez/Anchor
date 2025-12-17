import express from "express";
import cors from "cors";
import registerRoute from './auth/register/route';
import loginRoute from './auth/login/route';

const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Anchor backend is alive");
});

app.use("/auth", registerRoute);
app.use("/auth", loginRoute);


const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
