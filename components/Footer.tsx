import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Wifi } from 'lucide-react'; // Importa los iconos que necesites

const Footer = () => {
  return (
    <footer className="bg-[#161B22] text-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* En Camino Puno */}
        <div>
          <h4 className="text-lg font-semibold mb-4">En Camino Puno</h4>
          <p className="text-sm text-gray-400">
            Conectando emprendedores y consumidores en la ciudad de Puno.
          </p>
        </div>

        {/* Enlaces rápidos */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Enlaces rápidos</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>
              <Link href="/" className="hover:text-gray-300">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/categorias" className="hover:text-gray-300">
                Categorías
              </Link>
            </li>
            <li>
              <Link href="/emprendedores" className="hover:text-gray-300">
                Emprendedores
              </Link>
            </li>
            <li>
              <Link href="/registro" className="hover:text-gray-300">
                Registro
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Contacto</h4>
          <p className="text-sm text-gray-400">
            926 545 114
          </p>
          <p className="text-sm text-gray-400">
            Puno, Perú
          </p>
        </div>

        {/* Síguenos */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
          <div className="flex space-x-4">
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
      {/* Copyright */}
      <div className="container mx-auto px-4 mt-8 border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        © 2023 En Camino Puno. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;