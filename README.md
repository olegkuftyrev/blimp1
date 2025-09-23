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

### Current Status (Last Updated: Sep 16, 2025)
- ✅ **Backend**: AdonisJS 6.19.0 project created and working
- ✅ **Database**: Postgres configured, migrations executed successfully
- ✅ **Models**: MenuItem and Order models created with relationships
- ✅ **API Endpoints**: All REST API endpoints created and working
- ✅ **Seeders**: 5 Panda Express dishes populated in database (including 10-second test item)
- ✅ **CSRF**: Disabled for API routes, POST requests working
- ✅ **Frontend**: Next.js 15.5.2 with TypeScript and Tailwind CSS
- ✅ **Table Interfaces**: 3 table section pages with smart batch selection
- ✅ **Kitchen Interface**: Kitchen tablet with timer management
- ✅ **BOH Interfaces**: BOH pages (including settings)
- ✅ **WebSocket**: Real-time communication between kitchen and table sections
- ✅ **Timer System**: Complete timer workflow with countdown displays
- ✅ **Order Management**: Full order lifecycle from creation to completion
- ✅ **Smart UI**: Time-based batch recommendations and visual feedback
- ✅ **Deployment**: Live on DigitalOcean
- ✅ **Environment Config**: Frontend configured to connect to server backend via env

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
- `frontend/src/app/page.tsx` - Main navigation page
- `frontend/src/app/table/[id]/page.tsx` - Smart table section interfaces with timers
- `frontend/src/app/boh/page.tsx` - BOH interface
- `frontend/src/app/boh/settings/page.tsx` - BOH settings page
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
9. ⏳ **Feature enhancements** - Additional menu items, reporting, analytics
10. ⏳ **Mobile optimization** - Responsive design improvements for various tablet sizes

### Technical Details:
- **AdonisJS Version**: 6.19.0
- **Next.js Version**: 15.5.2
- **Database**: Postgres with Lucid ORM
- **WebSocket**: Socket.IO for real-time communication
- **Backend Port**: 3333
- **Frontend Port**: 3000
- **Server**: DigitalOcean Droplet
- **Database**: Local Postgres (Homebrew/Docker) during development
- **Migration Status**: All 4 migrations completed successfully
- **API Status**: All endpoints working with WebSocket events
- **Frontend Status**: Running with Tailwind CSS and WebSocket integration
- **Deployment Status**: Live and accessible via configured domain/IP
- **Environment Config**: Frontend configured with server API URLs from env
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
└── mcp.json            # MCP server configuration ✅
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

**Этап 9: Convert to Chakra UI** ✅ COMPLETED
- ✅ Setup Chakra UI MCP server configuration
- ✅ Install Chakra UI packages (Switched to Tailwind CSS)
- ✅ Convert existing interfaces to Chakra components (Using Tailwind CSS)
- ✅ Implement responsive tablet-optimized design

### Frontend Development
6. **Create Next.js frontend** - Basic structure with TypeScript and native HTML `✅ COMPLETED`
7. **Create table section interfaces** - 3 manager tablets with native HTML `✅ COMPLETED`
8. **Create kitchen interface** - Cook tablet with native HTML `✅ COMPLETED`
9. **Convert to Chakra UI** - Redesign all interfaces with Chakra UI `✅ COMPLETED` (Switched to Tailwind CSS)

### Integration & Logic
10. **Implement polling** - 5-second synchronization `✅ COMPLETED`
11. **Implement timer logic** - Cooking statuses and timers `✅ COMPLETED`

### Testing & Deployment
12. **Integration testing** - All components testing `✅ COMPLETED`
13. **Deployment setup** - DigitalOcean with Ubuntu `✅ COMPLETED`

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

This project uses **Postgres** with **Lucid ORM** for data storage.

### Database Setup
Run Postgres locally (Homebrew or Docker). The app connects using PG_* variables.

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

# Database (Postgres)
DB_CLIENT=pg
PG_HOST=127.0.0.1
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=blimp
PG_SSL=false

