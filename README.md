# RestoHub - Microservices Restaurant Management System

A complete microservices-based restaurant management system built with Node.js, GraphQL, Docker, and Kubernetes.

## Architecture

- **5 Microservices**: Product, User, Order, Payment, Inventory
- **API Gateway**: Apollo Gateway for GraphQL Federation
- **Frontend**: React with Apollo Client and Material-UI
- **Databases**: MongoDB for each service
- **Caching**: Redis
- **Message Broker**: RabbitMQ
- **Orchestration**: Docker Compose and Kubernetes

## Services

- **Product Service** (Port 4001): Manages restaurant products
- **User Service** (Port 4002): Handles user authentication and management
- **Order Service** (Port 4003): Processes orders
- **Payment Service** (Port 4004): Manages payments
- **Inventory Service** (Port 4005): Tracks stock levels
- **API Gateway** (Port 4000): Unified GraphQL endpoint
- **Frontend** (Port 3000): React application

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- kubectl (for Kubernetes deployment)

### Mode Development (Local)

1. Install dependencies for each service:

```bash
cd product-service && npm install
cd ../user-service && npm install
cd ../order-service && npm install
cd ../payment-service && npm install
cd ../inventory-service && npm install
cd ../api-gateway && npm install
cd ../frontend && npm install
```

2. Start infrastructure services:

```bash
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:5.0
docker run -d --name redis -p 6379:6379 redis:7.0-alpine
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=password rabbitmq:3-management-alpine
```

3. Start each service:

```bash
cd product-service && npm run dev &
cd user-service && npm run dev &
cd order-service && npm run dev &
cd payment-service && npm run dev &
cd inventory-service && npm run dev &
cd api-gateway && npm run dev &
cd frontend && npm start &
```

### Mode Docker Compose

1. Build and start all services:

```bash
docker-compose up --build
```

2. Access the application:

- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000/graphql
- RabbitMQ Management: http://localhost:15672 (admin/admin)

### Mode Kubernetes

1. Apply Kubernetes manifests:

```bash
kubectl apply -f k8s/secret.yaml
kubectl apply -f product-service/k8s/
kubectl apply -f user-service/k8s/
kubectl apply -f order-service/k8s/
kubectl apply -f payment-service/k8s/
kubectl apply -f inventory-service/k8s/
kubectl apply -f api-gateway/k8s/
kubectl apply -f frontend/k8s/
```

2. Check deployment status:

```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

3. Access the application:

- Frontend: http://restohub.local (add to /etc/hosts: 127.0.0.1 restohub.local)
- API Gateway: http://restohub.local/graphql

## Features

- User authentication and registration
- Product catalog management
- Order processing
- Payment handling
- Inventory tracking
- Real-time updates via RabbitMQ
- Caching with Redis
- Responsive UI with Material-UI

## API Documentation

The GraphQL API is available at `/graphql` endpoint of each service and the API Gateway.

### Sample Queries

#### Get Products

```graphql
query {
  daftarProduk {
    id
    nama
    harga
    deskripsi
    kategori
  }
}
```

#### Create Product

```graphql
mutation {
  buatProduk(
    nama: "Nasi Goreng"
    harga: 25000
    deskripsi: "Nasi goreng spesial"
    kategori: "Makanan"
  ) {
    id
    nama
    harga
  }
}
```

## Environment Variables

Each service uses the following environment variables:

- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection URL
- `RABBITMQ_URL`: RabbitMQ connection URL
- `PORT`: Service port

## Monitoring

- RabbitMQ Management UI: http://localhost:15672
- Kubernetes Dashboard: `kubectl proxy` then http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests
5. Submit a pull request

## License

MIT License
