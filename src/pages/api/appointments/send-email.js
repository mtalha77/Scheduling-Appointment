import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'
import { sendEmail } from '../../../Backend/mailerSend'

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { appointmentId } = req.body
      const appointment = await AppointmentModel.findById(appointmentId)

      if (!appointment) {
        return res.status(404).send('Appointment not found')
      }

      await sendEmail(
        appointment.client_email,
        'Appointment Confirmation',
        `Your appointment is scheduled for ${appointment.appointment_date} at ${appointment.appointment_time}.`
      )

      return res.send({
        message: 'Email sent successfully'
      })
    } catch (error) {
      console.error('Error sending email:', error)
      res.status(500).send('Something went wrong')
    }
  } else {
    res.status(405).send('Method Not Allowed')
  }
}

export default connectDb(handler)
