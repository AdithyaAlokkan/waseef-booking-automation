import './App.css'
import { useEffect, useState } from 'react'
import supabase from '@/shared/database/supabaseClient'

import { Toaster } from '@/components/ui/toast'

import BookingHistory from '@/components/Booking History/BookingHistory'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'
import BookingForm from './components/BookingForm/BookingForm'

export interface Booking {
  id: number
  created_at: string
  Sport: string
  Cluster: string
  Date: string
  Time: string
  Status: string
}

function App() {
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('Booking History')
        .select()
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error(error)
        return
      }

      setBookings(data)
    }

    fetchBookings()
  }, [])

  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <main className='px-4 sm:px-6 lg:px-8 py-8'>
        <BookingForm setBookings={setBookings} />
        <BookingHistory bookings={bookings} />
      </main>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
