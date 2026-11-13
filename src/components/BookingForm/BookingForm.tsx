import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import supabase from '@/shared/database/supabaseClient'

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
import { Input } from '@base-ui/react'

const sports = [
  { name: 'Basketball', value: 'Basketball', icon: BasketballIcon },
  { name: 'Paddle', value: 'Paddle', icon: PadelIcon },
] as const
const clusters = ['A', 'B', 'C', 'D', 'E'] as const

const bookingSchema = z.object({
  Sport: z.enum(['Basketball', 'Paddle']),
  Cluster: z.enum(clusters),
  Date: z.iso.date(),
  Time: z
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
})

const BookingForm = () => {
  const form = useForm<z.infer<typeof bookingSchema>>({
    defaultValues: {
      Sport: 'Basketball',
      Cluster: 'A',
      Date: format(new Date(), 'yyyy-MM-dd'),
      Time: format(new Date(), 'HH:mm'),
    },
    resolver: zodResolver(bookingSchema),
  })

  async function onSubmit(d: z.infer<typeof bookingSchema>) {
    console.log(d)

    const { data, error } = await supabase
      .from('Booking History')
      .insert([d])
      .select()

    if (error) {
      console.log(error)
    }

    if (data) {
      console.log(data)
    }
  }

  return (
    <>
      <h1 className='text-xl tracking-tight mb-5'>Schedule New Booking</h1>
      <Card className='mb-10 w-full sm:w-80'>
        <CardContent>
          <form id='form' onSubmit={form.handleSubmit(onSubmit)}>
            {/* Sport Field */}
            <FieldGroup className='grid grid-cols-2 gap-4'>
              <Controller
                control={form.control}
                name='Sport'
                render={({
                  field: { onChange, onBlur, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Sport</FieldLabel>
                    <Select {...field} onValueChange={onChange}>
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
                      <SelectContent className={'p-2'}>
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
                    <Select {...field} onValueChange={onChange}>
                      <SelectTrigger
                        aria-invalid={fieldState.invalid}
                        onBlur={onBlur}
                        id={field.name}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clusters.map((cluster) => (
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
                            variant={'outline'}
                            id={field.name}
                            className='justify-between font-normal '
                          >
                            {field.value ? (
                              format(new Date(`${field.value}`), 'MMM d, yyyy')
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
                            field.value ? new Date(`${field.value}`) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(
                              date ? format(date, 'yyyy-MM-dd') : '',
                            )
                          }
                          // defaultMonth={date}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* Time Field */}
              <Controller
                control={form.control}
                name='Time'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Time</FieldLabel>
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
          <Field orientation={'horizontal'} className='justify-end'>
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
