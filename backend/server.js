const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { nanoid } = require("nanoid");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/shorten", async (req, res) => {
  let { original } = req.body;

  if (!original.startsWith("http://") && !original.startsWith("https://")) {
    original = "https://" + original;
  }

  const shortCode = nanoid(6);

  const url = await prisma.url.create({
    data: {
      original,
      shortCode,
    },
  });

  res.json(url);
});

app.get("/id/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const url = await prisma.url.findUnique({
    where: { id },
  });

  if (!url) return res.status(404).json({ error: "Not found" });

  res.json({ original: url.original });
});

app.get("/date/:date", async (req, res) => {
  const date = new Date(req.params.date);

  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);

  const urls = await prisma.url.findMany({
    where: {
      createdAt: {
        gte: date,
        lt: nextDay,
      },
    },
  });

  res.json(urls);
});

app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  const url = await prisma.url.findUnique({
    where: { shortCode },
  });

  if (!url) return res.status(404).json({ error: "Not found" });

  res.redirect(url.original);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
