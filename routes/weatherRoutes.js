
import express from 'express'
import { analyticsByCityController, analyticsController } from '../controllers/analyticsController.js'

const router = express.Router()

router.post('/analytics/cities', analyticsController)

router.get('/analytics/city/:name', analyticsByCityController)

export default router