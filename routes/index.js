
import express from 'express'



const router = express.Router()

import  weatherRoutes  from "./weatherRoutes.js"
router.use('/', weatherRoutes)

export default router
