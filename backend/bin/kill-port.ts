import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Kill any process running on the specified port
 */
async function killPort(port: number): Promise<void> {
  try {
    // Find process using the port
    const { stdout } = await execAsync(`lsof -ti:${port}`)
    
    if (stdout.trim()) {
      const pids = stdout.trim().split('\n')
      console.log(`Found processes on port ${port}: ${pids.join(', ')}`)
      
      // Kill each process
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`)
          console.log(`Killed process ${pid}`)
        } catch (error) {
          console.log(`Failed to kill process ${pid}:`, error)
        }
      }
    } else {
      console.log(`No processes found on port ${port}`)
    }
  } catch (error) {
    // No processes found on the port
    console.log(`No processes found on port ${port}`)
  }
}

// Kill port 3333 if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  killPort(3333)
    .then(() => {
      console.log('Port 3333 cleared successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error clearing port 3333:', error)
      process.exit(1)
    })
}

export { killPort }
