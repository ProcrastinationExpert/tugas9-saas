const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const coreServiceUrl = process.env.CORE_SERVICE_URL || "http://localhost:3002";
const notificationServiceUrl =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3003";

app.use(cors());

app.use(
  "/api/register",
  createProxyMiddleware({ target: coreServiceUrl, changeOrigin: true }),
);
app.use(
  "/api/login",
  createProxyMiddleware({ target: coreServiceUrl, changeOrigin: true }),
);
app.use(
  "/api/posts",
  createProxyMiddleware({ target: coreServiceUrl, changeOrigin: true }),
);
app.use(
  "/api/notifications",
  createProxyMiddleware({ target: notificationServiceUrl, changeOrigin: true }),
);

app.use((req, res) => {
  res.status(404).json({ status: false, message: "Endpoint tidak ditemukan" });
});

app.listen(PORT, () => {
  console.log(`Gateway berjalan di http://localhost:${PORT}`);
});
