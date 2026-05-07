# EcoWatt Monitor

A full-stack energy monitoring application for tracking renewable energy generation (solar and wind) and household consumption. Built with React + TypeScript frontend and Java Spring Boot backend.

## 🚀 Features

- **Real-time Dashboard**: Monitor current solar, wind, and consumption metrics
- **Data Visualization**: Interactive charts showing hourly and weekly energy patterns
- **CSV Import/Export**: Upload historical data or export current data
- **Summary Statistics**: View aggregated totals and averages across all data
- **Alerts System**: Get notified about energy balance issues
- **Manual Data Entry**: Submit energy readings via form
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Recharts for data visualization

### Backend
- Java 17
- Spring Boot 3.3.4
- Spring Data JPA
- H2 Database (in-memory, can be switched to MySQL)
- Apache Commons CSV

## 📋 Prerequisites

- Node.js 18+ and npm
- Java 17 or higher
- Maven (included via `mvnw` wrapper)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd watt-aware-java-main
```

### 2. Start the Backend

```bash
cd backend/ecowatt-backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8081`

### 3. Start the Frontend

In a new terminal:

```bash
# From project root
npm install
VITE_API_URL=http://localhost:8081 npm run dev
```

The frontend will start on `http://localhost:5173` (or next available port)

### 4. Access the Application

Open your browser and navigate to the frontend URL (shown in terminal output).

## 📊 Using the Application

### Adding Data

1. **Manual Entry**: Click "Add Data" button, fill in solar, wind, and consumption values
2. **CSV Upload**: Click "Upload CSV" and select a CSV file with format:
   ```
   timestamp,solar,wind,consumption
   2024-01-01T10:00:00,50.5,25.3,75.2
   ```
   Or the backend format:
   ```
   solar_generation,wind_generation,consumption,timestamp
   50.5,25.3,75.2,2024-01-01T10:00:00
   ```

### Viewing Data

- **Current Metrics**: See real-time solar, wind, and consumption values
- **Summary Card**: View aggregated statistics across all data
- **Charts**: Switch between hourly and weekly views
- **Data Table**: See daily breakdowns with renewable percentages

### Exporting Data

Click the "Export" button in the header to download data as:
- CSV format
- JSON format

## 🔧 Configuration

### Backend Configuration

Edit `backend/ecowatt-backend/src/main/resources/application.properties`:

```properties
# Change port (default: 8081)
server.port=8081

# Switch to MySQL (uncomment and configure)
# spring.datasource.url=jdbc:mysql://localhost:3306/ecowatt
# spring.datasource.username=your_username
# spring.datasource.password=your_password
```

### Frontend Configuration

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8081
```

## 📁 Project Structure

```
watt-aware-java-main/
├── backend/
│   └── ecowatt-backend/          # Spring Boot backend
│       └── src/main/java/com/ecowatt/
│           ├── entity/           # JPA entities
│           ├── repository/      # Data repositories
│           ├── service/          # Business logic
│           ├── web/             # REST controllers
│           └── config/          # Configuration (CORS, etc.)
├── src/
│   ├── components/              # React components
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API service layer
│   └── pages/                   # Page components
└── public/                      # Static assets
```

## 🔌 API Endpoints

### Backend Endpoints

- `GET /api/data` - Get all energy records
- `GET /api/summary` - Get aggregated statistics
- `POST /api/upload` - Upload CSV file (multipart/form-data)

### Request/Response Formats

**Get All Data:**
```json
[
  {
    "id": 1,
    "timestamp": "2024-01-01T10:00:00",
    "solarGeneration": 50.5,
    "windGeneration": 25.3,
    "consumption": 75.2,
    "totalRenewable": 75.8,
    "energyBalance": 0.6,
    "renewablePercentage": 100.8
  }
]
```

**Get Summary:**
```json
{
  "totalSolar": 1000.5,
  "totalWind": 750.3,
  "totalConsumption": 1200.0,
  "avgRenewablePercentage": 85.5,
  "netBalance": 550.8
}
```

## 🐛 Troubleshooting

### Backend won't start
- Ensure Java 17+ is installed: `java -version`
- Check if port 8081 is available
- Review backend logs for errors

### Frontend can't connect to backend
- Verify backend is running on port 8081
- Check `VITE_API_URL` environment variable
- Ensure CORS is configured (should allow localhost:*)

### CSV upload fails
- Verify CSV format matches expected headers
- Check file encoding (should be UTF-8)
- Ensure values are numeric and non-negative

## 📝 Development

### Running Tests

Backend:
```bash
cd backend/ecowatt-backend
./mvnw test
```

Frontend:
```bash
npm test
```

### Building for Production

Backend:
```bash
cd backend/ecowatt-backend
./mvnw clean package
# JAR will be in target/ directory
```

Frontend:
```bash
npm run build
# Output in dist/ directory
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Spring Boot](https://spring.io/projects/spring-boot)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
