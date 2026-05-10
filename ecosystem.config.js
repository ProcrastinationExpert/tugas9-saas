module.exports = {
  apps: [
    {
      name: "gateway",
      script: "./gateway/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 9123,
        CORE_SERVICE_URL: "http://localhost:9124",
        NOTIFICATION_SERVICE_URL: "http://localhost:9125",
      },
    },
    {
      name: "cores-service",
      script: "artisan",
      cwd: "./services/cores",
      interpreter: "php",
      args: "serve --port=9124",
      env: {
        APP_ENV: "production",
        SERVER_PORT: 9124,
        RABBITMQ_HOST: "localhost",
        RABBITMQ_PORT: 5672,
        RABBITMQ_USER: "guest",
        RABBITMQ_PASSWORD: "guest",
        RABBITMQ_VHOST: "/",
        JWT_SECRET: "your_jwt_secret_here",
      },
    },
    {
      name: "notification-api",
      script: "./services/notifications/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 9125,
        DB_HOST: "localhost",
        DB_PORT: 4408,
        DB_USER: "root",
        DB_PASSWORD: "root",
        DB_NAME: "nicepost_db",
        JWT_SECRET: "your_jwt_secret_here",
      },
    },
    {
      name: "notification-worker",
      script: "./services/notifications/worker.js",
      env: {
        NODE_ENV: "production",
        RABBITMQ_URL: "amqp://localhost",
        DB_HOST: "localhost",
        DB_PORT: 4408,
        DB_USER: "root",
        DB_PASSWORD: "root",
        DB_NAME: "nicepost_db",
      },
    },
  ],
};
