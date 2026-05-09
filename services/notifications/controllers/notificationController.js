const { query } = require("../config/db.js");

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
  processNotification,
};
