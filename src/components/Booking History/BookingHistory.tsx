import supabase from '@/database/supabaseClient'
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Booking {
  id: number
  created_at: string
  Sport: string
  Cluster: string
  Date: string
  Time: string
}

const Database = () => {
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[] | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('Booking History').select()

      if (error) {
        setFetchError('Could not fetch bookings.')
        setBookings(null)
        console.log(error)
      }
      if (data) {
        setBookings(data)
        setFetchError(null)
      }
    }

    fetchUsers()
  }, [])

  return (
    <>
      {
        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchError && <p>{fetchError}</p>}
            {bookings && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created At</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Cluster</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.created_at}</TableCell>
                      <TableCell>{booking.Sport}</TableCell>
                      <TableCell>{booking.Cluster}</TableCell>
                      <TableCell>{booking.Date}</TableCell>
                      <TableCell>{booking.Time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      }
    </>
  )
}

export default Database
