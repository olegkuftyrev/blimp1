#!/usr/bin/env node

/**
 * Script to run seeders in the correct order
 * This ensures proper dependency resolution between seeders
 */

import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Define the correct order of seeders
const SEEDER_ORDER = [
  'database/seeders/admin_user_seeder',
  'database/seeders/restaurant_seeder', 
  'database/seeders/idp_role_seeder',
  'database/seeders/idp_competency_seeder',
  'database/seeders/idp_description_seeder',
  'database/seeders/idp_assessment_seeder',
  'database/seeders/additional_data_seeder',
  'database/seeders/roles_performance_seeder',
  'database/seeders/pl_question_seeder',
  'database/seeders/menu_item_seeder'
]

function runSeeder(seederPath) {
  console.log(`\n🔄 Running seeder: ${seederPath}`)
  try {
    execSync(`node ace db:seed --files ${seederPath}`, {
      cwd: projectRoot,
      stdio: 'inherit'
    })
    console.log(`✅ Completed: ${seederPath}`)
  } catch (error) {
    console.error(`❌ Failed: ${seederPath}`)
    console.error(error.message)
    process.exit(1)
  }
}

async function main() {
  console.log('🌱 Starting ordered seeder execution...')
  console.log(`📋 Will run ${SEEDER_ORDER.length} seeders in order`)
  
  for (const seeder of SEEDER_ORDER) {
    runSeeder(seeder)
  }
  
  console.log('\n🎉 All seeders completed successfully!')
}

main().catch(console.error)
