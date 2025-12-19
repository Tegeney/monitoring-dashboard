import mongoose from 'mongoose'

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
})

const menuSlotSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  time: { type: String, required: true },
  foods: [foodItemSchema],
})

const menuSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  slots: [menuSlotSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

menuSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.model('Menu', menuSchema)

