// src/MapView.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
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

// Larger red marker on hover
const hoverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [35, 56],
  iconAnchor: [17, 56],
});

// Track map movement
function MapBoundsUpdater({ onBoundsChange }) {
  useMapEvent('moveend', (e) => {
    onBoundsChange(e.target.getBounds());
  });
  return null;
}

export default function MapView() {
  const [places, setPlaces] = useState([]);
  const [nearestPlaceId, setNearestPlaceId] = useState(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [bounds, setBounds] = useState(null);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (err) => console.error('Geolocation error:', err)
    );
  }, []);

  // Fetch places when bounds OR userLocation changes
  useEffect(() => {
    if (!bounds || !userLocation) return;

    const fetchPlaces = async () => {
      try {
        const res = await axios.get('http://localhost:3000/places/viewport', {
          params: {
            swLat: bounds.getSouthWest().lat,
            swLng: bounds.getSouthWest().lng,
            neLat: bounds.getNorthEast().lat,
            neLng: bounds.getNorthEast().lng,
            userLat: userLocation.lat,
            userLng: userLocation.lng,
          },
        });

        setPlaces(res.data);

        // Backend already sorted by distance ASC
        if (res.data.length > 0) {
          setNearestPlaceId(res.data[0].id);
        } else {
          setNearestPlaceId(null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlaces();
  }, [bounds, userLocation]);

  if (!userLocation) return <div>Loading map...</div>;

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
      whenCreated={(map) => setBounds(map.getBounds())}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBoundsUpdater onBoundsChange={setBounds} />

      {/* User marker */}
      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Places */}
      {places.map((place) => {
        const isNearest = place.id === nearestPlaceId;
        const isHovered = place.id === hoveredPlaceId;

        return (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={
              isHovered
                ? hoverIcon
                : isNearest
                  ? nearestIcon
                  : defaultIcon
            }
            eventHandlers={{
              mouseover: () => setHoveredPlaceId(place.id),
              mouseout: () => setHoveredPlaceId(null),
            }}
          >
            <Popup>
              {place.name}
              {isNearest && <div><strong>Nearest</strong></div>}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}