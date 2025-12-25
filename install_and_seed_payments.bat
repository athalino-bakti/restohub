@echo off
cd payment-service
npm install
set MONGODB_URI=mongodb://admin:password@localhost:27017/paymentdb?authSource=admin
set REDIS_URL=redis://localhost:6379
set RABBITMQ_URL=amqp://admin:password@localhost:5672
node src/seed.js
