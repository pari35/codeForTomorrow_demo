import express from 'express'

import dotenv from "dotenv"
import routes from './routes/index.js'
const app = express()

app.use(express.json())

let port = 4000

app.listen(port, async () => {
    console.log(`server is running at port ${port}` )
})

app.use('/api',routes)
export default app