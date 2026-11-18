import './App.css'
import { useEffect, useState, useCallback } from 'react'
import supabase from '@/shared/database/supabaseClient'

import { Toaster } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'

import BookingHistory from '@/components/Booking History/BookingHistory'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'
import BookingForm from './components/BookingForm/BookingForm'

export interface Booking {
  id: number
  User_Name: string
  Password: string
  created_at: string
  Sport: string
  Cluster: string
  Court: string
  Date: string
  Time_Start: string
  Time_End: string
  Status: string
  error_message: string
}

function App() {
  const [bookings, setBookings] = useState<Booking[]>([])

  const fetchBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from('Booking History')
      .select()
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching bookings:', error)
      return null
    }

    return data
  }, [])

  const refreshBookings = useCallback(() => {
    void fetchBookings().then((data) => {
      if (data) {
        setBookings(data)
      }
    })
  }, [fetchBookings])

  useEffect(() => {
    refreshBookings()
  }, [refreshBookings])

  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <TooltipProvider>
        <main className='px-4 sm:px-6 lg:px-8 py-8'>
          <BookingForm setBookings={setBookings} />
          <BookingHistory
            bookings={bookings}
            onBookingDeleted={refreshBookings}
          />
        </main>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App

