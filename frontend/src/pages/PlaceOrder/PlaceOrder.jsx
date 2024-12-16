import React, { useContext, useEffect, useState } from 'react'; // Importa React y hooks
import './PlaceOrder.css'; // Importa estilos específicos para este componente
import { StoreContext } from '../../Context/StoreContext'; // Contexto global para datos de la tienda
import { assets } from '../../assets/assets'; // Recursos como imágenes o iconos
import { useNavigate } from 'react-router-dom'; // Hook para navegar entre rutas
import { toast } from 'react-toastify'; // Biblioteca para mostrar notificaciones
import axios from 'axios'; // Cliente HTTP para realizar solicitudes al backend

const PlaceOrder = () => {
    const [payment, setPayment] = useState("cod"); // Estado para el método de pago seleccionado
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
            if (payment === "stripe") {
                let response = await axios.post(`${url}/api/order/place`, orderData, { headers: { token } });
                if (response.data.success) {
                    window.location.replace(response.data.session_url);
                } else {
                    toast.error("Algo salió mal con Stripe.");
                }
            } else if (payment === "mercadopago") {
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
                    <input type="text" name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='First name' required />
                    <input type="text" name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Last name' required />
                </div>
                <input type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder='Email address' required />
                <input type="text" name='street' onChange={onChangeHandler} value={data.street} placeholder='Street' required />
                <div className="multi-field">
                    <input type="text" name='city' onChange={onChangeHandler} value={data.city} placeholder='City' required />
                    <input type="text" name='state' onChange={onChangeHandler} value={data.state} placeholder='State' required />
                </div>
                <div className="multi-field">
                    <input type="text" name='zipcode' onChange={onChangeHandler} value={data.zipcode} placeholder='Zip code' required />
                    <input type="text" name='country' onChange={onChangeHandler} value={data.country} placeholder='Country' required />
                </div>
                <input type="text" name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Phone' required />
            </div>

            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Total Carrito</h2>
                    <div>
                        <div className="cart-total-details"><p>Subtotal</p><p>{currency}{getTotalCartAmount()}</p></div>
                        <hr />
                        <div className="cart-total-details"><p>Costo Delivery</p><p>{currency}{deliveryCharge}</p></div>
                        <hr />
                        <div className="cart-total-details"><b>Total</b><b>{currency}{getTotalCartAmount() + deliveryCharge}</b></div>
                    </div>
                </div>
                <div className="payment">
                    <h2>Medio de Pago</h2>
                    <div onClick={() => setPayment("cod")} className="payment-option">
                        <img src={payment === "cod" ? assets.checked : assets.un_checked} alt="" />
                        <p>COD (Efectivo en entrega)</p>
                    </div>
                    <div onClick={() => setPayment("stripe")} className="payment-option">
                        <img src={payment === "stripe" ? assets.checked : assets.un_checked} alt="" />
                        <p>Stripe (Credit / Debit)</p>
                    </div>
                    <div onClick={() => setPayment("mercadopago")} className="payment-option">
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
