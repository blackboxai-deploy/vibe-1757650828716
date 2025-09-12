'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { generateHexagonGrid, generateCustomerData } from '@/lib/data/mock-branches';
import type { BranchData, HexagonData, CustomerData } from '@/types';

interface BranchDetailViewProps {
  branch: BranchData;
  onBack: () => void;
}

const BranchMapController: React.FC<{ branch: BranchData }> = ({ branch }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([branch.lat, branch.lng], 13);
  }, [map, branch]);
  
  return null;
};

export const BranchDetailView: React.FC<BranchDetailViewProps> = ({ branch, onBack }) => {
  const [hexagons] = useState<HexagonData[]>(generateHexagonGrid(branch.lat, branch.lng, branch.radius));
  const [customers] = useState<CustomerData[]>(generateCustomerData(branch.lat, branch.lng, branch.radius));
  const [showWondrUsers, setShowWondrUsers] = useState(true);
  const [showNonUsers, setShowNonUsers] = useState(true);
  const [showSalesLeads, setShowSalesLeads] = useState(true);
  const [showHexGrid, setShowHexGrid] = useState(true);

  const getHexagonColor = (hex: HexagonData) => {
    if (hex.trafficLevel === 'high' && hex.isUnderserved) return '#EF4444'; // Red - high potential
    if (hex.trafficLevel === 'high') return '#10B981'; // Green - high traffic
    if (hex.trafficLevel === 'medium' && hex.isUnderserved) return '#F59E0B'; // Yellow - medium potential
    return '#6B7280'; // Gray - low priority
  };

  const getHexagonOpacity = (hex: HexagonData) => {
    return Math.max(0.2, hex.potentialScore * 0.7);
  };

  const getCustomerColor = (customer: CustomerData) => {
    switch (customer.type) {
      case 'wondr_user': return '#10B981';
      case 'sales_lead': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const filteredCustomers = customers.filter(customer => {
    if (customer.type === 'wondr_user' && !showWondrUsers) return false;
    if (customer.type === 'non_user' && !showNonUsers) return false;
    if (customer.type === 'sales_lead' && !showSalesLeads) return false;
    return true;
  });

  const highPotentialHexagons = hexagons.filter(hex => hex.trafficLevel === 'high' && hex.isUnderserved);
  const salesNetworkRadius = branch.radius * 1000; // Convert to meters

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            ← Back to Province
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{branch.name}</h2>
            <p className="text-sm text-gray-600">Branch Detail Analysis - 10km Radius</p>
          </div>
          <div className="ml-auto">
            <Badge variant="default">
              Potential Score: {Math.round(branch.potentialScore * 100)}%
            </Badge>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center">
           <div className="flex items-center space-x-2">
            <Checkbox 
              id="hexGrid" 
              checked={showHexGrid} 
              onCheckedChange={(checked) => setShowHexGrid(checked as boolean)}
            />
            <Label htmlFor="hexGrid" className="text-sm">Hexagon Grid</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="wondrUsers" 
              checked={showWondrUsers} 
              onCheckedChange={(checked) => setShowWondrUsers(checked as boolean)}
            />
            <Label htmlFor="wondrUsers" className="text-sm">Wondr Users</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="nonUsers" 
              checked={showNonUsers} 
              onCheckedChange={(checked) => setShowNonUsers(checked as boolean)}
            />
            <Label htmlFor="nonUsers" className="text-sm">Non-Users</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="salesLeads" 
              checked={showSalesLeads} 
              onCheckedChange={(checked) => setShowSalesLeads(checked as boolean)}
            />
            <Label htmlFor="salesLeads" className="text-sm">Sales Leads</Label>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Analytics Sidebar */}
        <div className="w-80 p-4 border-r bg-gray-50 overflow-y-auto">
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Branch Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Deposits</span>
                  <span className="font-medium">{formatCurrency(branch.deposits)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loans</span>
                  <span className="font-medium">{formatCurrency(branch.loans)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Investments</span>
                  <span className="font-medium">{formatCurrency(branch.investments)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Customer Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Wondr Users</span>
                  <span className="font-medium text-green-600">{branch.wondrUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Non-Users</span>
                  <span className="font-medium text-gray-600">{branch.nonUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Leads</span>
                  <span className="font-medium text-yellow-600">{branch.salesLeads}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversion Rate</span>
                  <span className="font-medium">
                    {Math.round((branch.wondrUsers / (branch.wondrUsers + branch.nonUsers)) * 100)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Opportunity Zones</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>High Potential Hexagons</span>
                  <span className="font-medium text-red-600">{highPotentialHexagons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Coverage Area</span>
                  <span className="font-medium">{branch.radius}km radius</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Potential</span>
                  <span className="font-medium">
                    {Math.round(hexagons.reduce((sum, h) => sum + h.potentialScore, 0) / hexagons.length * 100)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Sales Network</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Coverage Radius</span>
                  <span className="font-medium">{branch.radius}km</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Customers</span>
                  <span className="font-medium">{filteredCustomers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Density</span>
                  <span className="font-medium">
                    {Math.round(filteredCustomers.length / (Math.PI * branch.radius * branch.radius))} per km²
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Top Opportunities</h3>
              <div className="space-y-2">
                {highPotentialHexagons.slice(0, 3).map((hex, index) => (
                  <div key={hex.id} className="text-xs bg-white p-2 rounded border">
                    <div className="font-medium">Zone #{index + 1}</div>
                    <div className="text-gray-600">
                      Potential: {Math.round(hex.potentialScore * 100)}% | 
                      Traffic: {hex.trafficLevel} | 
                      Customers: {hex.customerCount}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapContainer
            center={[branch.lat, branch.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <BranchMapController branch={branch} />

            {/* Branch Center */}
            <CircleMarker
              center={[branch.lat, branch.lng]}
              radius={10}
              fillColor="#2563eb"
              color="white"
              weight={3}
              opacity={1}
              fillOpacity={1}
            />

            {/* Branch Radius Circle */}
            <CircleMarker
              center={[branch.lat, branch.lng]}
              radius={salesNetworkRadius / 100} // Approximate radius for display
              fillColor="transparent"
              color="#2563eb"
              weight={2}
              opacity={0.5}
              fillOpacity={0}
            />

            {/* Hexagon Grid */}
            {showHexGrid && hexagons.map(hex => (
              <CircleMarker
                key={hex.id}
                center={[hex.lat, hex.lng]}
                radius={3}
                fillColor={getHexagonColor(hex)}
                color="transparent"
                weight={0}
                opacity={1}
                fillOpacity={getHexagonOpacity(hex)}
              />
            ))}

            {/* Customer Points */}
            {filteredCustomers.map((customer, index) => (
              <CircleMarker
                key={`customer-${index}`}
                center={[customer.lat, customer.lng]}
                radius={2}
                fillColor={getCustomerColor(customer)}
                color="white"
                weight={1}
                opacity={1}
                fillOpacity={0.8}
              />
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
            <h4 className="font-semibold mb-2 text-sm">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>KC Branch Center</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>High Traffic + Underserved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>High Traffic Area</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Medium Potential</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Wondr Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Non-Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Sales Leads</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};