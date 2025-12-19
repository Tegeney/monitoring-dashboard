import express from 'express'
import Menu from '../models/Menu.js'
import mongoose from 'mongoose'

const router = express.Router()

// Helper to check MongoDB connection
const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database not connected. Please check your MongoDB connection and try again.',
      retry: true,
      details: 'The server cannot connect to MongoDB. Please verify your connection string and network access.'
    })
  }
  next()
}

// Middleware to check admin key
const checkAdminKey = (req, res, next) => {
  const adminKey = req.headers['x-admin-key']
  const validKey = process.env.ADMIN_KEY || 'your-secret-admin-key'

  if (!adminKey || adminKey !== validKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin key' })
  }

  next()
}

// POST /api/admin/menu - Save/update menu
router.post('/menu', checkAdminKey, checkMongoConnection, async (req, res) => {
  try {
    const { date, slots } = req.body

    if (!date || !slots) {
      return res.status(400).json({ error: 'Date and slots are required' })
    }

    // Validate slots structure (allow flexible slots based on day)
    const validKeys = ['morning-tea', 'morning-meal', 'lunch-meal', 'afternoon-meal']
    const slotKeys = slots.map((s) => s.key)
    const invalidKeys = slotKeys.filter(key => !validKeys.includes(key))
    if (invalidKeys.length > 0) {
      return res.status(400).json({ error: `Invalid slot keys: ${invalidKeys.join(', ')}` })
    }

    // Update or create menu with timeout
    const menu = await Menu.findOneAndUpdate(
      { date },
      {
        date,
        slots,
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        maxTimeMS: 20000, // 20 second timeout
      }
    )

    res.json({ message: 'Menu saved successfully', menu })
  } catch (error) {
    console.error('Error saving menu:', error)
    
    // Provide more specific error messages
    if (error.name === 'MongoServerError' || error.name === 'MongooseError') {
      if (error.message.includes('timeout') || error.message.includes('buffering')) {
        return res.status(503).json({ 
          error: 'Database operation timed out. Please check your MongoDB connection and try again.',
          retry: true
        })
      }
      return res.status(503).json({ 
        error: 'Database error. Please try again.',
        retry: true
      })
    }
    
    res.status(500).json({ error: 'Failed to save menu: ' + error.message })
  }
})

export default router


