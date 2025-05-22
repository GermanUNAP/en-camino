import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Wifi } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#161B22] text-white py-4">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 md:justify-center">
        {/* En Camino Puno */}
        <div className="text-center md:text-left">
          <h4 className="text-lg font-semibold mb-4">En Camino Puno</h4>
          <p className="text-sm text-gray-400">
            Tu conexión con emprendedores y lo mejor de Puno.
          </p>
        </div>

        {/* Contacto */}
        <div className="text-center md:text-left">
          <h4 className="text-lg font-semibold mb-4">Contacto</h4>
          <p className="text-sm text-gray-400">
            Teléfono: <span className="text-gray-300">926 545 114</span>
          </p>
          <p className="text-sm text-gray-400">
            Ubicación: <span className="text-gray-300">Puno, Perú</span>
          </p>
        </div>

        {/* Síguenos */}
        <div className="text-center md:text-left">
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Síguenos</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link href="#" className="text-gray-400 hover:text-gray-300">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-300">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-300">
                <Wifi className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} En Camino Puno. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;