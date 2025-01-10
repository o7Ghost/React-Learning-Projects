import express from "express";
import cors from "cors";
import { EventEmitter } from "events";

const app = express();
const PORT = 3000;

app.use(cors());

const myEmitter = new EventEmitter();

const intervalId = setInterval(() => {
  const message = { data: "Hello from the server!" };
  myEmitter.emit("notification", message);
}, 5000);

// learn from https://shaxadd.medium.com/effortless-real-time-updates-in-react-with-server-sent-events-a-step-by-step-guide-using-node-js-52ecff6d828e
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  myEmitter.on("notification", (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  });

  req.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