# Websocket / Realtime
WS_CORS_ORIGIN=*
```

Notes:
- Use a strong, random `APP_KEY` in production.
- When switching to Postgres, set `DB_CLIENT=pg` and provide all `PG_*` values.

#### Frontend (`frontend/.env.local`)
Create `frontend/.env.local` with the following variables:

```env
# API URL for backend requests
NEXT_PUBLIC_API_URL=http://localhost:3333

# WebSocket URL for real-time connections  
NEXT_PUBLIC_WS_URL=http://localhost:3333

# Backend URL for Next.js rewrites
NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
```

**Important**: All URLs must be configured via environment variables. No hardcoded localhost URLs are used in the code.

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blimp1
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
   - **Local Development**: Navigate to `http://localhost:3000`
   - **Live Server**: Use your configured domain/IP

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

## 🛫 Deploying to DigitalOcean (Ubuntu + PM2 + Nginx)

1) SSH to server and install requirements
```bash
sudo apt update && sudo apt install -y nginx git build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm i -g pm2
```

2) Clone repo and prepare env files
```bash
git clone <repo-url> blimp1 && cd blimp1
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit backend/.env (set APP_KEY, APP_URL, HOST, PORT) and frontend/.env.local
```

3) Build for production and run migrations
```bash
chmod +x scripts/prod-build.sh
./scripts/prod-build.sh
```

4) Start processes with PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # follow the printed instructions to enable boot on startup
```

5) Configure Nginx (reverse proxy)
```nginx
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and reload Nginx:
```bash
sudo tee /etc/nginx/sites-available/blimp1 >/dev/null <<'CONF'
# paste the server block above
CONF
sudo ln -sf /etc/nginx/sites-available/blimp1 /etc/nginx/sites-enabled/blimp1
sudo nginx -t && sudo systemctl reload nginx
```

6) Update deployments
```bash
cd /path/to/blimp1
git pull
./scripts/prod-build.sh
pm2 restart all && pm2 save
```

## 📁 Project Structure

