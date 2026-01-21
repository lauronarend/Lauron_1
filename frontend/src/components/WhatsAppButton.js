import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('5511941863112');

  useEffect(() => {
    loadWhatsAppNumber();
  }, []);

  const loadWhatsAppNumber = async () => {
    try {
      const response = await axios.get(`${API}/whatsapp`);
      if (response.data.whatsapp_number) {
        setWhatsappNumber(response.data.whatsapp_number);
      }
    } catch (error) {
      console.error('Error loading WhatsApp number:', error);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Gostaria de entrar em contato.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-pulse"
      style={{
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)'
      }}
      data-testid="whatsapp-button"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="h-8 w-8 text-white" />
    </button>
  );
};

export default WhatsAppButton;
