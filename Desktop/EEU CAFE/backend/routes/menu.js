import express from 'express'
import Menu from '../models/Menu.js'
import mongoose from 'mongoose'

const router = express.Router()

// Helper to check MongoDB connection
const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // If MongoDB not connected, return default menu structure
    return next()
  }
  next()
}

// GET /api/menu/:date - Get menu for specific date
router.get('/:date', checkMongoConnection, async (req, res) => {
  try {
    const { date } = req.params
    let menu = null
    
    // Only try to fetch from database if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        menu = await Menu.findOne({ date }).maxTimeMS(10000) // 10 second timeout
      } catch (dbError) {
        console.error('Database query error:', dbError.message)
        // Continue to return default menu
      }
    }

    // If no menu exists, return default structure based on day of week
    if (!menu) {
      const menuDate = new Date(date)
      const dayOfWeek = menuDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      // Default slots for all days (Monday-Saturday)
      let defaultSlots = [
        {
          key: 'morning-meal',
          label: '🍽️ Morning Meal',
          time: '08:00',
          foods: [
            { name: 'Breakfast Items', image: '' },
            { name: 'Toast', image: '' },
            { name: 'Eggs', image: '' },
          ],
        },
        {
          key: 'morning-tea',
          label: '☕ Morning Tea/Coffee',
          time: '10:00',
          foods: [
            { name: 'Coffee', image: '' },
            { name: 'Tea', image: '' },
            { name: 'Pastries', image: '' },
          ],
        },
        {
          key: 'lunch-meal',
          label: '🍛 Lunch Meal',
          time: '12:00',
          foods: [
            { name: 'Main Course', image: '' },
            { name: 'Rice', image: '' },
            { name: 'Vegetables', image: '' },
          ],
        },
        {
          key: 'afternoon-meal',
          label: '☕ Afternoon Coffee',
          time: '15:00',
          foods: [
            { name: 'Coffee', image: '' },
            { name: 'Tea', image: '' },
            { name: 'Snacks', image: '' },
          ],
        },
      ]

      // Sunday: Closed
      if (dayOfWeek === 0) {
        defaultSlots = []
      }

      menu = {
        date,
        slots: defaultSlots,
      }
    }

    res.json(menu)
  } catch (error) {
    console.error('Error fetching menu:', error)
    
    // If database error, return default menu structure
    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      // Return default menu structure based on day
      const menuDate = new Date(date)
      const dayOfWeek = menuDate.getDay()
      
      let defaultSlots = []
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        defaultSlots = [
          { key: 'morning-meal', label: '🍽️ Morning Meal', time: '08:00', foods: [] },
          { key: 'morning-tea', label: '☕ Morning Tea/Coffee', time: '10:00', foods: [] },
          { key: 'lunch-meal', label: '🍛 Lunch Meal', time: '12:00', foods: [] },
          { key: 'afternoon-meal', label: '☕ Afternoon Coffee', time: '15:00', foods: [] },
        ]
      }
      
      return res.json({ date, slots: defaultSlots })
    }
    
    res.status(500).json({ error: 'Failed to fetch menu' })
  }
})

export default router

