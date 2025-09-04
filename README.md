# Blimp Smart Table

A tablet-based food calling and kitchen management system designed to streamline operations at Panda Express restaurants. This system automates the food calling process and helps coordinate between table sections and kitchen staff.

## 🚀 Pipeline of Development

### Backend Development
1. **Create AdonisJS backend** - Basic project structure `✅ COMPLETED`
2. **Setup SQLite database** - Configuration and migrations `✅ COMPLETED`
3. **Create models** - MenuItem and Order with Lucid ORM `✅ COMPLETED`
4. **Create API endpoints** - All REST API for the system `✅ COMPLETED`
5. **Create seeders** - 4 Panda Express dishes with data `✅ COMPLETED`

#### Detailed Backend Steps:

**⚠️ IMPORTANT: Always work in /backend directory for backend commands**

## 📝 Development Notes

### Current Status (Last Updated: Sep 3, 2025)
- ✅ **Backend**: AdonisJS 6.19.0 project created and working
- ✅ **Database**: SQLite configured, migrations executed successfully
- ✅ **Models**: MenuItem and Order models created with relationships
- ✅ **API Endpoints**: All REST API endpoints created and working
- ✅ **Seeders**: 5 Panda Express dishes populated in database (including 10-second test item)
- ✅ **CSRF**: Disabled for API routes, POST requests working
- ✅ **Frontend**: Next.js 15.5.2 with TypeScript and Tailwind CSS
- ✅ **Table Interfaces**: 3 table section pages with smart batch selection
- ✅ **Kitchen Interface**: Kitchen tablet with timer management
- ✅ **WebSocket**: Real-time communication between kitchen and table sections
- ✅ **Timer System**: Complete timer workflow with countdown displays
- ✅ **Order Management**: Full order lifecycle from creation to completion
- ✅ **Smart UI**: Time-based batch recommendations and visual feedback
- ✅ **Deployment**: Live on DigitalOcean server (137.184.15.223)
- ✅ **Environment Config**: Frontend configured to connect to server backend

### Key Files Created:
- `backend/app/models/menu_item.ts` - MenuItem model with cooking times
- `backend/app/models/order.ts` - Order model with timer fields
- `backend/database/migrations/1756870400000_create_menu_items_table.ts`
- `backend/database/migrations/1756870400001_create_orders_table.ts`
- `backend/database/seeders/menu_item_seeder.ts` - 5 Panda Express dishes (including 10-second test item)
- `backend/app/controllers/menu_item_controller.ts` - Menu API endpoints
- `backend/app/controllers/order_controller.ts` - Order API endpoints with WebSocket events
- `backend/app/controllers/kitchen_controller.ts` - Kitchen API endpoints
- `backend/app/controllers/status_controller.ts` - Status API endpoints
- `backend/app/services/websocket_service.ts` - Real-time WebSocket communication
- `backend/start/routes.ts` - All API routes configured
- `backend/start/ws.ts` - WebSocket server configuration
- `backend/config/shield.ts` - CSRF disabled for API
- `backend/tmp/db.sqlite3` - SQLite database with test data
- `frontend/src/app/page.tsx` - Main navigation page with section selection
- `frontend/src/app/table/[id]/page.tsx` - Smart table section interfaces with timers
- `frontend/src/app/kitchen/page.tsx` - Kitchen tablet with timer management
- `frontend/src/contexts/WebSocketContext.tsx` - WebSocket connection management
- `frontend/src/hooks/useWebSocketEvents.ts` - WebSocket event handlers
- `frontend/package.json` - Next.js 15.5.2 with TypeScript and Socket.IO
- `frontend/tailwind.config.ts` - Tailwind CSS configuration
- `frontend/.env.local` - Environment configuration for server deployment

### Development Rules:
1. **One step at a time** - Complete each step before moving to next
2. **Test after each step** - Verify everything works before proceeding
3. **Never edit working code** - Don't break existing functionality
4. **Always work in /backend** - For all backend terminal commands
5. **No terminal file operations** - Use direct file tools only

