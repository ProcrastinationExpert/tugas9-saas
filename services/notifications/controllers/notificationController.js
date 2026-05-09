const { query } = require("../config/db.js");

async function getNotifications(req, res) {
  try {
    const userId = req.user.sub;
    const [notifications] = await query(
      "SELECT n.id, n.post_id, n.sender_id, n.is_read, n.created_at, u.username AS sender_username " +
        "FROM notifications n JOIN users u ON n.sender_id = u.id " +
        "WHERE n.user_id = ? ORDER BY n.created_at DESC",
      [userId],
    );

    if (!notifications) {
      return res
        .status(404)
        .json({ status: false, message: "Tidak ada notifikasi" });
    }

    console.log("notifikasi:", notifications);
    const unreadMentions =
      (Array.isArray(notifications) &&
        notifications.filter((n) => n.is_read === 0)) ||
      [notifications].filter((n) => n.is_read === 0);
    if (unreadMentions.length > 0) {
      console.log(
        `ℹ️  Anda memiliki ${unreadMentions.length} notifikasi baru!`,
      );
      await query(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
        [userId],
      );
    }

    res.status(200).json({
      status: true,
      message: "Berhasil mengambil notifikasi",
      data: notifications,
    });
  } catch (error) {
    console.error("❌ Error saat mengambil notifikasi:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

async function processNotification(notification) {
  try {
    const mentionRegex = /@(\w+)/g;
    const mentionedUsernames = [];
    let matches;

    while ((matches = mentionRegex.exec(notification.content)) !== null) {
      mentionedUsernames.push(matches[1]);
    }

    if (mentionedUsernames.length == 0) {
      return;
    }

    console.log(
      "ℹ️  Mention ditemukan untuk user:",
      mentionedUsernames.join(", "),
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
};
