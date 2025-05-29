"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
  iconUrl: 'leaflet/images/marker-icon.png',
  shadowUrl: 'leaflet/images/marker-shadow.png',
});

const customMarkerIcon = new L.Icon({
  iconUrl: '/leaflet/images/marker-icon-red.png',
  iconRetinaUrl: '/leaflet/images/marker-icon-2x-red.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({
  setLocation,
  initialPosition
}: {
  setLocation: (lat: number, lng: number) => void;
  initialPosition: L.LatLngExpression | null;
}) {
  const [position, setPosition] = useState<L.LatLngExpression | null>(initialPosition);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLocation(e.latlng.lat, e.latlng.lng);
    },
    locationfound(e) {
      if (!initialPosition) {
        setPosition(e.latlng);
        setLocation(e.latlng.lat, e.latlng.lng);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
    locationerror(e) {
      console.error("Geolocation error:", e.message);
      if (!initialPosition && !position) {
        setPosition(new L.LatLng(-16.3988, -71.5369));
        setLocation(-16.3988, -71.5369);
      }
    }
  });

  useEffect(() => {
    if (!initialPosition) {
      map.locate();
    } else {
      map.flyTo(initialPosition, map.getZoom());
    }
  }, [map, initialPosition]);

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      icon={customMarkerIcon} // Using your custom icon
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const newPosition = marker.getLatLng();
          setPosition(newPosition);
          setLocation(newPosition.lat, newPosition.lng);
        }
      }}
    />
  );
}

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  setLocation: (lat: number, lng: number) => void;
}

export default function MapComponent({
  latitude,
  longitude,
  setLocation
}: MapComponentProps) {
  const defaultPosition: L.LatLngExpression = [-16.3988, -71.5369];

  return (
    <MapContainer
      center={latitude && longitude ? [latitude, longitude] : defaultPosition}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full w-full"
      key={`${latitude}-${longitude}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker
        setLocation={setLocation}
        initialPosition={latitude && longitude ? [latitude, longitude] : null}
      />
    </MapContainer>
  );
}