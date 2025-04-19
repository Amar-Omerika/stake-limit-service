# Stake Limit Service

A RESTful API service that restricts devices accepting more stake than desired, preventing potential fraudulent behavior of staff members in retail locations.

## Features

- Process tickets with stake amount validation
- Monitor stake limits per device with customizable thresholds
- Implement three-tier status system: OK, HOT, BLOCKED
- Manage device configurations with validation
- API security with rate limiting and authentication
- Advanced filtering, sorting, and pagination for device retrieval

## Requirements

- Node.js (v18 or later)
- MongoDB
- Docker and Docker Compose (for containerized deployment)

## Quick Start

### Using Docker

1. Clone the repository
```bash
git clone https://github.com/Amar-Omerika/stake-limit-service.git
cd stake-limit-service
```

2. Start the application using Docker Compose
```bash
docker-compose up
```
The service will be available at http://localhost:3000

### Using Docker

1. Manual Setup
```bash
git clone https://github.com/Amar-Omerika/stake-limit-service.git
cd stake-limit-service
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables (create a .env file)
```bash
MONGODB_URI=mongodb://localhost:27017/stake-limit-service
API_KEY=your-secret-api-key
```

4. Start the application
```bash
npm start
```

## Testing
Run tests with Jest:
```bash
npm test
```
Run tests in watch mode:
```bash
npm run test:watch
```

## Development
Seed the database with sample data:
```bash
npm run seed
```

## API Documentation

1. Authentication 
(All API endpoints require an API key passed in the X-API-Key header:)
X-API-Key: your-api-key

### Endpoints

#### Process Ticket

Process a ticket stake and check against device limits.
POST /process-ticket
Request body:
```json
{
  "id": "e1372dd1-9c5f-4f5b-a797-51621a1fa348",
  "deviceId": "e1372dd1-9c5f-4f5b-a797-51621a1fa348",
  "stake": 14
}
```
Response:
```json
{
  "status": "OK" | "HOT" | "BLOCKED"
}
```

#### Create Device Configuration
POST /device-config
Request body:
```json
{
  "deviceId": "e1372dd1-9c5f-4f5b-a797-51621a1fa348", 
  "timeDuration": 1800,
  "stakeLimit": 999,
  "hotPercentage": 80,
  "restrictionExpires": 600
}
```

#### Update Device Configuration
PUT /device-config/:deviceId
Request body:
```json
{
  "timeDuration": 3600,
  "stakeLimit": 5000,
  "hotPercentage": 75,
  "restrictionExpires": 1200
}
```
#### Get Device Configuration
GET /device-config/:deviceId

#### Get All Devices
GET /device-config
Get all device configurations with pagination, filtering, and sorting.

Query parameters:

page: Page number (default: 1)
limit: Items per page (default: 10)
sortBy: Field to sort by (default: deviceId)
sortOrder: Sort direction (asc/desc)
deviceId: Filter by deviceId (substring match)
hotPercentageMin: Minimum hot percentage
hotPercentageMax: Maximum hot percentage
stakeLimitMin: Minimum stake limit
stakeLimitMax: Maximum stake limit
isBlocked: Filter by blocked status (true/false)