```
project/
├── frontend/          # Next.js 15 Frontend
│   ├── src/app/       # Next.js App Router
│   │   ├── table/     # Table section pages
│   │   ├── boh/       # BOH pages (incl. settings)
│   │   └── ...
│   ├── src/components/
│   ├── src/contexts/
│   ├── src/hooks/
│   ├── src/lib/
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

- Uses Tailwind CSS for consistent design and styling
- No icons in the UI (clean, text-based interface)
- Touch-optimized interface for tablet use
- Large, easy-to-tap buttons for kitchen environment
- High contrast design for visibility in restaurant lighting
- Responsive design optimized for tablet screens

## 🔌 API Architecture

This project follows **API-Driven Development** approach:

### API Endpoints Structure
- **Base URL**: `/api` in development (Next.js rewrite) | `${NEXT_PUBLIC_API_URL}/api` in production
- **Authentication**: Cookie-based session (httpOnly) after sign-in
- **Data Format**: JSON
- **Polling**: Frontend polls API every 5 seconds (plus WebSocket events)
- **Environment**: All URLs come from env; no hardcoded addresses

### Main API Routes

#### Auth
```
POST   /api/auth/sign-up-invite      # Register using invite code
POST   /api/auth/sign-in             # Sign in (sets cookie)
POST   /api/auth/logout              # Logout (clears cookie)
GET    /api/auth/me                  # Current user and memberships
```

#### Invites (protected)
```
POST   /api/invites                  # Create invite (role-based rules)
```

#### Menu Items (protected)
```
GET    /api/menu-items              # Get all menu items
GET    /api/menu-items/:id          # Get specific menu item
PUT    /api/menu-items/:id          # Update menu item status
```

#### Orders (protected)
```
GET    /api/orders                  # Get all orders
POST   /api/orders                  # Create new order
GET    /api/orders/:id              # Get specific order
PUT    /api/orders/:id              # Update order status
DELETE /api/orders/:id              # Delete order
```

#### Table Sections (protected)
```
GET    /api/table-sections          # Get all table sections data
GET    /api/table-sections/:id      # Get specific table section
GET    /api/table-sections/:id/orders # Get orders for specific table section
```

#### Kitchen (protected)
```
GET    /api/kitchen/orders          # Get all kitchen orders
GET    /api/kitchen/orders/pending  # Get pending orders
GET    /api/kitchen/orders/cooking  # Get cooking orders
POST   /api/kitchen/orders/:id/start-timer    # Start cooking timer
POST   /api/kitchen/orders/:id/cancel-timer   # Cancel cooking timer
POST   /api/kitchen/orders/:id/complete       # Mark order as done
```

#### System Status (protected)
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

## 🗃️ Database — Full Reference

### Engine & Driver
- **DB Engine**: Postgres
- **Driver**: `pg`
- **ORM**: Lucid (`@adonisjs/lucid`)

### Connection & Config
- Config file: `backend/config/database.ts`
- Default connection: `pg`

```ts
// backend/config/database.ts (excerpt)
connection: 'pg',
connections: {
  pg: {
    client: 'pg',
    connection: {
      host: env.get('PG_HOST'),
      port: env.get('PG_PORT'),
      user: env.get('PG_USER'),
      password: env.get('PG_PASSWORD'),
      database: env.get('PG_DB_NAME'),
      ssl: env.get('PG_SSL') ? { rejectUnauthorized: false } : false,
    },
    migrations: { naturalSort: true, paths: ['database/migrations'] },
  },
}
```

### Environment Variables (Backend)
- Declared and validated in `backend/start/env.ts`.
- Required/optional keys impacting DB: `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DB_NAME`, `PG_SSL`

### Migrations (Schema)
Location: `backend/database/migrations`

Core app tables:
- Users & auth: `create_users_table`, `create_access_tokens_table`, `add_role_and_deleted_to_users_table`, `add_job_title_to_users_table`
- Restaurants & relations: `create_restaurants_table`, `add_owner_and_deleted_to_restaurants_table`, `create_user_restaurants_table`, `create_lead_relations_table`
- Invites & audit: `create_invitations_table`, `create_audit_log_table`, `add_job_title_to_invitations_table`
- Menu & orders: `create_menu_items_table`, `create_orders_table`, and subsequent enhancements (batch number, soft delete, constraints, foreign keys)
- IDP/Performance: roles, competencies, questions, actions, assessments, assessment_answers, descriptions, role_performances, performance_sections, performance_items, user_performance_answers

Notes:
- Natural sort for migrations is enabled.
- Soft delete columns exist for entities like users and restaurants (and orders `deleted_at`).
- Global uniqueness on restaurant names is enforced.

### Seeders (Initial Data)
Location: `backend/database/seeders`
- `admin_user_seeder.ts`: Creates an admin or baseline user
- `restaurant_seeder.ts`: Sample restaurant(s)
- `menu_item_seeder.ts`: Baseline menu items for demo/testing
- IDP/Performance seeders: `idp_role_seeder.ts`, `idp_competency_seeder.ts`, `idp_description_seeder.ts`, `idp_assessment_seeder.ts`, `roles_performance_seeder.ts`
- `additional_data_seeder.ts`: Any extra data needed for local testing

Lifecycle hooks:
- `npm run dev` runs `predev`: applies pending migrations and seeds
- `npm start` runs `prestart`: applies migrations only (no seed)

### Models & Relationships (Lucid)
Location: `backend/app/models`
- `user.ts`: user fields incl. `role` enum; soft delete (`deleted_at`)
- `restaurant.ts`: `owner_user_id` (black_shirt owner); soft delete
- `user_restaurant.ts`: many-to-many membership between users and restaurants
- `lead_relation.ts`: maps ops_lead to black_shirt (circle ownership)
- `invitation.ts`: single-use invite codes with optional `restaurant_id`
- `audit.ts`: append-only audit log entries
- `menu_item.ts`: menu metadata, batch sizes, cooking times, status
- `order.ts`: ties table section + `menu_item_id` + batch size + timer fields
- IDP/Performance: `idp_*` and performance models (roles, competencies, assessments, answers, sections, items)

Relationship highlights:
- User ↔ Restaurant: many-to-many via `user_restaurants`
- Restaurant → User (owner): `owner_user_id`
- Ops lead circle: `lead_relations` connects ops_lead → black_shirt
- Order → MenuItem: `order.menu_item_id` foreign key; eager loads used in controllers

### Common Commands
```bash
# From backend/

