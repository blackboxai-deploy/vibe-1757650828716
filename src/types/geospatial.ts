export interface Province {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  boundaries: [number, number][]; // GeoJSON polygon coordinates
  realizationStatus: 'green' | 'yellow' | 'red';
  targetProfit: number;
  actualProfit: number;
  poiDensity: number; // For heatmap intensity
  userCount: number;
  nonUserCount: number;
  totalPopulation: number;
  branches: Branch[];
}

export interface Branch {
  id: string;
  name: string;
  type: 'KC' | 'Agen46' | 'ATM';
  coordinates: [number, number];
  provinceId: string;
  userCount: number;
  nonUserCount: number;
  salesLeads: number;
  deposits: number;
  loans: number;
  investments: number;
}

export interface BusinessSector {
  id: string;
  name: string;
  subsectors: string[];
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
}

export interface MapFilter {
  ageGroups: string[];
  incomeRanges: string[];
  businessSectors: string[];
  customerSegments: string[];
  lifestyle: string[];
}

export interface HexagonTile {
  id: string;
  coordinates: [number, number];
  potentialScore: number;
  userDensity: number;
  trafficLevel: 'high' | 'medium' | 'low';
  isUnderserved: boolean;
}

export interface ValueChainPoint {
  id: string;
  type: 'producer' | 'distributor' | 'consumer';
  coordinates: [number, number];
  isWondrUser: boolean;
  businessSector: string;
  size: 'small' | 'medium' | 'large';
}

export interface FinancialMetrics {
  deposits: number;
  loans: number;
  investments: number;
  growth: {
    deposits: number;
    loans: number;
    investments: number;
  };
}

export interface ConfigurationData {
  targetProfit: number;
  selectedSectors: string[];
  selectedSubsectors: string[];
  selectedCustomerSegments: string[];
}

export interface MapState {
  currentLevel: 'national' | 'province' | 'branch';
  selectedProvince?: string;
  selectedBranch?: string;
  activeFilters: MapFilter;
  configuration: ConfigurationData;
}