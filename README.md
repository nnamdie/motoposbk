# Multi-tenant EPOS Backend

A comprehensive multi-tenant Electronic Point of Sale (EPOS) system built with NestJS, TypeScript, MikroORM, and PostgreSQL.

## Features

- **Multi-tenancy**: Each business is a separate tenant with isolated data
- **Role-based Access Control (RBAC)**: Flexible permissions system
- **Inventory Management**: Stock tracking, reservations, and pre-sales
- **Order Management**: In-stock and pre-order handling
- **Payment Processing**: Multiple payment provider adapters (Paystack, etc.)
- **Notifications**: WhatsApp and SMS notifications
- **File Storage**: S3-compatible storage for images and documents
- **API Documentation**: Swagger/OpenAPI integration

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with MikroORM
- **Authentication**: JWT-based auth
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd multi-tenant-epos
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the database (using Docker):
```bash
docker-compose up postgres -d
```

5. Run database migrations:
```bash
npm run migration:up
```

6. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3011/api`
Swagger documentation at `http://localhost:3011/api/docs`

### Using Docker

To run the entire application with Docker:

```bash
docker-compose up -d
```

## Project Structure

The project follows the folder structure outlined in `FOLDER_STRUCTURE.md`:

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── config/                 # Configuration files
├── common/                 # Shared components
├── health/                 # Health check module
├── migrations/             # Database migrations
└── <feature-modules>/      # Feature modules
```

## API Endpoints

### Business Registration
- `POST /api/business/register` - Register a new business

### Authentication
- `POST /api/business/:businessId/login` - Member login
- `POST /api/business/:businessId/refresh` - Refresh token

### Business Management
- `GET /api/business/:businessId/profile` - Get business profile
- `PUT /api/business/:businessId/profile` - Update business profile

### Inventory
- `POST /api/business/:businessId/items` - Create item
- `GET /api/business/:businessId/items` - List items
- `POST /api/business/:businessId/items/:itemId/stock` - Add stock

### Orders
- `POST /api/business/:businessId/orders` - Create order
- `GET /api/business/:businessId/orders` - List orders
- `POST /api/business/:businessId/orders/:orderId/invoice` - Create invoice

### Payments
- `POST /api/business/:businessId/payments/webhook/:provider` - Payment webhook

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Operations

```bash
# Create migration
npm run migration:create

# Run migrations
npm run migration:up

# Rollback migration
npm run migration:down

# Check migration status
npm run migration:list
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Environment Variables

Key environment variables (see `.env.example` for complete list):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `PAYSTACK_SECRET_KEY` - Paystack API secret
- `AWS_S3_BUCKET` - S3 bucket for file storage

## Contributing

1. Follow the established folder structure in `FOLDER_STRUCTURE.md`
2. Write tests for new features
3. Update documentation as needed
4. Follow TypeScript and NestJS best practices

## License

This project is licensed under the MIT License.