# Run migrations
node ace migration:run

# Rollback last batch
node ace migration:rollback

# Rerun all migrations from scratch
node ace migration:reset && node ace migration:run

# Seed database
node ace db:seed

# Generate a new migration
node ace make:migration add_field_to_table

# Generate a new seeder
node ace make:seeder sample_data
```

### Reset, Backup, Restore (Postgres)
- Reset (dev): `dropdb blimp && createdb blimp` then migrate + seed
- Backup: `pg_dump blimp > backup.sql`
- Restore: `psql blimp < backup.sql`

### Production Notes
- Keep `APP_KEY` secret and strong
- Pin `SQLITE_DB_PATH` to a persistent location with backups
- Consider Postgres for horizontal scale; Lucid supports `pg` with minimal config changes
- All network addresses and DB paths are configured via environment variables (no hard-coded URLs)

### File Map
- Config: `backend/config/database.ts` (pg only)
- Env schema: `backend/start/env.ts` (pg only)
- Migrations: `backend/database/migrations`
- Seeders: `backend/database/seeders`
- Models: `backend/app/models`

### Postgres Migration Guide (Optional)

If/when you outgrow SQLite, switching to Postgres with Lucid is straightforward.

1) Install dependency (backend)
```bash
cd backend
npm i pg
```

2) Add env variables (`backend/.env`)
```env
DB_CLIENT=pg
PG_HOST=127.0.0.1
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=blimp
PG_SSL=false
```

3) Update env schema (`backend/start/env.ts`)
Add optional Postgres keys (keep existing SQLite keys):
```ts
// ... existing keys ...
DB_CLIENT: Env.schema.enum.optional(['sqlite', 'pg'] as const),
PG_HOST: Env.schema.string.optional(),
PG_PORT: Env.schema.number.optional(),
PG_USER: Env.schema.string.optional(),
PG_PASSWORD: Env.schema.string.optional(),
PG_DB_NAME: Env.schema.string.optional(),
PG_SSL: Env.schema.boolean.optional(),
```

4) Update DB config (`backend/config/database.ts`)
```ts
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_CLIENT') || 'sqlite',
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: { filename: env.get('SQLITE_DB_PATH') || app.tmpPath('db.sqlite3') },
      useNullAsDefault: true,
      migrations: { naturalSort: true, paths: ['database/migrations'] },
    },
    pg: {
      client: 'pg',
      connection: {
        host: env.get('PG_HOST'),
        port: env.get('PG_PORT'),
        user: env.get('PG_USER'),
        password: env.get('PG_PASSWORD'),
        database: env.get('PG_DB_NAME'),
        ssl: env.get('PG_SSL') ? { rejectUnauthorized: false } : false,
      },
      migrations: { naturalSort: true, paths: ['database/migrations'] },
    },
  },
})

export default dbConfig
```

5) Create DB, migrate, seed
```bash
# ensure the database exists
createdb blimp || true

# run migrations and (optionally) seeds
node ace migration:run
node ace db:seed
```

6) Data migration from SQLite (optional)
- Dev reset: simplest path is to start Postgres empty and re-seed.
- Real data: export CSV from SQLite per table and import with `psql` `\copy`.

Compatibility notes
- Booleans, timestamps, and JSON fields map cleanly via Lucid.
- Unique constraints and foreign keys are fully enforced (as with SQLite FK pragma enabled).
- Remove `useNullAsDefault` (only for SQLite) if you later drop SQLite config.
- Review any raw SQL in migrations/seeders for vendor-specific syntax.

Production notes
- Use SSL for managed Postgres; configure pooler (e.g., pgbouncer) if needed.
- Run `ANALYZE` after large imports; add appropriate indexes.
- Rotate credentials and keep env secrets out of VCS.

Env template (backend/.env)
```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3333
APP_NAME=blimp-backend
APP_URL=http://localhost:3333
# Generate: openssl rand -hex 32
APP_KEY=change-me-to-a-long-random-string
LOG_LEVEL=debug

