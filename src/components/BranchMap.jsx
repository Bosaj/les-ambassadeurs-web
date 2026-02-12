import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not appearing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map view updates
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

const BranchMap = ({ branches, selectedCity, onSelectBranch }) => {
    // Default center (Morocco)
    const defaultCenter = [31.7917, -7.0926];
    const defaultZoom = 5;

    // Determine center and zoom based on selected city/branch
    let mapCenter = defaultCenter;
    let mapZoom = defaultZoom;

    if (selectedCity) {
        const selectedBranch = branches.find(b => b.city?.toLowerCase() === selectedCity.toLowerCase());
        if (selectedBranch && selectedBranch.lat && selectedBranch.lng) {
            mapCenter = [selectedBranch.lat, selectedBranch.lng];
            mapZoom = 13;
        }
    }

    return (
        <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} zoom={mapZoom} />

            {branches.map(branch => (
                (branch.lat && branch.lng) && (
                    <Marker
                        key={branch.id}
                        position={[branch.lat, branch.lng]}
                        eventHandlers={{
                            click: () => onSelectBranch && onSelectBranch(branch),
                        }}
                    >
                        <Popup>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">{branch.name}</h3>
                                <p className="text-sm">{branch.address}</p>
                                <p className="text-xs text-blue-600">{branch.phone}</p>
                                {branch.google_map_link && (
                                    <a
                                        href={branch.google_map_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mt-2 text-xs text-blue-500 hover:underline"
                                    >
                                        View on Google Maps
                                    </a>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer >
    );
};

export default BranchMap;
