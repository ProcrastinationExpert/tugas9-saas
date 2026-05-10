const { query } = require("../config/db.js");

async function getNotifications(req, res) {
  try {
    const userId = req.user.sub;

    const notifications = await query(
      "SELECT n.id, n.post_id, n.sender_id, u.username AS sender_username, p.content, " +
        "p.created_at AS post_created_at, p.updated_at AS post_updated_at, " +
        "n.is_read, n.created_at, n.updated_at " +
        "FROM notifications n LEFT JOIN users u ON n.sender_id = u.id LEFT JOIN posts p ON n.post_id = p.id " +
        "WHERE n.user_id = ? ORDER BY n.created_at DESC",
      [userId],
    );

    notifications.forEach((notif) => {
      // check if the content is not null
      if (!notif.content) {
        notif.content = "[Konten tidak tersedia]";
        return;
      }

      // check if the content is updated
      const isEdited =
        notif.post_created_at &&
        notif.post_updated_at &&
        new Date(notif.post_updated_at).getTime() >
          new Date(notif.post_created_at).getTime();

      // add ... to notif if the content is too long
      if (notif.content.length > 100) {
        notif.content = notif.content.substring(0, 100) + "...";
      }

      if (isEdited) {
        notif.content += " [Diedit]";
      }
    });

    res.status(200).json({
      status: true,
      message: "Berhasil mengambil semua notifikasi",
      data: notifications,
    });
  } catch (error) {
    console.error("❌ Error saat mengambil notifikasi:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

async function readAllNotifications(req, res) {
  try {
    const userId = req.user.sub;

    await query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [userId],
    );

    res.status(200).json({
      status: true,
      message: "Seluruh notifikasi berhasil dibaca.",
    });
  } catch (error) {
    console.error("❌ Error saat membaca notifikasi:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

async function processNotification(notification) {
  try {
    const mentionRegex = /@([^\s@]+)/g;
    const mentionedUsernames = new Set();
    let matches;

    while ((matches = mentionRegex.exec(notification.content)) !== null) {
      const username = matches[1].replace(/[.,!?;:)\]}]+$/, "");

      if (username) {
        mentionedUsernames.add(username);
      }
    }

    if (mentionedUsernames.size === 0) {
      return;
    }

    console.log(
      "ℹ️  Mention ditemukan untuk user:",
      [...mentionedUsernames].join(", "),
    );

    for (const username of mentionedUsernames) {
      const users = await query("SELECT id FROM users WHERE username = ?", [
        username,
      ]);
      if (users.length > 0) {
        const targetUserId = users[0].id;
        await query(
          "INSERT INTO notifications (user_id, sender_id, post_id, is_read, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
          [targetUserId, notification.sender_id, notification.post_id, false],
        );
        console.log(
          `✅ Notifikasi berhasil dibuat untuk ID User: ${targetUserId}`,
        );
      }
    }
  } catch (error) {
    console.error("❌ Error saat memproses notifikasi:", error);
    throw error;
  }
}

module.exports = {
  getNotifications,
  processNotification,
  readAllNotifications,
};
