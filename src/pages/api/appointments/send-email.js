import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'
import { sendEmail } from '../../../Backend/mailerSend'
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'
import dayjs from 'dayjs'

const mailerSend = new MailerSend({
  apiKey: 'mlsn.9794f3c98a5782999dd8016e02407362789f797b5dea6675a25f9e6f5a1e5899'
})

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { appointmentId } = req.body
      const saved = await AppointmentModel.findById(appointmentId)

      if (!saved) {
        return res.status(404).send('Appointment not found')
      }

      const sentFrom = new Sender('info@rockstarpainting.us', 'RockStar Paints')

      const recipients = [new Recipient(saved.client_email, saved.client_name)]

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject('Appointment Confirmation')
        .setHtml(
          `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmation</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #0073e6;
            color: #ffffff;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
        }
        .content p {
            margin: 10px 0;
            line-height: 1.6;
        }
        .content strong {
            color: #0073e6;
        }
        .appointment-details {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .appointment-details p {
            margin: 8px 0;
        }
        .footer {
            text-align: center;
            padding: 10px 0;
            background-color: #0073e6;
            color: #ffffff;
            font-size: 12px;
            border-radius: 0 0 8px 8px;
        }
        .footer p {
            margin: 0;
        }
        a {
            color: #0073e6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Appointment Confirmation</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${saved.client_name}</strong>,</p>
            <p>We are pleased to confirm your appointment:</p>
            <div class="appointment-details">
                <p><strong>Date:</strong> ${dayjs(saved.appointment_date).format('D-MMMM-YYYY')}</p>
                <p><strong>Time:</strong> ${saved.appointment_time}</p>
            </div>
            <p>If you have any questions or need to reschedule, please contact us at <a href="mailto:your-email@example.com">your-email@example.com</a> or call us at (123) 456-7890.</p>
            <p>Thank you for choosing our services. We look forward to seeing you!</p>
            <p>Best regards,</p>
            <p><strong>RockStar Paints</strong></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 RockStar Paints. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
        )
        .setText('This is the text content')

      const h = await mailerSend.email.send(emailParams)
      console.log(h)

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
