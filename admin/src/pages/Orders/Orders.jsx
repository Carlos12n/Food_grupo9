import React, { useEffect, useState } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets, url, currency } from '../../assets/assets';

const Order = () => {
  const [orders, setOrders] = useState([]); // Todas las órdenes
  const [filteredOrders, setFilteredOrders] = useState([]); // Órdenes filtradas
  const [filter, setFilter] = useState(''); // Estado seleccionado para filtrar

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        // Ordenar las órdenes más nuevas primero
        const sortedOrders = response.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders); // Inicia mostrando todas las órdenes
      } else {
        toast.error('Error al obtener las órdenes');
      }
    } catch (error) {
      toast.error('Hubo un error al cargar las órdenes');
      console.error(error);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: event.target.value,
      });
      if (response.data.success) {
        await fetchAllOrders(); // Recargar órdenes actualizadas
      }
    } catch (error) {
      toast.error('Error al actualizar el estado');
      console.error(error);
    }
  };

  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilter(selectedFilter);

    // Filtra las órdenes según el estado seleccionado
    if (selectedFilter === '') {
      setFilteredOrders(orders); // Muestra todas las órdenes si no se selecciona ningún filtro
    } else {
      setFilteredOrders(orders.filter((order) => order.status === selectedFilter));
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="order add">
      <h3>Lista de Órdenes</h3>

      {/* Filtro de órdenes */}
      <div className="filter-container">
        <label htmlFor="filter">Filtrar por estado:</label>
        <select id="filter" value={filter} onChange={handleFilterChange}>
          <option value="">Todas</option>
          <option value="En Proceso">En Proceso</option>
          <option value="Fuera para entregar">Fuera para entregar</option>
          <option value="Entregada">Entregada</option>
        </select>
      </div>

      <div className="order-list">
        {filteredOrders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items.map((item, idx) =>
                  idx === order.items.length - 1
                    ? `${item.name} x ${item.quantity}`
                    : `${item.name} x ${item.quantity}, `
                )}
              </p>
              <p className="order-item-name">
                {`${order.address.firstName} ${order.address.lastName}`}
              </p>
              <div className="order-item-address">
                <p>{order.address.street + ','}</p>
                <p>
                  {`${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`}
                </p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <p>Items : {order.items.length}</p>
            <p>
              {currency}
              {order.amount}
            </p>
            <select
              onChange={(e) => statusHandler(e, order._id)}
              value={order.status}
              name=""
              id=""
            >
              <option value="En Proceso">En Proceso</option>
              <option value="Fuera para entregar">Fuera para entregar</option>
              <option value="Entregada">Entregada</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order;
