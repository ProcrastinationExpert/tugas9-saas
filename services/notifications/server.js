const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { authenticateToken } = require("./middlewares/auth.js");
const { getNotifications } = require("./controllers/notificationController.js");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get("/api/notifications", authenticateToken, getNotifications);

app.listen(PORT, () => {
  console.log(`Notification Service berjalan di http://localhost:${PORT}`);
});