### Next Steps:
1. ✅ ~~Install and configure Chakra UI~~ (Switched to Tailwind CSS)
2. ✅ ~~Convert existing interfaces to Chakra UI components~~ (Using Tailwind CSS)
3. ✅ ~~Implement timer logic for kitchen orders~~ (Complete timer system implemented)
4. ✅ ~~Add real-time timer countdown displays~~ (WebSocket-based real-time updates)
5. ✅ ~~Integration testing~~ - All components tested and working together
6. ✅ ~~Deployment setup~~ - DigitalOcean with Ubuntu (137.184.15.223)
7. ⏳ **Production optimization** - Performance tuning and monitoring
8. ⏳ **User testing** - Real-world tablet testing in restaurant environment

### Technical Details:
- **AdonisJS Version**: 6.19.0
- **Next.js Version**: 15.5.2
- **Database**: SQLite with Lucid ORM
- **WebSocket**: Socket.IO for real-time communication
- **Backend Port**: 3333
- **Frontend Port**: 3000
- **Server IP**: 137.184.15.223 (DigitalOcean)
- **Database File**: `backend/tmp/db.sqlite3`
- **Migration Status**: All 4 migrations completed successfully
- **API Status**: All endpoints working with WebSocket events
- **Frontend Status**: Running with Tailwind CSS and WebSocket integration
- **Deployment Status**: Live and accessible at http://137.184.15.223:3000
- **Environment Config**: Frontend configured with server API URLs
- **Test Data**: 5 Panda Express dishes (including 10-second test item)

### API Testing Results:
- ✅ **GET /api/menu-items**: Returns 5 Panda Express dishes (including 10-second test item)
- ✅ **GET /api/orders**: Returns orders with real-time updates
- ✅ **POST /api/orders**: Creates new orders with WebSocket events
- ✅ **DELETE /api/orders/:id**: Deletes orders with WebSocket events
- ✅ **POST /api/kitchen/orders/:id/start-timer**: Starts timers with WebSocket events
- ✅ **POST /api/kitchen/orders/:id/complete**: Completes orders with WebSocket events
- ✅ **WebSocket Events**: Real-time communication between kitchen and table sections
- ✅ **Database**: All data persisted correctly with relationships

### API Endpoints Created:
- ✅ Menu Items: GET, PUT `/api/menu-items`
- ✅ Orders: GET, POST, PUT, DELETE `/api/orders`
- ✅ Table Sections: GET `/api/table-sections`
- ✅ Kitchen: GET, POST `/api/kitchen/orders`
- ✅ System Status: GET `/api/status`

### Project Structure:
```
backend/
├── app/models/          # MenuItem, Order models ✅
├── app/controllers/     # API controllers ✅
├── database/migrations/ # menu_items, orders tables ✅
├── database/seeders/    # Menu item seeder ✅
├── start/routes.ts      # API routes ✅
├── config/shield.ts     # CSRF configuration ✅
└── tmp/db.sqlite3      # SQLite database ✅

frontend/
├── src/app/             # Next.js App Router ✅
│   ├── page.tsx         # Main navigation ✅
│   ├── table/[id]/      # Table section pages ✅
│   └── kitchen/         # Kitchen page ✅
├── package.json         # Next.js 15.5.2 + TypeScript ✅
├── tailwind.config.ts   # Tailwind CSS config ✅
└── postcss.config.mjs   # PostCSS config ✅

.cursor/
└── mcp.json            # Chakra UI MCP server ✅
```

**Этап 1: Create AdonisJS backend**
- Create AdonisJS project: `npm create adonisjs@latest backend`
- Setup folder structure: controllers, models, services, middleware, validators
- Configure package.json: dependencies and scripts
- Create .env file: database configuration

**Этап 2: Setup SQLite database**
- Configure SQLite: config/database.js
- Create tmp folder: for SQLite file
- Setup .env: DB_CONNECTION=sqlite, DB_DATABASE=tmp/db.sqlite3
- Test connection: verify database setup

