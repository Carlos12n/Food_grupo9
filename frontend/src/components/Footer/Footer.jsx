import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt="" />
            <p>Descubre la nueva forma de disfrutar la gastronomía correntina con nuestro restaurante digital. Explora un menú diverso con platos tradicionales y propuestas innovadoras, todo al alcance de tu mano. Realiza tu pedido online de manera fácil y rápida, y recíbelo donde estés. ¡Una experiencia culinaria única sin salir de casa!</p>
            <div className="footer-social-icons">
                <img src={assets.facebook_icon} alt="" />
                <img src={assets.twitter_icon} alt="" />
                <img src={assets.linkedin_icon} alt="" />
            </div>
        </div>
        <div className="footer-content-center">
            <h2>COMPAÑIA</h2>
            <ul>
                <li>Home</li>
                <li>Acerca de nosotros</li>
                <li>Delivery</li>
                <li>Politica de privacidad</li>
            </ul>
        </div>
        <div className="footer-content-right">
            <h2>PONTE EN CONTACTO</h2>
            <ul>
                <li>3794-804792</li>
                <li>foodCtes@gmail.com</li>
            </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">Copyright 2024 - Derechos reservados.</p>
    </div>
  )
}

export default Footer
