import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

const user = await User.findBy('email', 'admin@example.com')
if (user) {
  console.log('User found:', {
    id: user.id,
    email: user.email,
    passwordLength: user.password.length,
    passwordStart: user.password.substring(0, 20) + '...',
    role: user.role
  })
  
  // Test password verification
  const testPassword = 'pA55w0rd!'
  const isValid = await hash.use('scrypt').verify(user.password, testPassword)
  console.log('Password verification result:', isValid)
} else {
  console.log('User not found')
}

process.exit(0)

