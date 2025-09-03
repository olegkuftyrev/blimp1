# Blimp Smart Table

A tablet-based food calling and kitchen management system designed to streamline operations at Panda Express restaurants. This system automates the food calling process and helps coordinate between table sections and kitchen staff.

## 🚀 Features

- **Table Management**: 3 tablet interfaces for table sections with touch screen support
- **Kitchen Integration**: Dedicated kitchen tablet for cooks and help cooks
- **Timer Management**: Automatic timer setup for food preparation
- **Real-time Updates**: Data synchronization between all tablets every 5 seconds
- **Touch-friendly Interface**: Optimized for tablet use with Chakra UI
- **Manager Control**: Centralized management of all 3 table sections

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.2 with Chakra UI 3.26.0 (optimized for tablets)
- **Backend**: AdonisJS 6.19.0 (Node.js framework)
- **Database**: SQLite with Lucid ORM (built-in AdonisJS ORM)
- **Architecture**: API-Driven Development (RESTful API)
- **Data Synchronization**: Polling every 5 seconds for updates
- **Device Support**: Touch screen optimized for tablets
- **Deployment**: Automatic deployment from Git repository

## 📱 System Overview

The system consists of **4 tablets total**:

### Table Section Tablets (3 tablets)
- One tablet per table section
- Touch screen interface for food calling
- Manager can control all sections from any tablet
- Updates every 5 seconds when food is called

### Kitchen Tablet (1 tablet)
- Dedicated interface for kitchen staff
- Displays incoming food orders
- Automatic timer setup for food preparation
- Updates every 5 seconds when table sections call food

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher) - required for Next.js 15.5.2
- npm

## 🗄️ Database Configuration

This project uses **SQLite** with **Lucid ORM** for data storage, which provides:
- Zero configuration setup
- File-based database (no separate server required)
- Built-in ORM with AdonisJS (no additional dependencies)
- Perfect for development and production
- Fast performance for restaurant operations

### Database Setup
The SQLite database file will be automatically created at `backend/tmp/db.sqlite3` when you first run the application.

### Environment Variables
Create a `.env` file in the backend directory:
```bash
# Database Configuration
DB_CONNECTION=sqlite
DB_DATABASE=tmp/db.sqlite3

# Application
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd table
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

5. **Run database migrations**
   ```bash
   cd backend
   node ace migration:run
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Open your browser**
   Navigate to `http://localhost:3000` to view the application.

## 📁 Project Structure

```
table/
├── frontend/          # Next.js 15 Frontend
│   ├── app/          # Next.js 15 App Router
│   │   ├── (routes)/ # Route groups
│   │   │   ├── table/     # Table section pages
│   │   │   ├── kitchen/   # Kitchen page
│   │   │   └── manager/   # Manager page
│   │   ├── components/    # Reusable UI components
│   │   │   ├── TableSection/    # Table section tablet components
│   │   │   ├── Kitchen/         # Kitchen tablet components
│   │   │   └── Manager/         # Manager control components
│   │   ├── lib/          # Utility functions and configurations
│   │   └── ...
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # AdonisJS 6.19.0 Backend
│   ├── app/          # AdonisJS application code
│   │   ├── controllers/  # API controllers
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # API middleware
│   │   └── validators/   # Request validation
│   ├── config/       # Configuration files
│   ├── database/     # Database migrations and seeders
│   ├── tmp/          # SQLite database file (auto-generated)
│   └── package.json  # Backend dependencies
└── README.md        # This file
```

## 🎨 UI Guidelines

- Uses Chakra UI components for consistent design
- No icons in the UI (clean, text-based interface)
- Touch-optimized interface for tablet use
- Large, easy-to-tap buttons for kitchen environment
- High contrast design for visibility in restaurant lighting
- Responsive design optimized for tablet screens

## 🔌 API Architecture

This project follows **API-Driven Development** approach:

### API Endpoints Structure
- **Base URL**: `http://localhost:3333/api` (development)
- **Authentication**: JWT-based authentication
- **Data Format**: JSON
- **Polling**: Frontend polls API every 5 seconds

### Main API Routes
```
GET    /api/orders           # Get all orders
POST   /api/orders           # Create new order
PUT    /api/orders/:id       # Update order status
GET    /api/table-sections   # Get table sections data
GET    /api/kitchen          # Get kitchen orders
POST   /api/kitchen/timers   # Set up kitchen timers
```

### Frontend-Backend Communication
- **Frontend**: Next.js makes HTTP requests to AdonisJS API
- **Backend**: AdonisJS serves RESTful API endpoints
- **Database**: Lucid ORM handles data persistence
- **Synchronization**: All 4 tablets poll the same API endpoints

## 🧪 Testing

**No testing framework is used in this project.** The development approach focuses on:
- Manual testing during development
- Real-world testing with actual tablet devices
- Direct feedback from restaurant staff during implementation

## 🚀 Deployment

This project is deployed on a **DigitalOcean Droplet** running **Ubuntu**.

### Deployment Environment
- **Platform**: DigitalOcean Droplet
- **OS**: Ubuntu
- **Deployment**: Automatic deployment from Git repository on push
- **Process**: No manual deployment steps required

### Server Requirements
- Ubuntu 20.04 LTS or higher
- Node.js v18 or higher
- PM2 for process management (recommended)
- Nginx for reverse proxy (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help, please open an issue in the repository.

---

## 🎯 Workflow

1. **Manager** uses any of the 3 table section tablets to manage food calling
2. **Table Section** staff call food using their dedicated tablet
3. **Kitchen Tablet** receives the order within 5 seconds and sets up timers
4. **Kitchen Staff** (cooks and help cooks) see the order and timer information
5. **Data Polling** keeps all tablets synchronized every 5 seconds

---

**Note**: This README will be updated as the project develops and new features are added.
