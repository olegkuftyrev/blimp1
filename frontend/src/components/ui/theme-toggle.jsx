import { useTheme } from 'next-themes'
import { Button } from '@chakra-ui/react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }
  
  return (
    <Button 
      onClick={toggleTheme}
      colorScheme="gray"
      variant="outline"
      size="md"
    >
      {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
    </Button>
  )
}
