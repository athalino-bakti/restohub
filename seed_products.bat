@echo off
cd product-service
set MONGODB_URI=mongodb://admin:password@localhost:27017/productdb?authSource=admin
node src/seed.js
