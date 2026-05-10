# NicePost Backend Service

NicePost adalah platform media sosial sederhana yang mengimplementasikan arsitektur microservices dengan fitur autentikasi JWT, CRUD postingan, dan sistem notifikasi asinkron menggunakan Message Broker.

## Arsitektur Sistem

Proyek ini terdiri dari empat komponen utama yang saling berintegrasi:

1.  **API Gateway (Node.js/Express):** Bertindak sebagai entry point tunggal (**Port 9123**). Gateway melakukan routing request ke service yang sesuai (Core atau Notification).
2.  **Core Service (Laravel):** Menangani logika bisnis utama seperti manajemen pengguna, autentikasi (JWT), dan CRUD postingan (**Port 9124**). Menggunakan database MySQL.
3.  **Message Broker (RabbitMQ):** Menangani komunikasi asinkron antara Core Service dan Notification Service melalui antrean `post_mentions`.
4.  **Notification Service (Node.js):** 
    *   **Worker:** Berjalan di latar belakang untuk mengonsumsi pesan dari RabbitMQ.
    *   **API Service:** Menyediakan endpoint untuk mengambil dan memperbarui status notifikasi (**Port 9125**).

## Skema Database

Entitas utama dalam sistem ini disimpan dalam database MySQL yang sama (atau terintegrasi):

*   **`users`**: Menyimpan data pengguna (`username`, `email`, `password`, `role`). Role: `admin`, `user`.
*   **`posts`**: Menyimpan konten postingan (`user_id`, `content`).
*   **`notifications`**: Menyimpan relasi notifikasi (`user_id` target, `sender_id`, `post_id`, `is_read`).

## Prasyarat (Prerequisites)

*   PHP >= 8.2 & Composer
*   Node.js >= 18.x & npm
*   MySQL Server
*   RabbitMQ Server
*   PM2 (untuk manajemen proses)

## Cara Menjalankan Service (Deployment)

### 1. Persiapan Environment
Pastikan Anda sudah menginstal dependensi di setiap folder service:
```bash
# Gateway
cd gateway && npm install && cd ..

# Core Service
cd services/cores
composer install
cp .env.example .env # Sesuaikan konfigurasi DB & RabbitMQ
php artisan key:generate
php artisan jwt:secret
php artisan migrate
cd ../..

# Notification Service
cd services/notifications && npm install && cd ../..
```

### 2. Menjalankan dengan PM2 (Recommended)
Sistem ini telah dikonfigurasi menggunakan `ecosystem.config.js` untuk memudahkan manajemen proses.

1.  **Install PM2** (jika belum ada):
    ```bash
    npm install -g pm2
    ```
2.  **Jalankan semua service sekaligus**:
    ```bash
    npx pm2 start ecosystem.config.js
    ```
3.  **Monitor status & log**:
    ```bash
    npx pm2 status
    npx pm2 logs
    ```

## Fitur Utama & Komponen

*   **Database**: Relasi antar entitas dengan validasi server-side.
*   **Keamanan**: JWT Authentication & Role-based Authorization (Admin/User).
*   **Asynchronous Processing**: Menggunakan RabbitMQ untuk menangani event mention secara asinkron.
*   **API Gateway**: Routing terpusat ke microservices internal.

## Dokumentasi API (Endpoints)

Base URL: `http://localhost:9123`

### Autentikasi & User
| Method | Endpoint | Header | Keterangan |
| :--- | :--- | :--- | :--- |
| POST | `/api/register` | - | Pendaftaran user baru |
| POST | `/api/login` | - | Login & dapatkan Token |
| POST | `/api/logout` | `Bearer <token>` | Logout |
| GET | `/api/profile` | `Bearer <token>` | Profile diri |
| GET | `/api/users` | `Bearer <token>` | List user (Admin Only) |

### Postingan (Posts)
| Method | Endpoint | Header | Keterangan |
| :--- | :--- | :--- | :--- |
| GET | `/api/posts` | `Bearer <token>` | List semua post |
| POST | `/api/posts` | `Bearer <token>` | Buat post (Trigger notif @mention) |
| GET | `/api/posts/{id}` | `Bearer <token>` | Detail post |
| PUT | `/api/posts/{id}` | `Bearer <token>` | Update post |
| DELETE | `/api/posts/{id}` | `Bearer <token>` | Hapus post |

### Notifikasi
| Method | Endpoint | Header | Keterangan |
| :--- | :--- | :--- | :--- |
| GET | `/api/notifications` | `Bearer <token>` | List notifikasi |
| GET | `/api/notifications/read-all` | `Bearer <token>` | Tandai semua terbaca |

---

### Contoh Response Sukses (Login)
```json
{
    "success": true,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
}
```
