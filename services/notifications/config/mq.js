const ampq = require("amqplib");
require("dotenv").config();

async function connectToRabbitMQ() {
  try {
    const connection = await ampq.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    console.log("✅ Terhubung ke RabbitMQ");
    return { connection, channel };
  } catch (error) {
    console.error("❌ Gagal terhubung ke RabbitMQ:", error);
    throw error;
  }
}

module.exports = {
  connectToRabbitMQ,
};
