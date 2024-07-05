import { useState } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import { useRouter } from 'next/router'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Spinner from 'src/@core/components/spinner'
import { useAuth } from 'src/hooks/useAuth'
import { userSchema } from 'src/yupSchemas/userSchema' // You need to define this schema

const schema = userSchema

const UserAppointmentFormComponent = () => {
  const router = useRouter()
  const { userId } = router.query
  const [apiLoading, setApiLoading] = useState(false)
  const [update, setUpdate] = useState(false)

  const defaultValues = async () => {
    if (!userId) {
      setUpdate(false)

      return { user_name: '', password: '' }
    }
    try {
      setApiLoading(true)

      const res = await axios.get(`/api/user/${userId}`, {
        headers: { authorization: localStorage.getItem('token') }
      })
      setUpdate(true)

      return res.data.payload.user
    } catch (error) {
      toast.error(error?.response?.data)
    } finally {
      setApiLoading(false)
    }
  }

  const methods = useForm({ defaultValues, resolver: yupResolver(schema), mode: 'onChange' })
  const { departments } = useAuth()

  const onSubmit = async data => {
    const { user_name, password } = data

    const requestData = {
      user_name,
      password
    }

    if (update) {
      const apiUrl = '/api/user/update'

      await axios
        .put(apiUrl, requestData, { headers: { authorization: localStorage.getItem('token') } })
        .then(() => {
          toast.success('User updated successfully')
        })
        .catch(error => {
          console.error('Error:', error)
          toast.error(error?.response?.data || 'Something went wrong')
        })
    } else {
      const apiUrl = '/api/user/create'

      await axios
        .post(apiUrl, requestData, { headers: { authorization: localStorage.getItem('token') } })
        .then(() => {
          toast.success('User created successfully')
          methods.reset({ user_name: '', password: '' })
        })
        .catch(error => {
          console.error('Error:', error)
          toast.error(error?.response?.data || 'Something went wrong')
        })
    }
  }

  return (
    <>
      <FormProvider {...methods}>
        <form noValidate autoComplete='off' onSubmit={methods.handleSubmit(onSubmit)}>
          {apiLoading ? (
            <Spinner />
          ) : (
            <div>
              <div>
                <label>User Name</label>
                <input {...methods.register('user_name')} />
              </div>
              <div>
                <label>Password</label>
                <input type='password' {...methods.register('password')} />
              </div>
              <button type='submit'>{update ? 'Update' : 'Create'} User</button>
            </div>
          )}
        </form>
      </FormProvider>
    </>
  )
}

export default UserAppointmentFormComponent
