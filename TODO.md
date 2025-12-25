- [ ] Implement product service
- [ ] Implement order service
- [ ] Implement payment service
- [ ] Implement inventory service
- [ ] Implement user service
- [ ] Implement API gateway
- [ ] Implement frontend
- [ ] Set up Kubernetes deployment
- [ ] # Set up Docker Compose

# TODO

- [x] Create dummy data for products
- [x] Create dummy data for orders
- [x] Create dummy data for payments
- [x] Create dummy data for inventory
- [ ] Implement product service
- [ ] Implement order service
- [ ] Implement payment service
- [ ] Implement inventory service
- [ ] Implement user service
- [ ] Implement API gateway
- [ ] Implement frontend
- [ ] Set up Kubernetes deployment
- [ ] Set up Docker Compose

## Dummy Data Seeding

Dummy data has been created and tested for all services. To seed the databases with dummy data:

1. Ensure MongoDB, Redis, and RabbitMQ are running (use `docker-compose up -d mongodb redis rabbitmq`).
2. Run the batch files in the root directory:

   ```bash
   .\seed_products.bat
   .\seed_orders.bat
   .\install_and_seed_payments.bat
   .\install_and_seed_inventory.bat
   ```

   Or use Docker Compose to run the services and seed data.
