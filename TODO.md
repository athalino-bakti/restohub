# Docker Build Fixes

## Issues Identified

- Schema mismatch in payment-service: resolver has `prosesPembayaran`, schema has `buatPembayaran`
- Inconsistent schema building: user-service and payment-service use `makeExecutableSchema` instead of `buildSubgraphSchema`
- API Gateway can't load service definitions due to federation incompatibilities

## Tasks

- [x] Update payment-service schema.graphql to use `prosesPembayaran` mutation
- [x] Change payment-service server.js to use `buildSubgraphSchema`
- [x] Change user-service server.js to use `buildSubgraphSchema`
- [ ] Restart Docker services to verify fixes
