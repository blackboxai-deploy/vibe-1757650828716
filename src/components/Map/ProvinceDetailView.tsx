'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { getBranchesByProvince } from '@/lib/data/mock-branches';
import type { ProvinceFeature, BranchData, ValueChainPoint } from '@/types';

interface ProvinceDetailViewProps {
  province: ProvinceFeature;
  onBack: () => void;
  onBranchClick?: (branch: BranchData) => void;
}

// Mock value chain data for the selected province
const generateValueChainData = (provinceId: string): ValueChainPoint[] => {
  const basePoints = 20 + Math.floor(Math.random() * 30);
  const points: ValueChainPoint[] = [];
  
  // Get province bounds for random point generation
  const provinces: Record<string, {lat: number, lng: number}> = {
    'JK': {lat: -6.2088, lng: 106.8456},
    'JB': {lat: -6.9175, lng: 107.6191},
    'JI': {lat: -7.2575, lng: 112.7521},
    'SU': {lat: 3.5952, lng: 98.6722}
  };
  
  const center = provinces[provinceId] || {lat: -6.2, lng: 106.8};
  
  for (let i = 0; i < basePoints; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 0.5; // Province spread
    
    const lat = center.lat + Math.cos(angle) * radius;
    const lng = center.lng + Math.sin(angle) * radius;
    
    const types: ValueChainPoint['type'][] = ['producer', 'distributor', 'consumer'];
    const type = types[Math.floor(Math.random() * types.length)];
    const isWondrUser = Math.random() > 0.7;
    
    points.push({
      id: `${provinceId}_vc_${i}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
      lat,
      lng,
      isWondrUser,
      businessSector: 'Perdagangan Besar Dan Eceran, Reparasi Mobil Dan Motor',
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }
  
  return points;
};

const ProvinceMapController: React.FC<{ province: ProvinceFeature }> = ({ province }) => {
  const map = useMap();
  
  useEffect(() => {
    if (province) {
      const bounds = L.geoJSON(province.geometry).getBounds();
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, province]);
  
  return null;
};

export const ProvinceDetailView: React.FC<ProvinceDetailViewProps> = ({ province, onBack, onBranchClick }) => {
  const [branches] = useState<BranchData[]>(getBranchesByProvince(province.properties.id));
  const [valueChainPoints] = useState<ValueChainPoint[]>(generateValueChainData(province.properties.id));
  const [showBranches, setShowBranches] = useState(true);
  const [showValueChain, setShowValueChain] = useState(true);
  const [showWondrUsers, setShowWondrUsers] = useState(true);
  const [showNonUsers, setShowNonUsers] = useState(true);

  const getProvinceStyle = () => {
    return {
      fillColor: 'transparent',
      color: '#2563eb',
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0
    };
  };

  const getValueChainIcon = (point: ValueChainPoint) => {
    const colors = {
      producer: point.isWondrUser ? '#10B981' : '#6B7280',
      distributor: point.isWondrUser ? '#3B82F6' : '#6B7280', 
      consumer: point.isWondrUser ? '#8B5CF6' : '#6B7280'
    };
    
    const shapes = {
      producer: '■',
      distributor: '▲', 
      consumer: '●'
    };

    return L.divIcon({
      html: `<div style="
        color: ${colors[point.type]};
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        line-height: 1;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
      ">${shapes[point.type]}</div>`,
      className: 'custom-div-icon',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      // notation: 'compact' - not supported in all environments
    }).format(value);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-3 mb-3">
           <Button variant="outline" size="sm" onClick={onBack}>
            ← Back to National
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{province.properties.name}</h2>
            <p className="text-sm text-gray-600">Province Detail Analysis</p>
          </div>
          <div className="ml-auto">
            <Badge 
              variant={
                province.properties.realizationStatus === 'green' ? 'default' :
                province.properties.realizationStatus === 'yellow' ? 'secondary' : 'destructive'
              }
            >
              {province.properties.realizationPercentage}% Realization
            </Badge>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showBranches ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowBranches(!showBranches)}
          >
            Branches ({branches.length})
          </Button>
          <Button
            variant={showValueChain ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowValueChain(!showValueChain)}
          >
            Value Chain ({valueChainPoints.length})
          </Button>
          <Button
            variant={showWondrUsers ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowWondrUsers(!showWondrUsers)}
          >
            Wondr Users
          </Button>
          <Button
            variant={showNonUsers ? 'outline' : 'default'}
            size="sm"
            onClick={() => setShowNonUsers(!showNonUsers)}
          >
            Non-Users
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Statistics Sidebar */}
        <div className="w-80 p-4 border-r bg-gray-50 overflow-y-auto">
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Financial Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Target Profit</span>
                  <span className="font-medium">{formatCurrency(province.properties.targetProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual Profit</span>
                  <span className="font-medium">{formatCurrency(province.properties.actualProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Population</span>
                  <span className="font-medium">{province.properties.population.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">User Adoption</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Wondr Users</span>
                  <span className="font-medium text-green-600">{province.properties.wondrUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Non-Users</span>
                  <span className="font-medium text-gray-600">{province.properties.nonUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Adoption Rate</span>
                  <span className="font-medium">
                    {Math.round((province.properties.wondrUsers / province.properties.population) * 100)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Infrastructure</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>KC Branches</span>
                  <span className="font-medium">{province.properties.totalBranches}</span>
                </div>
                <div className="flex justify-between">
                  <span>ATMs</span>
                  <span className="font-medium">{province.properties.totalATMs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agen46</span>
                  <span className="font-medium">{province.properties.totalAgen46}</span>
                </div>
              </div>
            </Card>

            {branches.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Top Branches</h3>
                <div className="space-y-2">
                  {branches.slice(0, 3).map(branch => (
                    <div key={branch.id} className="text-xs bg-white p-2 rounded border">
                      <div className="font-medium">{branch.name}</div>
                      <div className="text-gray-600">
                        Users: {branch.wondrUsers.toLocaleString()} | 
                        Potential: {Math.round(branch.potentialScore * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1">
          <MapContainer
            center={[-6.2, 107.0]}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ProvinceMapController province={province} />
            
            {/* Province Boundary */}
            <GeoJSON
              key={`province-${province.properties.id}`}
              data={province}
              style={getProvinceStyle}
            />

            {/* Branches */}
            {showBranches && branches.map(branch => (
              <CircleMarker
                key={`branch-${branch.id}`}
                center={[branch.lat, branch.lng]}
                radius={8}
                fillColor="#3B82F6"
                color="white"
                weight={2}
                opacity={1}
                fillOpacity={0.8}
                eventHandlers={{
                  click: () => onBranchClick && onBranchClick(branch)
                }}
              >
                <div className="leaflet-popup-content">
                  <div className="p-2">
                    <h4 className="font-bold">{branch.name}</h4>
                    <div className="mt-1 text-sm space-y-1">
                      <div>Users: {branch.wondrUsers.toLocaleString()}</div>
                      <div>Non-Users: {branch.nonUsers.toLocaleString()}</div>
                      <div>Leads: {branch.salesLeads}</div>
                      <div>Potential: {Math.round(branch.potentialScore * 100)}%</div>
                    </div>
                  </div>
                </div>
              </CircleMarker>
            ))}

            {/* Value Chain Points */}
            {showValueChain && valueChainPoints.map(point => (
              <Marker
                key={`vc-${point.id}`}
                position={[point.lat, point.lng]}
                icon={getValueChainIcon(point)}
              >
                <div className="leaflet-popup-content">
                  <div className="p-2">
                    <h4 className="font-bold">{point.name}</h4>
                    <div className="mt-1 text-sm space-y-1">
                      <div>Type: {point.type.charAt(0).toUpperCase() + point.type.slice(1)}</div>
                      <div>Status: {point.isWondrUser ? 'Wondr User' : 'Non-User'}</div>
                      <div>Volume: {formatCurrency(point.volume)}</div>
                    </div>
                  </div>
                </div>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
            <h4 className="font-semibold mb-2 text-sm">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>KC Branches</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 flex items-center justify-center text-green-600 font-bold">■</span>
                <span>Producers (Wondr)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 flex items-center justify-center text-blue-600 font-bold">▲</span>
                <span>Distributors (Wondr)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 flex items-center justify-center text-purple-600 font-bold">●</span>
                <span>Consumers (Wondr)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 flex items-center justify-center text-gray-600 font-bold">□</span>
                <span>Non-Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};