SESSION_DRIVER=cookie

# CORS
CORS_ORIGIN=*

# Database (SQLite kept for fallback; Postgres is default)
SQLITE_DB_PATH=./tmp/db.sqlite3
DB_CLIENT=pg
PG_HOST=127.0.0.1
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=blimp
PG_SSL=false

# Websocket / Realtime
WS_CORS_ORIGIN=*
```

---

**Note**: This README will be updated as the project develops and new features are added.

## 🔐 Roles & Authorization

This project uses role-based access control with invitations. Self-registration without an invite is not allowed.

### Roles hierarchy
- admin: full access everywhere
- ops_lead: manages only their circle (their black_shirts and all restaurants owned by those black_shirts)
- black_shirt: manages only their own restaurants and associates
- associate: basic role (future pages)

Notes:
- Hierarchy is fixed: admin > ops_lead > black_shirt > associate
- waiter role is not used

### Data model (RBAC & scope)
- users: id, email, password, full_name, role (enum)
- restaurants: id, name (globally unique), owner_user_id (black_shirt owner) — soft delete enabled
- user_restaurants: id, user_id, restaurant_id — membership (many-to-many), supports multiple memberships for users
- lead_relations: id, lead_user_id (ops_lead), black_shirt_user_id — defines ops_lead circle
- invitations: id, code (uuid), role (enum), created_by_user_id, restaurant_id (nullable), used_at, expires_at (nullable). Invite is single-use and does not expire by default
- audit_log: id, actor_user_id, action, entity_type, entity_id, payload (json), created_at — records all important actions

### Access scope rules
- admin: unrestricted
- ops_lead: full control ONLY over their circle:
  - circle = all black_shirts linked via lead_relations + all restaurants owned by those black_shirts + associates in those restaurants
  - cannot take (reassign) black_shirt from another ops_lead (only admin can)
- black_shirt:
  - control limited to restaurants they own and associates within those restaurants
  - can create unlimited restaurants they own
  - can create associates and attach them to their restaurants
- associate: access only to the restaurants where they have membership (future pages)

Restaurants temporarily without a black_shirt owner are considered managed by admin and the corresponding ops_lead from the original circle.

### Invitations & registration
- Self-register: disabled (always via invite)
- Invite for black_shirt: created by ops_lead (role=black_shirt, restaurant_id=null). After registration, black_shirt creates their restaurants and becomes owner
- Invite for associate: created by black_shirt (role=associate, restaurant_id=required). On registration, membership is created in that restaurant. Multiple memberships are supported
- Invite properties: single-use, no expiration by default (can be extended later)

### Soft delete & reassignment
- Soft delete for users and restaurants (deleted_at)
- Deleting a black_shirt:
  - We reassign their restaurants and associates per admin/ops_lead decision
  - Option A: transfer restaurants to another black_shirt in the same ops_lead circle
  - Option B: keep restaurants without black_shirt (temporarily managed by admin and the same ops_lead)
- Ops_lead cannot take black_shirt from another ops_lead; only admin may reassign lead_relations

### Middleware & policies (backend)
- ensureRole(...roles): checks user.role
- ensureRestaurantMembership(restaurantId): ensures the user is member/owner; admin bypasses
- ensureLeadAccess(restaurantId): ensures ops_lead has access because the restaurant owner is their black_shirt
- High-level abilities:
  - manageUsersInRestaurant: admin; ops_lead (in circle); black_shirt (only associates in own restaurants)
  - manageRestaurants: admin; ops_lead (restaurants in circle); black_shirt (own restaurants)

### Policies / Access Control (Backend)
- AccessControlService centralizes checks:
  - `canManageRestaurants(user, restaurant)`
  - `canManageUsersInRestaurant(user, restaurant, targetRole)`
  - `isMemberOfRestaurant(user, restaurantId)`
- Middleware:
  - `role`: ensures user has one of allowed roles
  - `restaurantAccess`: ensures access by membership/ownership or ops_lead circle

### Progress
- [x] Route protection applied across `/api` groups with `auth` and role checks

### Auth endpoints (contract)
- POST /auth/sign-in → 200 { user, role, restaurant_ids[] } (sets/returns token)
- POST /auth/logout → 204
- GET /auth/me → 200 { user, role, restaurant_ids[], circle? } or 401
- POST /auth/sign-up-invite → 201 { user, role, restaurant_ids[] }
- POST /invites → 201 { code, role, restaurant_id? }

#### Implemented endpoints
- [x] POST `/api/auth/sign-up-invite`
  - Body: `{ code, email, password, full_name? }`
  - Behavior: single-use invite, no expiry by default; attaches associate to `restaurant_id` if present; if invite role is `black_shirt` and inviter is ops_lead/admin, auto-links in `lead_relations`
- [x] POST `/api/auth/sign-in`
  - Body: `{ email, password }`
  - Returns: `{ user, token }`
- [x] POST `/api/auth/logout`
- [x] GET `/api/auth/me`
  - Returns: `{ user, restaurant_ids[] }`
- [x] POST `/api/invites`
  - Body:
    - Invite black_shirt (ops_lead/admin): `{ role: 'black_shirt' }`
    - Invite associate (black_shirt/ops_lead/admin): `{ role: 'associate', restaurant_id }`
  - Validations:
    - black_shirt invites only by ops_lead/admin
    - associate invites: black_shirt → only own restaurant; ops_lead → only restaurants in his circle (or orphan)

### Middleware registered
- [x] `role` → ensureRole(...roles)
- [x] `restaurantAccess` → ensure access via membership/ownership or ops_lead circle

All network addresses are configured via environment variables, not hard-coded.

### Frontend behavior
- Auth guarded routes and UI:
  - BOH and management pages require auth; redirect unauthenticated to /login
  - Show/hide navigation items based on role and membership
- After login, fetch /auth/me and cache role + restaurant_ids to drive UI and redirects
- All requests use credentials (httpOnly cookie) and backend URL from env

---

### ✅ RBAC Implementation TODO

- [x] Backend: Database & Models
  - [x] users: add `role` enum (admin | ops_lead | black_shirt | associate)
  - [x] restaurants: add `owner_user_id` (black_shirt); enable soft delete
  - [x] user_restaurants: (user_id, restaurant_id) many-to-many membership (unique pair)
  - [x] lead_relations: (lead_user_id[ops_lead], black_shirt_user_id)
  - [x] invitations: (code, role, created_by_user_id, restaurant_id?, used_at, expires_at nullable)
  - [x] audit_log: (actor_user_id, action, entity_type, entity_id, payload JSON)
  - [x] Enable soft delete for users as well

- [ ] Backend: Auth & Invites
  - [ ] POST /auth/register-by-invite (single-use code, no expiry by default)
  - [ ] POST /auth/login (httpOnly cookie token)
  - [ ] POST /auth/logout (clear token)
  - [ ] GET /auth/me → { user, role, restaurant_ids[], circle: { black_shirt_ids[], restaurant_ids[] } }
  - [ ] POST /invites (create invite):
    - [ ] ops_lead → black_shirt (restaurant_id null)
    - [ ] black_shirt → associate (restaurant_id required)

- [ ] Backend: Access Control
  - [x] Middleware: ensureRole(...roles)
  - [x] Middleware: ensureRestaurantAccess(restaurantId)
  - [ ] Policies: manageUsersInRestaurant, manageRestaurants per agreed rules

- [ ] Backend: Management APIs
  - [ ] ops_lead: manage black_shirts and associates within circle
  - [ ] black_shirt: manage associates in own restaurants; create restaurants
  - [ ] Admin-only: reassign black_shirt between ops_leads
  - [ ] Transfer restaurants on black_shirt removal (orphan allowed; managed by admin + respective ops_lead)

- [ ] Backend: Audit Logging
  - [x] Log `invite_create`, `register_by_invite`, `login`, `logout`
  - [ ] Log role changes, membership add/remove, restaurant create/update/delete, transfers

- [ ] Frontend: Auth & Guards
  - [ ] API client with credentials (cookie) and env URLs
  - [ ] Pages: /sign-in, /sign-up-invite
  - [ ] Fetch /auth/me in layout; store role + restaurant_ids
  - [ ] Route guards and role-based navigation visibility

- [ ] Frontend: Dashboards (MVP)
  - [ ] ops_lead: list black_shirts and their restaurants; basic management actions
  - [ ] black_shirt: manage own restaurants and associates

- [ ] Testing & Seeds
  - [ ] Seeds for sample roles and relations
  - [ ] E2E flow: invite → register → login → access protected routes

- [ ] Config
  - [ ] CORS with credentials, cookie flags (Secure/SameSite in prod)
  - [ ] All URLs from env (no hardcoded addresses)

#### Implemented in this step
- Migrations
  - `backend/database/migrations/1758800000000_add_role_and_deleted_to_users_table.ts`
  - `backend/database/migrations/1758800000001_add_owner_and_deleted_to_restaurants_table.ts`
  - `backend/database/migrations/1758800000002_create_user_restaurants_table.ts`
  - `backend/database/migrations/1758800000003_create_lead_relations_table.ts`
  - `backend/database/migrations/1758800000004_create_invitations_table.ts`
  - `backend/database/migrations/1758800000005_create_audit_log_table.ts`
- Models
  - `backend/app/models/user.ts` (role, soft delete)
  - `backend/app/models/restaurant.ts` (ownerUserId, soft delete)
  - `backend/app/models/user_restaurant.ts`
  - `backend/app/models/lead_relation.ts`
  - `backend/app/models/invitation.ts`
- Middleware
  - `backend/app/middleware/ensure_role_middleware.ts`
  - `backend/app/middleware/ensure_restaurant_access_middleware.ts`

---

### cURL quick test (Auth & Invites)

```bash
# Base URL
BASE=http://localhost:3333 # dev backend

