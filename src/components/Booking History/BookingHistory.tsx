import supabase from '@/shared/database/supabaseClient'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontalIcon } from 'lucide-react'

interface BookingHistoryProps {
  bookings: Booking[]
  onBookingDeleted: () => void
}

const BookingHistory = ({
  bookings,
  onBookingDeleted,
}: BookingHistoryProps) => {
  // Booking Delete handler
  const handleDelete = async (bookingId: number) => {
    const { error } = await supabase
      .from('Booking History')
      .delete()
      .eq('id', bookingId)

    if (error) {
      console.error('Error deleting booking:', error)
      return
    }

    onBookingDeleted()
  }

  return (
    <>
      <h1 className='text-xl tracking-tight mb-5'>Booking History</h1>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created At</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Court</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time Start</TableHead>
                <TableHead>Time End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    {format(new Date(booking.created_at), 'MMM d | HH:mm')}
                  </TableCell>
                  <TableCell>{booking.User_Name}</TableCell>
                  <TableCell>{booking.Sport && booking.Sport}</TableCell>
                  <TableCell>{booking.Cluster && booking.Cluster}</TableCell>
                  <TableCell>{booking.Court && booking.Court}</TableCell>
                  <TableCell>
                    {format(new Date(`${booking.Date}T00:00:00`), 'MMM d')}
                  </TableCell>
                  <TableCell>
                    {booking.Time_Start && booking.Time_Start.slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    {booking.Time_End && booking.Time_End.slice(0, 5)}
                  </TableCell>
                  <TableCell>{booking.Status && booking.Status}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant='ghost'
                            size='icon'
                            className='size-8'
                          >
                            <MoreHorizontalIcon />
                            <span className='sr-only'>Open menu</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          variant='destructive'
                          onClick={() => {
                            handleDelete(booking.id)
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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
