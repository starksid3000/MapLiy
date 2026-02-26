// src/App.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Default marker
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Red marker for nearest location
const nearestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const hoverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [35, 56],
  iconAnchor: [17, 56],
});

export default function MapView() {
  const [places, setPlaces] = useState([]);
  const [nearestPlaceId, setNearestPlaceId] = useState(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          // Fetch nearby places
          const res = await axios.get('http://localhost:3000/places/nearby', {
            params: { latitude, longitude, radius: 5000 },
          });

          if (res.data.length > 0) {
            setNearestPlaceId(res.data[0].id); // nearest is the first one (ordered by distance)
          }

          // Fetch all places
          const all = await axios.get('http://localhost:3000/places/all');
          setPlaces(all.data);
        } catch (err) {
          console.error(err);
        }
      },
      (err) => console.error('Geolocation error:', err)
    );
  }, []);

  if (!userLocation) return <div>Loading map...</div>;

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location */}
      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>You are here</Popup>
      </Marker>

      {/* All places */}
      {places.map((place) => {
        const isNearest = place.id === nearestPlaceId;
        const isHovered = place.id === hoveredPlaceId;

        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={isHovered ? hoverIcon : isNearest ? nearestIcon : defaultIcon}
            eventHandlers={{
              mouseover: () => setHoveredPlaceId(place.id),
              mouseout: () => setHoveredPlaceId(null),
            }}
          >
            <Popup>{place.name}</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}