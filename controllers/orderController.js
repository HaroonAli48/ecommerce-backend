import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import Stripe from 'stripe'
import 'dotenv/config'
import axios from "axios"
import crypto from "crypto"

const deliverCharge = 10
const currency = 'PKR'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const placeOrder = async (req,res) => {
    
    try {
        
        const {userId,items,amount,address} = req.body

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:'COD',
            payment:false,
            date:Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed"})

    } catch (error) {

        console.log(error);
        res.json({success:false,message:error.message})
        
        
    }

}
const placeOrderOnline = async (req,res) => {
    
    try {
        
        const {userId,items,amount,address} = req.body

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:'Online',
            payment:false,
            date:Date.now(),
            status:'Unpaid'
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed"})

    } catch (error) {

        console.log(error);
        res.json({success:false,message:error.message})
        
        
    }

}

const placeOrderStripe = async (req,res) => {
    try {
        
        const {userId,items,amount,address} = req.body;
        const {origin} = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:'Stripe',
            payment:false,
            date:Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item)=>({
            price_data:{
                currency:currency,
                product_data:{
                    name:item.name
                },
                unit_amount: item.price*100
            },
            quantity: item.quantity
        })) 

        line_items.push({
            price_data:{
                currency:currency,
                product_data:{
                    name:"Delivery Charges"
                },
                unit_amount: deliverCharge*100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode:'payment'
        })

        res.json({success:true,session_url:session.url})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

const verifyStripe = async (req,res) => {
    
    const {orderId,success,userId} = req.body;

    try {
        if (success==="true") {
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            await userModel.findByIdAndUpdate(userId,{cartData:{}});
            res.json({success:true})
        } else{
            await orderModel.findByIdAndUpdate(orderId)
            res.json({success:false})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
        
    }
}

const placeOrderRazorpay = async (req,res) => {
    
}

const allOrders = async (req,res) => {
    try {
        
        const orders =  await orderModel.find({})
        res.json({success:true,orders})

    } catch (error) {
        
        console.log(error);
        res.json({success:false,message:error.message})
        

    }
}

const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({userId})

        res.json({success:true,orders})

    } catch (error) {

        console.log(error);
        res.json({success:false,message:error.message})
        
        
    }
}

const updateStatus = async (req,res) => {
    try {
        
        const {orderId, status} = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({success:true,message:"Status Updated"})

    } catch (error) {
        
        console.log(error);
        res.json({success:false,message:error.message})
        
    }
}


const jazzcashConfig = {
    merchantId: process.env.JAZZCASH_MERCHANT_ID,
    password: process.env.JAZZCASH_PASSWORD,
    integritySalt: process.env.JAZZCASH_INTEGRITY_SALT,
    returnUrl: process.env.JAZZCASH_RETURN_URL,
    apiUrl: process.env.JAZZCASH_API_URL,
  };
  
  function generateSecureHash(params) {
    const sortedKeys = Object.keys(params).sort();
    let hashString = jazzcashConfig.integritySalt;
    
    sortedKeys.forEach((key) => {
      hashString += `&${params[key]}`;
    });
  
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }
  
  async function initiatePayment(amount, orderId, phoneNumber) {
    const date = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
  
    const requestData = {
      pp_Version: '2.0',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: jazzcashConfig.merchantId,
      pp_Password: jazzcashConfig.password,
      pp_TxnRefNo: orderId,
      pp_Amount: amount * 100, 
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: date,
      pp_BillReference: 'Test Payment',
      pp_Description: 'E-commerce transaction',
      pp_TxnExpiryDateTime: date, // Set expiry same as txn date
      pp_ReturnURL: jazzcashConfig.returnUrl,
      ppmpf_1: phoneNumber,
    };
  
    requestData.pp_SecureHash = generateSecureHash(requestData);
  
    try {
      const response = await axios.post(jazzcashConfig.apiUrl, requestData, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      return response.data;
    } catch (error) {
      console.error('Error initiating JazzCash payment:', error);
      return { success: false, message: error.message };
    }
  }
  

export {verifyStripe,placeOrder,placeOrderRazorpay,placeOrderStripe,allOrders,userOrders,updateStatus,initiatePayment,placeOrderOnline}