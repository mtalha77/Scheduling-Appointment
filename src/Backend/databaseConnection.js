import mongoose from 'mongoose'

const connectDb = handler => async (req, res) => {
  if (mongoose.connections[0].readyState) {
    return handler(req, res)
  }

  await mongoose.connect(
    'mongodb+srv://crmrankbpo:8PQnqzqTnGeXnSAX@crmrankorbit.gq2hhuc.mongodb.net/schedulingAppointments'
  )

  return handler(req, res)
}

export default connectDb
