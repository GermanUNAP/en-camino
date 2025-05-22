import React from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = '51926545114'; 
  const message = encodeURIComponent("Bienvenido a En Camino \nNo solo estás por unirte a una comunidad, sino que te unes a un movimiento de emprendedores que apuestas por sus sueños. \n No estarás solo, caminaremos juntos, aprenderemos juntos, creceremos juntos. \n Tu camino inicia hoy y estamos para reforzarnos y alcanzar el éxito."); 

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="fixed bottom-4 right-4 z-50"> 
      <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-3 transition duration-300 flex items-center justify-center">
        <Phone className="h-6 w-6 mr-2" />
        <span>WhatsApp</span>
        <span className="sr-only">Contáctanos por WhatsApp</span>
      </Link>
    </div>
  );
};

export default WhatsAppButton;