**Этап 3: Create models** ✅ COMPLETED
- ✅ Create MenuItem model: fields for dishes and cooking times
- ✅ Create Order model: fields for orders and timers
- ✅ Setup relationships: Order belongsTo MenuItem
- ✅ Create migrations: menu_items and orders tables
- ✅ Test database: migrations executed successfully

**Этап 4: Create API endpoints** ✅ COMPLETED
- ✅ Create controllers: MenuItemController, OrderController, KitchenController, StatusController
- ✅ Setup routes: all API endpoints from README
- ✅ Fix CSRF: disabled for API routes
- ✅ Test endpoints: GET/POST requests working

**Этап 5: Create seeders** ✅ COMPLETED
- ✅ Create MenuItem seeder: 4 Panda Express dishes
- ✅ Add test data: correct cooking times (2-4 minutes)
- ✅ Setup seeder execution: database populated successfully
- ✅ Test data: 4 dishes + 1 test order created

**Этап 6: Create Next.js frontend** ✅ COMPLETED
- ✅ Create Next.js 15.5.2 project with TypeScript
- ✅ Setup Tailwind CSS configuration
- ✅ Fix PostCSS configuration for Tailwind
- ✅ Create main navigation page with tablet links

**Этап 7: Create table section interfaces** ✅ COMPLETED
- ✅ Create dynamic route `/table/[id]` for 3 table sections
- ✅ Implement menu items display with batch size buttons
- ✅ Add order creation functionality
- ✅ Implement 5-second polling for real-time updates

**Этап 8: Create kitchen interface** ✅ COMPLETED
- ✅ Create kitchen page `/kitchen`
- ✅ Display all orders with status indicators
- ✅ Add timer start/complete functionality
- ✅ Implement order status management

**Этап 9: Convert to Chakra UI** 🔄 IN PROGRESS
- ✅ Setup Chakra UI MCP server configuration
- ⏳ Install Chakra UI packages
- ⏳ Convert existing interfaces to Chakra components
- ⏳ Implement responsive tablet-optimized design

### Frontend Development
6. **Create Next.js frontend** - Basic structure with TypeScript and native HTML `✅ COMPLETED`
7. **Create table section interfaces** - 3 manager tablets with native HTML `✅ COMPLETED`
8. **Create kitchen interface** - Cook tablet with native HTML `✅ COMPLETED`
9. **Convert to Chakra UI** - Redesign all interfaces with Chakra UI `🔄 IN PROGRESS`

### Integration & Logic
10. **Implement polling** - 5-second synchronization `✅ COMPLETED`
11. **Implement timer logic** - Cooking statuses and timers `⏳ PENDING`

### Testing & Deployment
12. **Integration testing** - All components testing `⏳ PENDING`
13. **Deployment setup** - DigitalOcean with Ubuntu `⏳ PENDING`

### Status Legend:
- `✅ COMPLETED` - Task finished
- `🔄 IN PROGRESS` - Currently working on
- `⏳ PENDING` - Not started yet
- `❌ BLOCKED` - Waiting for dependencies

## 🚀 Features

### 🍽️ Smart Table Management
- **3 Tablet Interfaces**: Dedicated interfaces for each table section
- **Smart Batch Selection**: Time-based recommendations (Breakfast 5-10am, Lunch 11am-1pm, Dinner 5-7pm)
- **Visual Feedback**: Color-coded buttons with recommended batch highlighting
- **Real-time Timers**: Live countdown displays showing cooking progress

### 👨‍🍳 Kitchen Integration
- **Dedicated Kitchen Tablet**: Complete order management interface
- **Timer Management**: Automatic timer setup based on menu item cooking times
- **Order Lifecycle**: Full workflow from pending → cooking → timer_expired → ready
- **Complete & Delete**: Option to complete orders or delete them entirely

### ⚡ Real-time Communication
- **WebSocket Integration**: Instant updates between kitchen and table sections
- **Event-driven Updates**: Order creation, timer start/stop, completion events
- **Synchronized Timers**: Kitchen and table sections show identical countdowns
- **Live Status Updates**: Real-time order status changes across all devices

