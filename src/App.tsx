import './App.css'
import BookingHistory from '@/components/Booking History/BookingHistory'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'
import BookingForm from './components/BookingForm/BookingForm'

function App() {
  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <main className='px-4 sm:px-6 lg:px-8 py-8'>
        <BookingForm></BookingForm>
        <BookingHistory></BookingHistory>
      </main>
    </ThemeProvider>
  )
}

export default App

