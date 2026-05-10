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

app.use((req, res, next) => {
  console.log(`\n[REQUEST MASUK] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(
  "/api/register",
  createProxyMiddleware({
    target: coreServiceUrl,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/auth/register" },
  }),
);

app.use(
  "/api/login",
  createProxyMiddleware({
    target: coreServiceUrl,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/auth/login" },
  }),
);

app.use(
  "/api/logout",
  createProxyMiddleware({
    target: coreServiceUrl,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/auth/logout" },
  }),
);

app.use(
  "/api/profile",
  createProxyMiddleware({
    target: coreServiceUrl,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/auth/me" },
  }),
);

app.use(
  "/api/posts",
  createProxyMiddleware({
    target: coreServiceUrl,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/posts/" },
  }),
);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: coreServiceUrl,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/users/" },
  }),
);

app.use(
  "/api/notifications",
  createProxyMiddleware({
    target: notificationServiceUrl,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/notifications/" },
  }),
);

app.use((req, res) => {
  res.status(404).json({ status: false, message: "Endpoint tidak ditemukan" });
});

app.listen(PORT, () => {
  console.log(`Gateway berjalan di http://localhost:${PORT}`);
});
