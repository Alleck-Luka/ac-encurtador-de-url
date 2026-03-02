const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { nanoid } = require("nanoid");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const app = express();
const prisma = new PrismaClient();
const path = require("path");
const options = require("./swagger.json");

const swaggerSpec = swaggerJsdoc(options);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /shorten:
 *   post:
 *     summary: Cria uma nova URL encurtada
 *     description: Recebe uma URL original e gera um shortCode para acesso encurtado.
 *     tags:
 *       - URL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - original
 *             properties:
 *               original:
 *                 type: string
 *                 example: https://google.com
 *     responses:
 *       200:
 *         description: URL criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 original:
 *                   type: string
 *                   example: https://google.com
 *                 shortCode:
 *                   type: string
 *                   example: AbC123
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Requisição inválida
 */
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

/**
 * @swagger
 * /id/{id}:
 *   get:
 *     summary: Retorna a URL original pelo ID
 *     description: Busca uma URL encurtada utilizando seu ID numérico.
 *     tags:
 *       - URL
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da URL
 *     responses:
 *       200:
 *         description: URL encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 original:
 *                   type: string
 *                   example: https://google.com
 *       404:
 *         description: URL não encontrada
 */
app.get("/id/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const url = await prisma.url.findUnique({
    where: { id },
  });

  if (!url) return res.status(404).json({ error: "Not found" });

  res.json({ original: url.original });
});

/**
 * @swagger
 * /date/{date}:
 *   get:
 *     summary: Lista URLs criadas em uma data específica
 *     description: Retorna todas as URLs criadas na data informada (formato YYYY-MM-DD).
 *     tags:
 *       - URL
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: 2026-03-01
 *         description: Data no formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Lista de URLs criadas na data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   original:
 *                     type: string
 *                   shortCode:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
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

/**
 * @swagger
 * /{shortCode}:
 *   get:
 *     summary: Redireciona para a URL original
 *     description: Acessa a URL encurtada e redireciona o usuário para a URL original.
 *     tags:
 *       - URL
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código encurtado da URL
 *     responses:
 *       302:
 *         description: Redirecionamento para a URL original
 *       404:
 *         description: URL não encontrada
 */
app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  const url = await prisma.url.findUnique({
    where: { shortCode },
  });

  if (!url) return res.status(404).json({ error: "Not found" });

  res.redirect(url.original);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
