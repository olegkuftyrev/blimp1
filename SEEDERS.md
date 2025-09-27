# Database Seeders Documentation

## Overview

This project uses AdonisJS Lucid seeders to populate the database with initial data. Due to foreign key relationships and dependencies between models, seeders must be executed in a specific order.

## ⚠️ Important: Seeder Execution Order

**Seeders MUST be run in the correct order to avoid foreign key constraint errors and missing dependencies.**

## Execution Methods

### Method 1: Ordered Script (Recommended)
```bash
# Run all seeders in correct order
npm run db:seed:ordered

# Or directly
node scripts/seed-in-order.js
```

### Method 2: Ace with Specific Files
```bash
# Run seeders in correct order using ace
node ace db:seed --files database/seeders/admin_user_seeder,database/seeders/restaurant_seeder,database/seeders/idp_role_seeder,database/seeders/idp_competency_seeder,database/seeders/idp_description_seeder,database/seeders/idp_assessment_seeder,database/seeders/additional_data_seeder
```

### Method 3: Individual Execution
```bash
# Run each seeder individually in order
node ace db:seed --files database/seeders/admin_user_seeder
node ace db:seed --files database/seeders/restaurant_seeder
node ace db:seed --files database/seeders/idp_role_seeder
node ace db:seed --files database/seeders/idp_competency_seeder
node ace db:seed --files database/seeders/idp_description_seeder
node ace db:seed --files database/seeders/idp_assessment_seeder
node ace db:seed --files database/seeders/additional_data_seeder
node ace db:seed --files database/seeders/roles_performance_seeder
node ace db:seed --files database/seeders/pl_question_seeder
node ace db:seed --files database/seeders/menu_item_seeder
```

## Seeder Dependencies & Order

### 1. admin_user_seeder.ts
- **Purpose**: Creates admin user and tablet user
- **Dependencies**: None
- **Creates**: 
  - Admin user (admin@example.com)
  - Tablet user (px2475@pandarg.com)

### 2. restaurant_seeder.ts
- **Purpose**: Creates sample restaurants
- **Dependencies**: None
- **Creates**: 
  - Panda Express PX2874
  - Panda Express PX3698
  - Panda Express PX2475

### 3. idp_role_seeder.ts
- **Purpose**: Creates IDP (Individual Development Plan) roles
- **Dependencies**: None
- **Creates**: 
  - Associate role
  - Black Shirt role
  - Operations Lead role
  - Admin role

### 4. idp_competency_seeder.ts
- **Purpose**: Creates competencies, questions, and actions for IDP roles
- **Dependencies**: idp_role_seeder.ts
- **Creates**: 
  - Competencies for each role
  - Questions for each competency
  - Actions for each competency

### 5. idp_description_seeder.ts
- **Purpose**: Creates competency descriptions
- **Dependencies**: idp_competency_seeder.ts
- **Creates**: 
  - Overview, definition, behaviors, and examples for each competency

### 6. idp_assessment_seeder.ts
- **Purpose**: Creates IDP assessments for all users
- **Dependencies**: admin_user_seeder.ts + idp_role_seeder.ts
- **Creates**: 
  - Assessments for each user
  - Sample answers for admin user

### 7. additional_data_seeder.ts
- **Purpose**: Creates additional users, restaurants, and assessments
- **Dependencies**: All previous seeders
- **Creates**: 
  - Additional restaurants
  - Additional users with different roles
  - User-restaurant assignments
  - IDP assessments with random results

### 8. roles_performance_seeder.ts
- **Purpose**: Creates performance assessment data
- **Dependencies**: None (independent)
- **Creates**: 
  - Role performance data
  - Performance sections and items

### 9. pl_question_seeder.ts
- **Purpose**: Creates P&L (Profit & Loss) questions
- **Dependencies**: None (independent)
- **Creates**: 
  - 96 P&L questions with answers

### 10. menu_item_seeder.ts
- **Purpose**: Creates menu items for the restaurant system
- **Dependencies**: None (independent)
- **Creates**: 
  - Menu items with cooking times and batch sizes

## Dependency Checks

Each seeder includes dependency checks to prevent errors:

