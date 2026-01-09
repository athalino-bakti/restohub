# RestoHub - Microservices Restaurant Management System

Sistem manajemen restoran berbasis microservices yang lengkap, dibangun dengan Node.js, GraphQL, Docker, dan Kubernetes untuk skalabilitas dan maintainability yang optimal.

## 🏗️ Arsitektur

Proyek ini mengimplementasikan arsitektur microservices dengan komponen berikut:

### Microservices (5 Layanan)

- **Product Service**: Manajemen produk/menu restoran
- **User Service**: Autentikasi dan manajemen pengguna
- **Order Service**: Pemrosesan pesanan
- **Payment Service**: Pengelolaan pembayaran
- **Inventory Service**: Pelacakan stok/inventori

### Komponen Infrastruktur

- **API Gateway**: Apollo Gateway untuk GraphQL Federation (unified GraphQL endpoint)
- **Frontend**: React dengan Apollo Client dan Material-UI
- **Databases**: MongoDB untuk setiap microservice
- **Caching Layer**: Redis untuk performa
- **Message Broker**: RabbitMQ untuk async communication
- **Container Orchestration**: Docker Compose dan Kubernetes

## 📋 Services dan Ports

| Service           | Port  | Fungsi                        |
| ----------------- | ----- | ----------------------------- |
| Frontend          | 3000  | React application             |
| API Gateway       | 4000  | Unified GraphQL endpoint      |
| Product Service   | 4001  | Manajemen produk              |
| User Service      | 4002  | Autentikasi & user management |
| Order Service     | 4003  | Pemrosesan pesanan            |
| Payment Service   | 4004  | Manajemen pembayaran          |
| Inventory Service | 4005  | Pelacakan stok                |
| MongoDB           | 27017 | Database                      |
| Redis             | 6379  | Caching                       |
| RabbitMQ          | 5672  | Message broker                |
| RabbitMQ UI       | 15672 | RabbitMQ Management Console   |

## Setup & Development

### Prerequisites

- Docker dan Docker Compose
- Node.js 18+ (untuk development lokal)
- kubectl (untuk Kubernetes deployment)
- Git

### Mode 1: Development Lokal (Recommended untuk Development)

#### Setup Awal:

1. Clone repository dan install dependencies:

```bash
# Install dependencies untuk setiap service
npm install

# Atau setup individual services
cd product-service && npm install && cd ..
cd user-service && npm install && cd ..
cd order-service && npm install && cd ..
cd payment-service && npm install && cd ..
cd inventory-service && npm install && cd ..
cd api-gateway && npm install && cd ..
cd frontend && npm install && cd ..
```

2. Setup infrastructure services menggunakan Docker:

```bash
# Start MongoDB
docker run -d --name mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:5.0

# Start Redis
docker run -d --name redis -p 6379:6379 redis:7.0-alpine

# Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=password \
  rabbitmq:3-management-alpine
```

3. Jalankan services dalam terminal terpisah atau gunakan process manager:

```bash
# Terminal 1 - Product Service
cd product-service && npm run dev

# Terminal 2 - User Service
cd user-service && npm run dev

# Terminal 3 - Order Service
cd order-service && npm run dev

# Terminal 4 - Payment Service
cd payment-service && npm run dev

# Terminal 5 - Inventory Service
cd inventory-service && npm run dev

# Terminal 6 - API Gateway
cd api-gateway && npm run dev

# Terminal 7 - Frontend
cd frontend && npm start
```

**Akses Aplikasi:**

- Frontend: http://localhost:3000
- GraphQL API: http://localhost:4000/graphql
- RabbitMQ Management: http://localhost:15672 (user: admin, pass: password)

### Mode 2: Docker Compose

Menjalankan seluruh stack dengan docker-compose:

