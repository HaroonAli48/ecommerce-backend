import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import {initiatePayment} from './controllers/orderController.js'

// app config
const app = express()
const port = process.env.PORT || 8080
connectDB();
connectCloudinary();

//middlewares
app.use(express.json())
app.use(cors())


//api endpoints
app.use('/api/user',userRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter)

import bodyParser from 'body-parser'

app.use(bodyParser.json());

app.post('/api/pay', async (req, res) => {
  const { amount, orderId, phoneNumber } = req.body;

  if (!amount || !orderId || !phoneNumber) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const paymentResponse = await initiatePayment(amount, orderId, phoneNumber);
  res.json(paymentResponse);
});

app.get('/',(req,res)=>{
    res.send("HMH STUDIO ON TOP")
})

app.listen(port,()=>console.log('HMH'+port))