### idp_assessment_seeder.ts
```typescript
// Check dependencies first
const users = await User.all()
if (users.length === 0) {
  console.log('⚠️ No users found. Please run admin_user_seeder first.')
  return
}

const idpRoles = await IdpRole.all()
if (idpRoles.length === 0) {
  console.log('⚠️ No IDP roles found. Please run idp_role_seeder first.')
  return
}
```

### idp_competency_seeder.ts
```typescript
// Check dependencies first
const roles = await IdpRole.all()
if (roles.length === 0) {
  console.log('⚠️ No IDP roles found. Please run idp_role_seeder first.')
  return
}
```

### idp_description_seeder.ts
```typescript
// Check dependencies first
const competencies = await IdpCompetency.query().where('isActive', true)
if (competencies.length === 0) {
  console.log('⚠️ No IDP competencies found. Please run idp_competency_seeder first.')
  return
}
```

### additional_data_seeder.ts
```typescript
// Check dependencies first
const existingUsers = await User.all()
const existingRestaurants = await Restaurant.all()
const existingIdpRoles = await IdpRole.all()

if (existingUsers.length === 0) {
  console.log('⚠️ No users found. Please run admin_user_seeder first.')
  return
}
if (existingRestaurants.length === 0) {
  console.log('⚠️ No restaurants found. Please run restaurant_seeder first.')
  return
}
if (existingIdpRoles.length === 0) {
  console.log('⚠️ No IDP roles found. Please run idp_role_seeder first.')
  return
}
```

## Common Issues & Solutions

### Issue: Foreign Key Constraint Errors
**Cause**: Seeders run in wrong order
**Solution**: Use `npm run db:seed:ordered` or run seeders individually in correct order

### Issue: "No users found" Error
**Cause**: `idp_assessment_seeder` or `additional_data_seeder` run before `admin_user_seeder`
**Solution**: Run `admin_user_seeder` first

### Issue: "No IDP roles found" Error
**Cause**: IDP-related seeders run before `idp_role_seeder`
**Solution**: Run `idp_role_seeder` before any IDP-related seeders

### Issue: "No IDP competencies found" Error
**Cause**: `idp_description_seeder` runs before `idp_competency_seeder`
**Solution**: Run `idp_competency_seeder` before `idp_description_seeder`

## Development Workflow

### First Time Setup
```bash
# 1. Run migrations
node ace migration:run

# 2. Run seeders in order
npm run db:seed:ordered
```

### During Development
```bash
# Reset database and reseed
dropdb blimp && createdb blimp && node ace migration:run && npm run db:seed:ordered
```

### Production Deployment
```bash
# Run migrations only (no seeding in production)
node ace migration:run
```

## File Structure

```
backend/
├── database/
│   └── seeders/
│       ├── admin_user_seeder.ts
│       ├── restaurant_seeder.ts
│       ├── idp_role_seeder.ts
│       ├── idp_competency_seeder.ts
│       ├── idp_description_seeder.ts
│       ├── idp_assessment_seeder.ts
│       ├── additional_data_seeder.ts
│       ├── roles_performance_seeder.ts
│       ├── pl_question_seeder.ts
│       └── menu_item_seeder.ts
├── scripts/
│   └── seed-in-order.js
└── package.json
```

## Environment-Specific Behavior

### Development (`npm run dev`)
- Automatically runs migrations and seeders in correct order via `predev` script

### Production (`npm start`)
- Only runs migrations via `prestart` script
- No seeding in production

## Troubleshooting

### Check Seeder Status
```bash
# Check if seeders have been run
node ace db:seed --files database/seeders/admin_user_seeder
```

### Reset and Reseed
```bash
# Complete reset
dropdb blimp && createdb blimp && node ace migration:run && npm run db:seed:ordered
```

### Debug Individual Seeder
```bash
# Run specific seeder with verbose output
node ace db:seed --files database/seeders/admin_user_seeder
```

## Best Practices

1. **Always use the ordered script** for development
2. **Check dependencies** before running seeders
3. **Test seeders individually** when making changes
4. **Never run seeders in production** (except initial setup)
5. **Use transactions** for complex seeders (future enhancement)
6. **Add logging** to track seeder execution
7. **Validate data** after seeding

## Future Enhancements

- [ ] Add transaction support for atomic operations
- [ ] Implement seeder rollback functionality
- [ ] Add data validation after seeding
- [ ] Create seeder status tracking
- [ ] Add conditional seeding based on environment
- [ ] Implement incremental seeding for large datasets
