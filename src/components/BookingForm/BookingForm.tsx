import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addMinutes, format } from 'date-fns'
import type { Dispatch, SetStateAction } from 'react'
import supabase from '@/shared/database/supabaseClient'
import type { Booking } from '@/App'

import { toast } from '@/components/ui/toast'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'

import { ChevronDownIcon } from 'lucide-react'
import BasketballIcon from '@/assets/icons/andrsrxn--ball-basketball.svg?react'
import PadelIcon from '@/assets/icons/material-symbols--padel-outline-rounded.svg?react'
import { Input } from '@/components/ui/input'

const sports = [
  { name: 'Basketball', value: 'Basketball', icon: BasketballIcon },
  { name: 'Paddle', value: 'Paddle', icon: PadelIcon },
] as const

const clusterOptions = {
  Basketball: ['C', 'E', 'F1', 'F2', 'G', 'H', 'I', 'J'],
  Paddle: ['A', 'D', 'I'],
} as const

const allClusters = [
  'A',
  'C',
  'D',
  'E',
  'F1',
  'F2',
  'G',
  'H',
  'I',
  'J',
] as const
const courts = ['N/A', '1', '2'] as const

type Sport = (typeof sports)[number]['value']
type Cluster = (typeof allClusters)[number]

const getCourtOptions = (sport: Sport, cluster: Cluster) => {
  return sport === 'Paddle' && cluster === 'I'
    ? (['1', '2'] as const)
    : (['N/A'] as const)
}

const bookingSchema = z
  .object({
    User_Name: z.string(),
    Password: z.string(),
    Sport: z.enum(['Basketball', 'Paddle']),
    Cluster: z.enum(allClusters),
    Court: z.enum(courts),
    Date: z.iso.date(),
    Time_Start: z
      .string()
      .transform((time) => (time.length === 5 ? `${time}:00` : time))
      .pipe(
        z.iso.time().refine(
          (time) => {
            const [, minutes, seconds] = time.split(':')
            return ['00', '30'].includes(minutes) && seconds === '00'
          },
          { message: 'Time must be in 30-minute increments' },
        ),
      ),
    Time_End: z
      .string()
      .transform((time) => (time.length === 5 ? `${time}:00` : time))
      .pipe(
        z.iso.time().refine(
          (time) => {
            const [, minutes, seconds] = time.split(':')
            return ['00', '30'].includes(minutes) && seconds === '00'
          },
          { message: 'Time must be in 30-minute increments' },
        ),
      ),
    Status: z.string(),
  })
  .superRefine((booking, ctx) => {
    const validClusters: readonly string[] = clusterOptions[booking.Sport]

    if (!validClusters.includes(booking.Cluster)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid cluster for the selected sport',
        path: ['Cluster'],
      })
    }

    const validCourts: readonly string[] = getCourtOptions(
      booking.Sport,
      booking.Cluster,
    )

    if (!validCourts.includes(booking.Court)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid court for the selected cluster',
        path: ['Court'],
      })
    }

    if (booking.Time_End <= booking.Time_Start) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be later than start time.',
        path: ['Time_End'],
      })
    }
  })

interface BookingFormProps {
  setBookings: Dispatch<SetStateAction<Booking[]>>
}