```bash
# Build dan jalankan semua services
docker-compose up --build

# atau tanpa rebuild
docker-compose up

# Jalankan di background
docker-compose up -d --build

# Lihat logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Akses Aplikasi:**

- Frontend: http://localhost:3000
- API Gateway GraphQL: http://localhost:4000/graphql
- RabbitMQ Management UI: http://localhost:15672
  - Username: admin
  - Password: admin

### Mode 3: Kubernetes Deployment (Production)

#### Prerequisites:

- Kubernetes cluster (minikube, Docker Desktop, atau cloud provider)
- kubectl configured

#### Deployment:

1. Setup secrets:

```bash
kubectl apply -f k8s/secret.yaml
```

2. Deploy infrastructure services:

```bash
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/rabbitmq-deployment.yaml
```

3. Deploy microservices:

```bash
kubectl apply -f product-service/k8s/
kubectl apply -f user-service/k8s/
kubectl apply -f order-service/k8s/
kubectl apply -f payment-service/k8s/
kubectl apply -f inventory-service/k8s/
kubectl apply -f api-gateway/k8s/
kubectl apply -f frontend/k8s/
```

4. Check deployment status:

```bash
# Lihat semua pods
kubectl get pods

# Lihat services
kubectl get services

# Lihat ingress
kubectl get ingress

# Lihat logs dari pod tertentu
kubectl logs -f deployment/product-service
```

#### Cleanup:

```bash
# Delete semua resources
./cleanup-k8s.ps1

# Atau manual
kubectl delete -f k8s/
kubectl delete -f product-service/k8s/
kubectl delete -f user-service/k8s/
kubectl delete -f order-service/k8s/
kubectl delete -f payment-service/k8s/
kubectl delete -f inventory-service/k8s/
kubectl delete -f api-gateway/k8s/
kubectl delete -f frontend/k8s/
```

kubectl get ingress

````

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
````

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

## 🔐 Environment Variables

Setiap service menggunakan environment variables berikut:

- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection URL
- `RABBITMQ_URL` - RabbitMQ connection URL
- `PORT` - Service port
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT token secret
- `API_GATEWAY_URL` - URL untuk API gateway

## 📊 Monitoring

### Local Development

- RabbitMQ Management UI: http://localhost:15672 (user: admin, pass: admin)
- MongoDB: mongodb://admin:password@localhost:27017
- Redis CLI: `docker exec -it redis redis-cli`

### Kubernetes

```bash
# Access Kubernetes Dashboard
kubectl proxy
# Then navigate to: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

# View pod metrics
kubectl top pods

# View node metrics
kubectl top nodes
```

## 🛠️ Project Structure

```
restohub/
├── api-gateway/
│   ├── src/server.js
│   ├── k8s/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.js
│   └── k8s/
├── product-service/
├── user-service/
├── order-service/
├── payment-service/
├── inventory-service/
├── k8s/
├── docker-compose.yml
├── deploy-k8s.ps1
├── cleanup-k8s.ps1
└── README.md
```

## ✨ Features

### ✅ Implemented

- [x] Microservices architecture dengan 5 services
- [x] GraphQL API Federation via Apollo Gateway
- [x] User authentication & authorization dengan JWT
- [x] Product management & catalog
- [x] Order processing system
- [x] Payment integration
- [x] Inventory/stock management
- [x] RabbitMQ async messaging
- [x] Redis caching layer
- [x] Docker containerization
- [x] Kubernetes deployment
- [x] React frontend dengan Material-UI
- [x] MongoDB database per service

## 🚨 Troubleshooting

### Services tidak connect

```bash
# Check pod status
kubectl get pods

# View logs
kubectl logs -f deployment/product-service

# Describe pod
kubectl describe pod pod-name
```

### Database connection issues

```bash
# Verify MongoDB is running
docker ps | grep mongodb

# Seed database
cd product-service && npm run seed
```

### Port conflicts (Windows)

```bash
# Find process using port
netstat -ano | findstr :4000

# Kill process
taskkill /PID <PID> /F
```

## 📝 Notes

- Setiap microservice memiliki MongoDB database terpisah
- Inter-service communication via GraphQL Federation
- Async communication via RabbitMQ
- Caching dengan Redis
- JWT untuk authentication
- Environment-specific config di containers
