import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import menuRoutes from './routes/menu.js'
import adminRoutes from './routes/admin.js'
import uploadRoutes from './routes/upload.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Security Middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By')
  
  next()
})

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL?.split(',') || process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}

app.use(cors(corsOptions))

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/menu', menuRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin', uploadRoutes)

// Serve static files from React app in production
if (NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist')
  app.use(express.static(frontendBuildPath))
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'))
    }
  })
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'EEU CAFE API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    mongodb: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  
  const statusCode = err.statusCode || 500
  const message = NODE_ENV === 'production' 
    ? (err.statusCode ? err.message : 'Internal server error')
    : err.message
  
  res.status(statusCode).json({
    error: message,
    ...(NODE_ENV !== 'production' && { stack: err.stack })
  })
})

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eeu-cafe'

let isMongoConnected = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 30000, // 30 seconds
  retryWrites: true,
  w: 'majority',
}

// Connection event handlers
mongoose.connection.on('connected', () => {
  isMongoConnected = true
  reconnectAttempts = 0
  console.log('✅ Connected to MongoDB')
})

mongoose.connection.on('error', (error) => {
  isMongoConnected = false
  console.error('❌ MongoDB connection error:', error.message)
})

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false
  console.log('⚠️  MongoDB disconnected. Attempting to reconnect...')
  attemptReconnect()
})

// Reconnection function
function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('❌ Max reconnection attempts reached. Please check your MongoDB connection.')
    return
  }

  reconnectAttempts++
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000) // Exponential backoff, max 30s
  
  console.log(`🔄 Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay/1000}s...`)
  
  setTimeout(() => {
    connectToMongoDB()
  }, delay)
}

// Connection function
function connectToMongoDB() {
  mongoose
    .connect(MONGODB_URI, mongooseOptions)
    .then(() => {
      isMongoConnected = true
      reconnectAttempts = 0
      console.log('✅ Connected to MongoDB')
    })
    .catch((error) => {
      isMongoConnected = false
      console.error('❌ MongoDB connection error:', error.message)
      
      // Provide helpful error messages
      if (error.message.includes('querySrv EREFUSED') || error.message.includes('ENOTFOUND')) {
        console.log('💡 Tip: Check your MongoDB Atlas connection string and network access.')
        console.log('💡 Tip: Ensure your IP address is whitelisted in MongoDB Atlas.')
      } else if (error.message.includes('authentication failed')) {
        console.log('💡 Tip: Check your MongoDB username and password in the connection string.')
      } else if (error.message.includes('timeout')) {
        console.log('💡 Tip: Check your network connection and MongoDB Atlas cluster status.')
      }
      
      // Attempt reconnection
      attemptReconnect()
    })
}

// Initial connection
connectToMongoDB()

// Start server immediately (don't wait for MongoDB)
function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📦 Environment: ${NODE_ENV}`)
    if (NODE_ENV === 'production') {
      console.log('✅ Production mode enabled')
    }
    if (!isMongoConnected) {
      console.log('⚠️  MongoDB not connected - operations may fail')
      console.log('⚠️  Menu data will not persist until connection is established.')
    }
  })
}

startServer()

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})

// Make connection status available globally
global.isMongoConnected = isMongoConnected

// Update global status when connection changes
mongoose.connection.on('connected', () => {
  global.isMongoConnected = true
})

mongoose.connection.on('disconnected', () => {
  global.isMongoConnected = false
})