const BookingForm = ({ setBookings }: BookingFormProps) => {
  const now = new Date()

  const form = useForm<z.infer<typeof bookingSchema>>({
    defaultValues: {
      User_Name: '',
      Password: '',
      Sport: 'Basketball',
      Cluster: 'C',
      Court: 'N/A',
      Date: format(new Date(), 'yyyy-MM-dd'),
      Time_Start: format(new Date(), 'HH:mm'),
      Time_End: format(addMinutes(now, 30), 'HH:mm'),
      Status: 'Pending',
    },
    resolver: zodResolver(bookingSchema),
  })

  const selectedSport = useWatch({ control: form.control, name: 'Sport' })
  const selectedCluster = useWatch({ control: form.control, name: 'Cluster' })

  async function onSubmit(d: z.infer<typeof bookingSchema>) {
    const { data, error } = await supabase
      .from('Booking History')
      .insert([d])
      .select()

    console.log(data)

    if (error) {
      toast.add({
        title: 'Booking failed',
        description: error.message,
        type: 'error',
      })
      return
    }

    if (data) {
      setBookings((prevBookings) => [...data, ...prevBookings].slice(0, 10))
      form.reset()

      toast.add({
        title: 'Booking scheduled',
        description:
          'Your booking will be attempted every day at 00:00 (AST, UTC+3).',
        type: 'success',
      })
    }
  }

  return (
    <>
      <h1 className='text-xl tracking-tight mb-5'>Schedule New Booking</h1>

      <Card className='mb-10 w-full sm:w-80'>
        <CardContent>
          <form id='form' onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className='grid grid-cols-2 gap-4'>
              {/* User Name Field */}
              <Controller
                control={form.control}
                name='User_Name'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>User Name</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type='text'
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Password Field */}
              <Controller
                control={form.control}
                name='Password'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type='password'
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Sport Field */}
              <Controller
                control={form.control}
                name='Sport'
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Sport</FieldLabel>

                    <Select
                      {...field}
                      onValueChange={(value) => {
                        if (value === null) return

                        onChange(value)
                        form.setValue('Cluster', clusterOptions[value][0])
                        form.setValue('Court', 'N/A')
                      }}
                    >
                      <SelectTrigger
                        aria-invalid={fieldState.invalid}
                        onBlur={onBlur}
                        id={field.name}
                      >
                        <SelectValue>
                          {(() => {
                            const selectedSport = sports.find(
                              (sport) => sport.value === field.value,
                            )

                            if (!selectedSport) return null

                            const Icon = selectedSport.icon

                            return (
                              <div className='flex items-center gap-2'>
                                <Icon className='h-5 w-5' />
                                <span>{selectedSport.name}</span>
                              </div>
                            )
                          })()}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent className='p-2'>
                        {sports.map((sport) => {
                          const Icon = sport.icon

                          return (
                            <SelectItem key={sport.value} value={sport.value}>
                              <div className='flex items-center gap-2'>
                                <Icon className='h-5 w-5' />
                                <span>{sport.name}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Cluster Field */}
              <Controller
                control={form.control}
                name='Cluster'
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Cluster</FieldLabel>

                    <Select
                      {...field}
                      onValueChange={(value) => {
                        if (value === null) return

                        onChange(value)
                        form.setValue(
                          'Court',
                          getCourtOptions(selectedSport, value)[0],
                        )
                      }}
                    >
                      <SelectTrigger
                        aria-invalid={fieldState.invalid}
                        onBlur={onBlur}
                        id={field.name}
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent className='p-2'>
                        {clusterOptions[selectedSport].map((cluster) => (
                          <SelectItem key={cluster} value={cluster}>
                            {cluster}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Court Field */}
              <Controller
                control={form.control}
                name='Court'
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Court</FieldLabel>

                    <Select {...field} onValueChange={onChange}>
                      <SelectTrigger
                        aria-invalid={fieldState.invalid}
                        onBlur={onBlur}
                        id={field.name}
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent className='p-2'>
                        {getCourtOptions(selectedSport, selectedCluster).map(
                          (court) => (
                            <SelectItem key={court} value={court}>
                              {court}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Date Field */}
              <Controller
                control={form.control}
                name='Date'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Date</FieldLabel>

                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant='outline'
                            id={field.name}
                            className='justify-between font-normal'
                          >
                            {field.value ? (
                              format(
                                new Date(`${field.value}T00:00:00`),
                                'MMM d, yyyy',
                              )
                            ) : (
                              <span>Pick a date</span>
                            )}

                            <ChevronDownIcon
                              data-icon='inline-end'
                              className='text-muted-foreground'
                            />
                          </Button>
                        }
                      />

                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={
                            field.value
                              ? new Date(`${field.value}T00:00:00`)
                              : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(
                              date ? format(date, 'yyyy-MM-dd') : '',
                            )
                          }
                        />
                      </PopoverContent>
                    </Popover>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Time_Start Field */}
              <Controller
                control={form.control}
                name='Time_Start'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Start Time</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type='time'
                      step={1800}
                      aria-invalid={fieldState.invalid}
                      className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Time_End Field */}
              <Controller
                control={form.control}
                name='Time_End'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>End Time</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type='time'
                      step={1800}
                      aria-invalid={fieldState.invalid}
                      className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter>
          <Field orientation='horizontal' className='justify-end'>
            <Button type='submit' form='form'>
              Create Booking
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </>
  )
}

export default BookingForm
