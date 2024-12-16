import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import Stripe from "stripe";
import mercadopago from "mercadopago";
mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


//config variables
const currency = "ars";
const deliveryCharge = 5;
const frontend_URL = 'http://localhost:5173';

// Placing User Order for Frontend using stripe
const placeOrder = async (req, res) => {

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charge"
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
            line_items: line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

//mercadoPago
const placeMercadoPago = async (req, res) => {
    try {
      // Crear nueva orden en la base de datos
      const newOrder = new orderModel({
        userId: req.body.userId,
        items: req.body.items,
        amount: req.body.amount,
        address: req.body.address,
      });
      await newOrder.save();
      await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
  
      // Crear las preferencias de pago para Mercado Pago
      const items = req.body.items.map((item) => ({
        title: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        currency_id: currency.toUpperCase(),
      }));
  
      items.push({
        title: "Delivery Charge",
        unit_price: deliveryCharge,
        quantity: 1,
        currency_id: currency.toUpperCase(),
      });
  
      const preference = {
        items: items,
        back_urls: {
          success: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
          failure: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
          pending: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
        },
        auto_return: "approved",
        external_reference: newOrder._id.toString(),
      };
  
      const response = await mercadopago.preferences.create(preference);
  
      res.json({
        success: true,
        init_point: response.body.init_point, // URL para redirigir al usuario a Mercado Pago
      });
    } catch (error) {
      console.error(error);
      res.json({
        success: false,
        message: "Error al generar la orden para Mercado Pago",
      });
    }
  };

// Placing User Order for Frontend using stripe
const placeOrderCod = async (req, res) => {

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: true,
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({ success: true, message: "Orden generada con éxito" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Listing Order for Admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const updateStatus = async (req, res) => {
    console.log(req.body);
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        res.json({ success: false, message: "Error" })
    }

}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" })
        }
        else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        res.json({ success: false, message: "Not  Verified" })
    }

}

export { placeOrder, listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod, placeMercadoPago }