### 🎯 Smart UI Features
- **Time-based Recommendations**: System suggests optimal batch based on current time
- **Visual States**: Different button colors for available, processing, and waiting states
- **Touch-optimized**: Large buttons designed for tablet use
- **Status Indicators**: Clear visual feedback for order progress

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.2 with TypeScript and Tailwind CSS
- **Backend**: AdonisJS 6.19.0 (Node.js framework)
- **Database**: SQLite with Lucid ORM (built-in AdonisJS ORM)
- **Real-time Communication**: Socket.IO WebSocket integration
- **Architecture**: API-Driven Development with WebSocket events
- **Data Synchronization**: Real-time WebSocket events + 5-second polling fallback
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

This project uses strict runtime validation for backend environment variables and env-driven rewrites in the frontend.

#### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and adjust as needed.

Required variables:
```env
# Application
NODE_ENV=development
HOST=0.0.0.0
PORT=3333
APP_NAME=blimp-backend
APP_URL=http://localhost:3333
APP_KEY=change-me-in-production
LOG_LEVEL=debug

# Sessions
SESSION_DRIVER=cookie

# CORS
CORS_ORIGIN=*

# Database (SQLite only)
SQLITE_DB_PATH=./tmp/db.sqlite3

# Websocket / Realtime
WS_CORS_ORIGIN=*
```

Notes:
- Use a strong, random `APP_KEY` in production.
- When switching to Postgres, set `DB_CLIENT=pg` and provide all `PG_*` values.