# 1) Sign up via invite (pre-created code)
INVITE_CODE=REPLACE_WITH_CODE
curl -i -X POST "$BASE/api/auth/sign-up-invite" \
  -H 'Content-Type: application/json' \
  -d '{"code":"'$INVITE_CODE'","email":"user@example.com","password":"pass123"}'

# 2) Sign in
curl -s "$BASE/api/auth/sign-in" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"pass123"}' | tee /tmp/login.json
TOKEN=$(node -e "let d=require('fs').readFileSync('/tmp/login.json','utf8');try{let j=JSON.parse(d);console.log(j.token?.token||j.token)}catch(e){console.log('')} ")

# 3) Me (Bearer token)
curl -i "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN"

# 4) Create invite (requires auth)
# 4a) Invite black_shirt (ops_lead/admin)
curl -i -X POST "$BASE/api/invites" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"role":"black_shirt"}'

# 4b) Invite associate (black_shirt/ops_lead/admin), restaurant scoped
curl -i -X POST "$BASE/api/invites" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"role":"associate","restaurant_id":123}'
```

Notes:
- Replace `INVITE_CODE` with an actual code (see Invites API or DB).
- The sign-in response contains `{ token: { token: "..." } }`. Use that string as Bearer.
- All protected routes require `Authorization: Bearer $TOKEN`.

---

### Authorization with Bouncer
- Integrated `@adonisjs/bouncer` with initialize middleware (available as `ctx.bouncer`).
- Abilities defined in `backend/app/abilities/main.ts`:
  - `manageRestaurants(user, restaurant)`
  - `manageUsersInRestaurant(user, restaurant, targetRole)`
- Use inside controllers for fine-grained checks:
```ts
import { manageRestaurants, manageUsersInRestaurant } from '#abilities/main'
// await bouncer.authorize(manageRestaurants, restaurant)
// await bouncer.authorize(manageUsersInRestaurant, restaurant, 'associate')
```
- Official guide: [AdonisJS Authorization](https://docs.adonisjs.com/guides/security/authorization#authorization)

---
