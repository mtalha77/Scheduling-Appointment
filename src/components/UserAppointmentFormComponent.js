import { useState, useEffect } from 'react'
import { Button, FormControl, FormHelperText, Grid, TextField, Select, MenuItem, InputLabel } from '@mui/material'
import axios from 'axios'
import { Controller, useForm, FormProvider, useFormContext } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import Spinner from 'src/@core/components/spinner'
import { appointmentSchema } from '../yupSchemas/appointmentSchema' // Ensure this schema is defined
import { useRouter } from 'next/router'
import { AppointmentType } from '../constants'

const AppointmentForm = ({ update, defaultValues, onSubmit }) => {
  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext()

  useEffect(() => {
    if (defaultValues) {
      for (const [key, value] of Object.entries(defaultValues)) {
        setValue(key, value, { shouldValidate: true })
      }
    }
  }, [defaultValues, setValue])

  return (
    <form noValidate autoComplete='off' onSubmit={onSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.client_name}>
            <Controller
              name='client_name'
              control={control}
              render={({ field }) => (
                <>
                  <TextField label='Client Name' {...field} error={Boolean(errors.client_name)} fullWidth />
                  {errors.client_name && <FormHelperText>{errors.client_name.message}</FormHelperText>}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.client_email}>
            <Controller
              name='client_email'
              control={control}
              render={({ field }) => (
                <>
                  <TextField label='Client Email' {...field} error={Boolean(errors.client_email)} fullWidth />
                  {errors.client_email && <FormHelperText>{errors.client_email.message}</FormHelperText>}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.client_phone}>
            <Controller
              name='client_phone'
              control={control}
              render={({ field }) => (
                <>
                  <TextField label='Client Phone' {...field} error={Boolean(errors.client_phone)} fullWidth />
                  {errors.client_phone && <FormHelperText>{errors.client_phone.message}</FormHelperText>}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.appointment_date}>
            <Controller
              name='appointment_date'
              control={control}
              render={({ field }) => (
                <>
                  <TextField
                    type='date'
                    label='Appointment Date'
                    {...field}
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.appointment_date)}
                    fullWidth
                  />
                  {errors.appointment_date && <FormHelperText>{errors.appointment_date.message}</FormHelperText>}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.appointment_time}>
            <Controller
              name='appointment_time'
              control={control}
              render={({ field }) => (
                <>
                  <TextField
                    type='time'
                    label='Appointment Time'
                    {...field}
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.appointment_time)}
                    fullWidth
                  />
                  {errors.appointment_time && <FormHelperText>{errors.appointment_time.message}</FormHelperText>}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.details}>
            <Controller
              name='details'
              control={control}
              render={({ field }) => (
                <>
                  <TextField label='Details' {...field} error={Boolean(errors.details)} fullWidth />
                  {errors.details && <FormHelperText>{errors.details.message}</FormHelperText>}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id='status-label'>Status</InputLabel>
            <Controller
              name='status'
              control={control}
              defaultValue={AppointmentType.UP_COMING}
              render={({ field }) => (
                <Select {...field} labelId='status-label' label='Status' fullWidth>
                  <MenuItem value={AppointmentType.UP_COMING}>Upcoming</MenuItem>
                  <MenuItem value={AppointmentType.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={AppointmentType.CANCELLED}>Cancelled</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        </Grid>
      </Grid>
      <Button fullWidth size='large' type='submit' variant='contained' sx={{ mt: 3, mb: 7 }}>
        {update ? 'Update' : 'Create'} Appointment
      </Button>
    </form>
  )
}

const UserAppointmentFormComponent = () => {
  const router = useRouter()
  const { appointmentId } = router.query
  const [apiLoading, setApiLoading] = useState(false)
  const [defaultValues, setDefaultValues] = useState(null)

  const methods = useForm({
    defaultValues: {
      client_name: '',
      client_email: '',
      client_phone: '',
      appointment_date: '',
      appointment_time: '',
      details: '',
      status: AppointmentType.UP_COMING
    },
    resolver: yupResolver(appointmentSchema),
    mode: 'onChange'
  })

  useEffect(() => {
    if (appointmentId) {
      const fetchAppointment = async () => {
        try {
          setApiLoading(true)

          const res = await axios.get(`/api/appointments/${appointmentId}`, {
            headers: { authorization: localStorage.getItem('token') }
          })
          const appointment = res.data.payload.appointment
          setDefaultValues(appointment)
          methods.reset(appointment)
          setApiLoading(false)
        } catch (error) {
          toast.error(error?.response?.data)
          setApiLoading(false)
        }
      }
      fetchAppointment()
    }
  }, [appointmentId, methods])

  const onSubmit = methods.handleSubmit(async data => {
    if (appointmentId) {
      try {
        await axios.put(`/api/appointments/${appointmentId}`, data, {
          headers: { authorization: localStorage.getItem('token') }
        })
        toast.success('Appointment updated successfully')
      } catch (error) {
        toast.error(error?.response?.data || 'Something went wrong')
      }
    } else {
      try {
        await axios.post('/api/appointments/create', data, {
          headers: { authorization: localStorage.getItem('token') }
        })
        toast.success('Appointment created successfully')
        methods.reset({
          client_name: '',
          client_email: '',
          client_phone: '',
          appointment_date: '',
          appointment_time: '',
          details: '',
          status: AppointmentType.UP_COMING
        })
      } catch (error) {
        toast.error(error?.response?.data || 'Something went wrong')
      }
    }
  })

  return (
    <FormProvider {...methods}>
      {apiLoading ? (
        <Spinner />
      ) : (
        <AppointmentForm update={!!appointmentId} defaultValues={defaultValues} onSubmit={onSubmit} />
      )}
    </FormProvider>
  )
}

export default UserAppointmentFormComponent
