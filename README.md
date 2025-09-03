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

#### Menu Items
```
GET    /api/menu-items              # Get all menu items
GET    /api/menu-items/:id          # Get specific menu item
PUT    /api/menu-items/:id          # Update menu item status
```

#### Orders
```
GET    /api/orders                  # Get all orders
POST   /api/orders                  # Create new order
GET    /api/orders/:id              # Get specific order
PUT    /api/orders/:id              # Update order status
DELETE /api/orders/:id              # Delete order
```

#### Table Sections
```
GET    /api/table-sections          # Get all table sections data
GET    /api/table-sections/:id      # Get specific table section
GET    /api/table-sections/:id/orders # Get orders for specific table section
```

#### Kitchen
```
GET    /api/kitchen/orders          # Get all kitchen orders
GET    /api/kitchen/orders/pending  # Get pending orders
GET    /api/kitchen/orders/cooking  # Get cooking orders
POST   /api/kitchen/orders/:id/start-timer    # Start cooking timer
POST   /api/kitchen/orders/:id/cancel-timer   # Cancel cooking timer
POST   /api/kitchen/orders/:id/complete       # Mark order as done
```

#### System Status
```
GET    /api/status                  # Get system status
GET    /api/status/table-sections   # Get all table sections status
GET    /api/status/kitchen          # Get kitchen status
```

### API Examples

#### Create Order
```bash
POST /api/orders
Content-Type: application/json

{
  "table_section": 1,
  "menu_item_id": 1,
  "batch_size": 2
}
```

#### Start Timer
```bash
POST /api/kitchen/orders/1/start-timer
Content-Type: application/json

{
  "cooking_time": 3
}
```

#### Complete Order
```bash
POST /api/kitchen/orders/1/complete
Content-Type: application/json

{
  "completed_at": "2024-01-01T12:00:00Z"
}
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

### Complete Order Process:

1. **Table Section Tablets (3 tablets)**
   - Display 4 menu items that should always be available on the table
   - Manager sees current status of each dish
   - Manager clicks on dish + selects batch size (1, 2, or 3)
   - System creates order with status `pending`

2. **Kitchen Tablet**
   - Cook sees new order with status `pending`
   - **Cook Actions:**
     - `"Start Timer"` - start cooking timer
     - `"Cancel Timer"` - cancel timer (if not expired yet)

3. **Timer Active**
   - Order status: `cooking`
   - Kitchen screen: shows countdown timer
   - Table section: shows "Cooking" + remaining time

4. **Timer Expired**
   - Order status: `timer_expired`
   - Kitchen screen: shows "Timer Expired!"
   - **Cook Action:** `"Done"` - confirm completion

5. **Completion**
   - Cook clicks `"Done"`
   - Order status: `ready`
   - Table section: shows "Ready"

### Order Statuses:
- `pending` - Order created, waiting for cook
- `cooking` - Timer is running
- `timer_expired` - Timer expired, waiting for cook confirmation
- `ready` - Dish is ready
- `completed` - Dish taken from table

### Data Synchronization:
- All 4 tablets poll API every 5 seconds for updates
- Real-time status updates across all devices

## 🍜 Menu Items

The system manages 4 core Panda Express dishes:

### 1. Fried Rice
- Batch sizes: Breakfast(1), Lunch(2), Downtime(1), Dinner(3)
- Cooking times: Random 2-5 minutes per batch

### 2. Orange Chicken  
- Batch sizes: Breakfast(1), Lunch(2), Downtime(1), Dinner(3)
- Cooking times: Random 2-5 minutes per batch

### 3. Cream Cheese Ragoons
- Batch sizes: Breakfast(1), Lunch(2), Downtime(1), Dinner(3)
- Cooking times: Random 2-5 minutes per batch

### 4. Honey Walnut Shrimp
- Batch sizes: Breakfast(1), Lunch(2), Downtime(1), Dinner(3)
- Cooking times: Random 2-5 minutes per batch

## 📊 Database Structure

### Menu Items Table:
- `id`, `item_title`, `batch_breakfast`, `batch_lunch`, `batch_downtime`, `batch_dinner`
- `cooking_time_batch1` (INTEGER), `cooking_time_batch2` (INTEGER), `cooking_time_batch3` (INTEGER)
- `status`, `created_at`, `updated_at`

### Orders Table:
- `id`, `table_section` (1,2,3), `menu_item_id`, `batch_size`, `status`
- `timer_start`, `timer_end`, `created_at`, `updated_at`

---

**Note**: This README will be updated as the project develops and new features are added.
