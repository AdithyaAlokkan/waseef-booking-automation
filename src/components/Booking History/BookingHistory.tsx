import supabase from '@/shared/database/supabaseClient'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'

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
      const { data, error } = await supabase
        .from('Booking History')
        .select()
        .order('created_at', { ascending: false })

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
        <>
          <h1 className='text-xl tracking-tight mb-5'>Booking History</h1>
          <Card>
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
                        <TableCell>
                          {format(
                            new Date(booking.created_at),
                            'MMM d | HH:mm',
                          )}
                        </TableCell>
                        <TableCell>{booking.Sport}</TableCell>
                        <TableCell>{booking.Cluster}</TableCell>
                        <TableCell>
                          {format(new Date(booking.created_at), 'MMM d')}
                        </TableCell>
                        <TableCell>{booking.Time.slice(0, 5)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      }
    </>
  )
}

export default Database
