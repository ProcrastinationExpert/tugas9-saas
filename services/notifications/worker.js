require("dotenv").config();
const { connectToRabbitMQ } = require("./config/mq.js");
const {
  processNotification,
} = require("./controllers/notificationController.js");

async function startWorker() {
  try {
    const { channel } = await connectToRabbitMQ();
    const queue = "post_mentions";

    await channel.assertQueue(queue, { durable: true });
    console.log(
      `🔃 Menunggu pesan di antrean '${queue}'. Tekan CTRL+C untuk keluar.`,
    );

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const notification = JSON.parse(msg.content.toString());
        console.log("\n----------------------------------------");
        console.log(
          "ℹ️  Pesan Baru Diterima dari Post ID:",
          notification.post_id,
        );

        await processNotification(notification);

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("❌ Terjadi kesalahan pada Worker:", error);
  }
}

startWorker();
