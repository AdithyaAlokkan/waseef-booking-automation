import { format } from 'date-fns'
import type { Booking } from '@/App'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'

interface BookingHistoryProps {
  bookings: Booking[]
}

const BookingHistory = ({ bookings }: BookingHistoryProps) => {
  return (
    <>
      <h1 className='text-xl tracking-tight mb-5'>Booking History</h1>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created At</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    {format(new Date(booking.created_at), 'MMM d | HH:mm')}
                  </TableCell>
                  <TableCell>{booking.Sport}</TableCell>
                  <TableCell>{booking.Cluster}</TableCell>
                  <TableCell>
                    {format(new Date(`${booking.Date}T00:00:00`), 'MMM d')}
                  </TableCell>
                  <TableCell>{booking.Time.slice(0, 5)}</TableCell>
                  <TableCell>{booking.Status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

export default BookingHistory
