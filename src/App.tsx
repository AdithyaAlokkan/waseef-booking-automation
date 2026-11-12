import './App.css'
import { ThemeProvider } from './shared/theme/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <>Hello World!</>
    </ThemeProvider>
  )
}

export default App

