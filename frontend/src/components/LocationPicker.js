import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function LocationMarker({ position, setPosition }) {
  const map = useMap();
  const markerRef = React.useRef(null);

  useEffect(() => {
    // Only fly to position if marker is being dragged or initially set
    // Don't fly during search to prevent jumping
    if (position && map && markerRef.current) {
      const currentCenter = map.getCenter();
      const distance = map.distance(currentCenter, position);
      // Only recenter if position is far from current view (more than 1000 meters)
      if (distance > 1000) {
        map.flyTo(position, map.getZoom(), { duration: 0.5 });
      }
    }
  }, [position, map]);

  const handleDragEnd = (e) => {
    try {
      const latlng = e.target.getLatLng();
      if (latlng) {
        // Check if the marker is within India's boundaries
        if (latlng.lat >= 6.4626999 && latlng.lat <= 35.513327 && 
            latlng.lng >= 68.1097 && latlng.lng <= 97.39535) {
          const newPosition = [latlng.lat, latlng.lng];
          if (setPosition && typeof setPosition === 'function') {
            setPosition(newPosition);
          }
        } else {
          // If outside India, move marker back to previous position
          e.target.setLatLng(position);
        }
      }
    } catch (error) {
      console.error('Drag end error:', error);
    }
  };

  return position ? (
    <Marker 
      ref={markerRef}
      position={position} 
      draggable={true} 
      eventHandlers={{ dragend: handleDragEnd }} 
    />
  ) : null;
}

function MapClickHandler({ setPosition, setLocationCoords, setLocation, setAddress, readonly }) {
  const map = useMap();
  
  useEffect(() => {
    if (!readonly) {
      const handleClick = (e) => {
        try {
          const coords = [e.latlng.lat, e.latlng.lng];
          
          // Check if click is within India's boundaries
          if (coords[0] >= 6.4626999 && coords[0] <= 35.513327 && 
              coords[1] >= 68.1097 && coords[1] <= 97.39535) {
            
            setPosition(coords);
            
            if (setLocationCoords && typeof setLocationCoords === 'function') {
              setLocationCoords({ type: 'Point', coordinates: [coords[1], coords[0]] });
            }
            
            // Reverse geocoding to get address
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&countrycodes=in`)
              .then(response => response.json())
              .then(data => {
                if (data && data.display_name) {
                  const addressText = data.display_name;
                  if (setAddress && typeof setAddress === 'function') {
                    setAddress(addressText);
                  }
                  if (setLocation && typeof setLocation === 'function') {
                    setLocation(addressText);
                  }
                }
              })
              .catch(error => {
                console.error('Reverse geocoding error:', error);
              });
          }
        } catch (error) {
          console.error('Map click error:', error);
        }
      };
      
      map.on('click', handleClick);
      
      return () => {
        map.off('click', handleClick);
      };
    }
  }, [map, setPosition, setLocationCoords, setLocation, setAddress, readonly]);
  
  return null;
}

function LocationPicker({ location, setLocation, setLocationCoords, readonly = false }) {
  const [position, setPosition] = useState([20.5937, 78.9629]); // Default to center of India
  const [address, setAddress] = useState('');
  const initialLocationSet = useRef(false);

  // India's boundaries
  const indiaBounds = [
    [6.4626999, 68.1097], // Southwest corner
    [35.513327, 97.39535]  // Northeast corner
  ];

  // Initialize address from location prop only once
  useEffect(() => {
    if (location && typeof location === 'string' && location.trim() !== '' && !initialLocationSet.current) {
      setAddress(location);
      initialLocationSet.current = true;
      
      // Convert address to coordinates using OpenStreetMap Nominatim API
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data && Array.isArray(data) && data[0]) {
            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            if (!isNaN(coords[0]) && !isNaN(coords[1])) {
              setPosition(coords);
              if (setLocationCoords && typeof setLocationCoords === 'function') {
                setLocationCoords({ type: 'Point', coordinates: [coords[1], coords[0]] });
              }
            }
          }
        })
        .catch(error => {
          console.error('Geocoding error:', error);
        });
    }
  }, [location, setLocationCoords]);

  const handleAddressChange = (e) => {
    try {
      const newAddress = e?.target?.value || '';
      setAddress(newAddress);
      // Don't update parent location on every keystroke to prevent re-renders
    } catch (error) {
      console.error('Address change error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!address || address.trim() === '') {
      return;
    }
    
    try {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data && Array.isArray(data) && data[0]) {
            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            if (!isNaN(coords[0]) && !isNaN(coords[1])) {
              setPosition(coords);
              // Only update parent location after successful search
              if (setLocation && typeof setLocation === 'function') {
                setLocation(address);
              }
              if (setLocationCoords && typeof setLocationCoords === 'function') {
                setLocationCoords({ type: 'Point', coordinates: [coords[1], coords[0]] });
              }
            }
          }
        })
        .catch(error => {
          console.error('Search error:', error);
        });
    } catch (error) {
      console.error('Search handler error:', error);
    }
  };

  const handlePositionChange = (newPosition) => {
    if (!newPosition || !Array.isArray(newPosition) || newPosition.length !== 2) {
      return;
    }
    
    try {
      setPosition(newPosition);
      if (setLocationCoords && typeof setLocationCoords === 'function') {
        setLocationCoords({ type: 'Point', coordinates: [newPosition[1], newPosition[0]] });
      }
      
      // Reverse geocoding for dragged marker
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition[0]}&lon=${newPosition[1]}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.display_name) {
            setAddress(data.display_name);
            if (setLocation && typeof setLocation === 'function') {
              setLocation(data.display_name);
            }
          }
        })
        .catch(error => {
          console.error('Reverse geocoding error:', error);
        });
    } catch (error) {
      console.error('Position change error:', error);
    }
  };

  return (
    <div className="location-picker">
      {!readonly && (
        <div className="location-search">
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter your address"
            className="location-input"
          />
          <button onClick={handleSearch} className="search-button">Search</button>
        </div>
      )}
      <div className="map-container" style={{ height: readonly ? '300px' : '500px', marginTop: '10px' }}>
        <MapContainer
          center={position}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          dragging={!readonly}
          touchZoom={!readonly}
          doubleClickZoom={!readonly}
          scrollWheelZoom={!readonly}
          boxZoom={!readonly}
          keyboard={!readonly}
          zoomControl={true}
          maxBounds={indiaBounds}
          minZoom={4}
          maxZoom={18}
          bounds={indiaBounds}
          whenReady={(map) => {
            console.log('Map is ready');
            map.target.on('click', () => {
              console.log('Map clicked');
            });
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker position={position} setPosition={readonly ? () => {} : handlePositionChange} />
          <MapClickHandler 
            setPosition={setPosition}
            setLocationCoords={setLocationCoords}
            setLocation={setLocation}
            setAddress={setAddress}
            readonly={readonly}
          />
        </MapContainer>
      </div>
    </div>
  );
}

export default LocationPicker;