#### Frontend (`frontend/.env.local`)
Copy `frontend/.env.example` to `frontend/.env.local` and adjust as needed.

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
```

The Next.js rewrites use `NEXT_PUBLIC_BACKEND_URL` for both REST (`/api/*`) and Socket.IO (`/socket.io/*`).

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

   Note: On first run, the backend will automatically apply pending migrations and seed initial data (via `predev`). For production runs, `npm start` will auto-apply migrations (via `prestart`) but will not seed.

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Open your browser**
   - **Local Development**: Navigate to `http://localhost:3000` to view the application
   - **Live Server**: Navigate to `http://137.184.15.223:3000` to view the deployed application

### One-command Bootstrap (Local Dev)

From the repository root:

```bash
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh
```

This will:
- Install dependencies for backend and frontend
- Create `.env` files if missing (using examples or minimal defaults)
- Run database migrations and seed data
- Start backend (port 3333) and frontend (port 3000)

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
- **Base URL**: `http://localhost:3333/api` (development) | `http://137.184.15.223:3333/api` (production)
- **Authentication**: JWT-based authentication
- **Data Format**: JSON
- **Polling**: Frontend polls API every 5 seconds
- **Environment**: Frontend automatically detects server vs local environment

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

#### Get All Menu Items
```bash
GET /api/menu-items

Response:
{
  "data": [
    {
      "id": 1,
      "item_title": "Fried Rice",
      "batch_breakfast": 1,
      "batch_lunch": 2,
      "batch_downtime": 1,
      "batch_dinner": 3,
      "cooking_time_batch1": 3,
      "cooking_time_batch2": 4,
      "cooking_time_batch3": 2,
      "status": "available",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### Create Order
```bash
POST /api/orders
Content-Type: application/json

{
  "table_section": 1,
  "menu_item_id": 1,
  "batch_size": 2
}

Response:
{
  "data": {
    "id": 1,
    "table_section": 1,
    "menu_item_id": 1,
    "batch_size": 2,
    "status": "pending",
    "timer_start": null,
    "timer_end": null,
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

#### Get Kitchen Orders
```bash
GET /api/kitchen/orders

Response:
{
  "data": [
    {
      "id": 1,
      "table_section": 1,
      "menu_item": {
        "id": 1,
        "item_title": "Fried Rice",
        "cooking_time_batch1": 3,
        "cooking_time_batch2": 4,
        "cooking_time_batch3": 2
      },
      "batch_size": 2,
      "status": "pending",
      "timer_start": null,
      "timer_end": null,
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### Start Timer
```bash
POST /api/kitchen/orders/1/start-timer
Content-Type: application/json

{
  "cooking_time": 3
}

Response:
{
  "data": {
    "id": 1,
    "status": "cooking",
    "timer_start": "2024-01-01T12:00:00Z",
    "timer_end": "2024-01-01T12:03:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

#### Complete Order
```bash
POST /api/kitchen/orders/1/complete
Content-Type: application/json

{
  "completed_at": "2024-01-01T12:05:00Z"
}

Response:
{
  "data": {
    "id": 1,
    "status": "ready",
    "completed_at": "2024-01-01T12:05:00Z",
    "updated_at": "2024-01-01T12:05:00Z"
  }
}
```

#### Get Table Section Status
```bash
GET /api/status/table-sections

Response:
{
  "data": {
    "table_sections": [
      {
        "id": 1,
        "orders": [
          {
            "id": 1,
            "menu_item": {
              "id": 1,
              "item_title": "Fried Rice"
            },
            "status": "cooking",
            "timer_end": "2024-01-01T12:03:00Z",
            "remaining_time": 120
          }
        ]
      }
    ]
  }
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
- **Server IP**: 137.184.15.223
- **Deployment**: Manual deployment with environment configuration
- **Process**: 
  1. Code changes pushed to repository
  2. Files copied to server via SCP
  3. Environment variables configured
  4. Services restarted

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
- **WebSocket Events**: Real-time communication between kitchen and table sections
- **Polling Fallback**: 5-second API polling as backup for updates
- **Event Types**: order:created, order:updated, timer:started, timer:expired, order:completed, orders:all_deleted
- **Room-based Updates**: Kitchen and specific table sections receive targeted events

## 🍜 Menu Items

The system manages 5 core Panda Express dishes:

### 1. Fried Rice
- Batch sizes: Breakfast(1), Lunch(2), Downtime(1), Dinner(3)
- Cooking times: Random 2-4 minutes per batch

### 2. Orange Chicken  
- Batch sizes: Breakfast(1), Lunch(2), Downtime(1), Dinner(3)
- Cooking times: Random 2-4 minutes per batch

### 3. Cream Cheese Ragoons
- Batch sizes: Breakfast(1), Lunch(2), Downtime(1), Dinner(3)
- Cooking times: Random 2-4 minutes per batch

### 4. Honey Walnut Shrimp
- Batch sizes: Breakfast(1), Lunch(2), Downtime(1), Dinner(3)
- Cooking times: Random 2-4 minutes per batch

### 5. Teriyaki Beef Bowl ⚡
- Batch sizes: Breakfast(2), Lunch(4), Downtime(1), Dinner(5)
- Cooking times: **Batch 1: 10 seconds** (for testing), Batch 2: 3-6 minutes, Batch 3: 4-8 minutes

## 📊 Database Structure

### Menu Items Table: ✅ CREATED & POPULATED
- `id`, `item_title`, `batch_breakfast`, `batch_lunch`, `batch_downtime`, `batch_dinner`
- `cooking_time_batch1` (INTEGER), `cooking_time_batch2` (INTEGER), `cooking_time_batch3` (INTEGER)
- `status`, `created_at`, `updated_at`
- **Data**: 5 Panda Express dishes with random cooking times (2-4 minutes) + 10-second test item

### Orders Table: ✅ CREATED & TESTED
- `id`, `table_section` (1,2,3), `menu_item_id`, `batch_size`, `status`
- `timer_start`, `timer_end`, `completed_at`, `created_at`, `updated_at`
- **Test Data**: 1 test order (Fried Rice, Table Section 1, Batch Size 2, Status: pending)

### Models Created:
- **MenuItem Model** - with all dish fields and cooking times
- **Order Model** - with order fields, timers, and relationship to MenuItem
- **Database Migrations** - executed successfully, tables created
- **Seeders** - populated with 4 Panda Express dishes

---

**Note**: This README will be updated as the project develops and new features are added.
