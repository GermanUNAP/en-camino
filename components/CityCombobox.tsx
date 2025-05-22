'use client';

import React, { useState, useMemo, useEffect } from 'react';
import distritosData from '@/lib/ubigeo_peru_2016_distritos.json';
import { City } from '@/types/city';
import slugify from 'slugify';
import { MapPin } from 'lucide-react'; // Import the MapPin icon

interface ComboBoxCiudadProps {
  onSeleccionarCiudad?: (ciudad: City | null) => void;
  selectedCity?: City | null;
}

type RawCity = {
  id: string;
  name: string;
  province_id: string;
  department_id: string;
};

const ComboBoxCiudad: React.FC<ComboBoxCiudadProps> = ({ onSeleccionarCiudad, selectedCity }) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<City | null>(null);

  useEffect(() => {
    if (selectedCity) {
      setInputValue(selectedCity.name);
      setCiudadSeleccionada(selectedCity);
    } else {
      setInputValue('');
      setCiudadSeleccionada(null);
    }
  }, [selectedCity]);

  const resultadosFiltrados: City[] = useMemo(() => {
    if (!inputValue.trim()) return [];

    return (distritosData as RawCity[])
      .filter((c) =>
        c.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .slice(0, 15)
      .map((c) => ({
        ...c,
        slug: slugify(c.name, { lower: true }),
      }));
  }, [inputValue]);

  const handleSelect = (ciudad: City) => {
    setCiudadSeleccionada(ciudad);
    setInputValue(ciudad.name);
    setShowDropdown(false);
    if (onSeleccionarCiudad) {
      onSeleccionarCiudad(ciudad);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowDropdown(true);
    if (!value.trim() && onSeleccionarCiudad) {
      onSeleccionarCiudad(null);
      setCiudadSeleccionada(null);
    }
  };

  return (
    // Added 'relative' to position the icon, and 'w-full' for better responsiveness
    <div className="relative w-full">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="Busca una ciudad"
        // Increased left padding to accommodate the icon
        className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />

      {showDropdown && resultadosFiltrados.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-60 overflow-y-auto shadow-lg text-sm">
          {resultadosFiltrados.map((ciudad) => (
            <li
              key={ciudad.id}
              onClick={() => handleSelect(ciudad)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              {ciudad.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComboBoxCiudad;