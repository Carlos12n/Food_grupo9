import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {
    const [payment, setPayment] = useState("cod");
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    });

    const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems, currency, deliveryCharge } = useContext(StoreContext);
    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    };

    const placeOrder = async (e) => {
        e.preventDefault();

        let orderItems = [];
        food_list.forEach((item) => {
            if (cartItems[item._id] > 0) {
                orderItems.push({ ...item, quantity: cartItems[item._id] });
            }
        });

        let orderData = {
            address: data,
            items: orderItems,
            amount: getTotalCartAmount() + deliveryCharge,
        };

        try {
            if (payment === "mercadopago") {
                let response = await axios.post(`${url}/api/order/placemercadopago`, orderData, { headers: { token } });
                if (response.data.success) {
                    window.location.replace(response.data.init_point);
                } else {
                    toast.error("Algo salió mal con Mercado Pago.");
                }
            } else if (payment === "cod") {
                let response = await axios.post(`${url}/api/order/placecod`, orderData, { headers: { token } });
                if (response.data.success) {
                    setCartItems({});
                    navigate("/myorders");
                    toast.success(response.data.message);
                } else {
                    toast.error("Algo salió mal con el pedido.");
                }
            }
        } catch (error) {
            toast.error("Hubo un error al procesar tu pedido.");
        }
    };

    useEffect(() => {
        if (!token) {
            toast.error("Para realizar un pedido, inicia sesión primero.");
            navigate('/cart');
        } else if (getTotalCartAmount() === 0) {
            navigate('/cart');
        }
    }, [token, getTotalCartAmount, navigate]);

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className="place-order-left">
                <p className='title'>Información del Delivery</p>
                <div className="multi-field">
                    <input type="text" name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='nombre' required />
                    <input type="text" name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='apellido' required />
                </div>
                <input type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder='email' required />
                <input type="text" name='street' onChange={onChangeHandler} value={data.street} placeholder='calle' required />
                <div className="multi-field">
                    <input type="text" name='city' onChange={onChangeHandler} value={data.city} placeholder='ciudad' required />
                    <input type="text" name='state' onChange={onChangeHandler} value={data.state} placeholder='provinvia' required />
                </div>
                <div className="multi-field">
                    <input type="text" name='zipcode' onChange={onChangeHandler} value={data.zipcode} placeholder='codigo postal' required />
                    <input type="text" name='country' onChange={onChangeHandler} value={data.country} placeholder='pais' required />
                </div>
                <input type="text" name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Phone' required />
            </div>

            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Detalle del Carrito</h2>
                    <div className="cart-items">
                        {food_list.map((item) => {
                            const quantity = cartItems[item._id] || 0;
                            if (quantity > 0) {
                                return (
                                    <div key={item._id} className="cart-item">
                                        <p>{item.name}</p>
                                        <p>Cantidad: {quantity}</p>
                                        <p>Subtotal: {currency}{(item.price * quantity).toFixed(2)}</p>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                    <hr />
                    <div className="cart-total-details">
                        <p>Subtotal</p>
                        <p>{currency}{getTotalCartAmount()}</p>
                    </div>
                    <div className="cart-total-details">
                        <p>Costo Delivery</p>
                        <p>{currency}{deliveryCharge}</p>
                    </div>
                    <hr />
                    <div className="cart-total-details">
                        <b>Total</b>
                        <b>{currency}{getTotalCartAmount() + deliveryCharge}</b>
                    </div>
                </div>

                <div className="payment">
                    <h2>Medio de Pago</h2>
                    <div
                        onClick={() => setPayment("cod")}
                        className={`payment-option ${payment === "cod" ? "selected" : ""}`}>
                        <img src={payment === "cod" ? assets.checked : assets.un_checked} alt="" />
                        <p>COD (Efectivo en entrega)</p>
                    </div>
                    <div
                        onClick={() => setPayment("mercadopago")}
                        className={`payment-option ${payment === "mercadopago" ? "selected" : ""}`}>
                        <img src={payment === "mercadopago" ? assets.checked : assets.un_checked} alt="" />
                        <p>Mercado Pago (Credit / Debit)</p>
                    </div>
                </div>
                <button className='place-order-submit' type='submit'>{payment === "cod" ? "ORDENAR" : "IR A PAGAR"}</button>
            </div>
        </form>
    );
};

export default PlaceOrder;

