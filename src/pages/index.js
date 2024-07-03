import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  CircularProgress,
  FormControl,
  Box,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import EditIcon from '@mui/icons-material/Edit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import DeleteIcon from '@mui/icons-material/Delete'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import { AppointmentType } from 'src/constants' // Make sure this path is correct
import ViewAppointmentDetailsDialog from '../views/pages/ViewAppointmentDetailsDialog'
import UpdateAppointmentDialog from '../views/pages/UpdateAppointmentDialog'
import formatTime from '../utilis/formatTime'
import Appointments24Hours from '../views/pages/Appointments24Hours'

const Home = () => {
  const [data, setData] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [viewDialog, setViewDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/appointments/get-all')
      console.log(res.data.payload.appointments)
      setData(res.data.payload.appointments)
    } catch (error) {
      console.log(error)
      toast.error('Error fetching data')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteClick = appointmentId => {
    setSelectedAppointment(appointmentId)
    setOpenDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await axios.delete('/api/appointments/delete', { data: { appointmentId: selectedAppointment } })
      setData(prev => {
        return prev.filter(p => {
          return p._id !== selectedAppointment
        })
      })
      toast.success('Appointment deleted successfully')
    } catch (error) {
      console.log(error)
      toast.error('Network Error')
    } finally {
      setDeleting(false)
      setOpenDialog(false)
      setSelectedAppointment(null)
    }
  }

  const handleCancelDelete = () => {
    setOpenDialog(false)
    setSelectedAppointment(null)
  }

  const handleViewDetails = appointmentId => {
    setSelectedAppointment(appointmentId)
    setViewDialog(true)
  }

  const handleCloseViewDialog = () => {
    setViewDialog(false)
    setSelectedAppointment(null)
  }

  const handleEditClick = appointmentId => {
    setSelectedAppointment(appointmentId)
    setEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setEditDialog(false)
    setSelectedAppointment(null)
  }

  const updateStatus = async (appointmentId, status) => {
    try {
      await axios.put(
        '/api/appointments/update-type',
        { appointmentId, status },
        {
          headers: { authorization: localStorage.getItem('token') }
        }
      )
      toast.success('Appointment status updated successfully')
      fetchData() // Refresh the data
    } catch (error) {
      console.error(error)
      toast.error('Error updating appointment status')
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Client Name',
        accessorKey: 'client_name'
      },
      {
        header: 'Client Email',
        accessorKey: 'client_email'
      },
      {
        header: 'Appointment Date',
        accessorKey: 'appointment_date',
        Cell: ({ cell }) => {
          const value = cell.getValue()

          return value ? new Date(value).toLocaleDateString() : ''
        }
      },
      {
        header: 'Appointment Time',
        accessorKey: 'appointment_time',
        Cell: ({ cell }) => {
          const value = cell.getValue()

          return formatTime(value)
        }
      },
      {
        header: 'Status',
        accessorKey: 'status',
        Cell: ({ cell }) => {
          const { _id } = cell.row.original
          const defaultValue = cell.getValue() ? cell.getValue() : ''
          const [value, setValue] = useState(defaultValue)

          return (
            <FormControl>
              <Select
                size='small'
                sx={{ fontSize: '14px' }}
                onChange={e => {
                  setValue(e.target.value)
                  updateStatus(_id, e.target.value)
                }}
                value={value}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
              >
                <MenuItem value={AppointmentType.UP_COMING}>Upcoming</MenuItem>
                <MenuItem value={AppointmentType.COMPLETED}>Completed</MenuItem>
                <MenuItem value={AppointmentType.CANCELLED}>Cancelled</MenuItem>
              </Select>
            </FormControl>
          )
        }
      },
      {
        header: 'Actions',
        accessorKey: 'actions',
        Cell: ({ cell }) => {
          const { _id } = cell.row.original

          return (
            <Box display={'flex'}>
              <div onClick={() => handleViewDetails(_id)} style={{ cursor: 'pointer' }}>
                <RemoveRedEyeIcon />
              </div>
              <div style={{ width: '15px' }}></div>
              <div onClick={() => handleEditClick(_id)} style={{ cursor: 'pointer' }}>
                <EditIcon />
              </div>
              <div style={{ width: '15px' }}></div>
              <div onClick={() => handleDeleteClick(_id)} style={{ cursor: 'pointer' }}>
                {deleting && selectedAppointment === _id ? <CircularProgress size={25} /> : <DeleteIcon />}
              </div>
            </Box>
          )
        }
      }
    ],
    [deleting, selectedAppointment, router]
  )

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnActions: false,
    enableSorting: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false
  })

  return (
    <>
      <Box textAlign={'right'} mb={5}>
        <Link href={'/user-form'} legacyBehavior>
          <Button variant='contained'>Create +</Button>
        </Link>
      </Box>
      <MaterialReactTable table={table} />
      <Appointments24Hours /> {/* Use the new component here */}
      <Dialog open={openDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color='primary' autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <ViewAppointmentDetailsDialog
        _id={selectedAppointment}
        open={viewDialog}
        onClose={handleCloseViewDialog}
        onUpdateComplete={fetchData} // Pass the fetchData function as a callback
      />
      <UpdateAppointmentDialog
        appointmentId={selectedAppointment}
        open={editDialog}
        onClose={handleCloseEditDialog}
        onUpdateComplete={fetchData}
      />
    </>
  )
}

export default Home
