'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTotalStats, getProvincesByStatus } from '@/lib/data/indonesia-provinces';

const COLORS = {
  green: '#10B981',
  yellow: '#F59E0B', 
  red: '#EF4444',
  blue: '#3B82F6',
  purple: '#8B5CF6'
};

export const NationalOverviewCharts: React.FC = () => {
  const stats = getTotalStats();
   const greenProvinces = getProvincesByStatus('green');

  const realizationData = [
    { name: 'Green (≥80%)', value: stats.greenProvinces, color: COLORS.green },
    { name: 'Yellow (60-79%)', value: stats.yellowProvinces, color: COLORS.yellow },
    { name: 'Red (<60%)', value: stats.redProvinces, color: COLORS.red }
  ];

  const userAdoptionData = [
    { name: 'Wondr Users', value: stats.totalWondrUsers, color: COLORS.green },
    { name: 'Non-Users', value: stats.totalNonUsers, color: COLORS.red }
  ];

  const profitData = [
    {
      category: 'Target vs Actual',
      target: stats.totalTargetProfit / 1e12, // Convert to trillions
      actual: stats.totalActualProfit / 1e12,
      realization: Math.round((stats.totalActualProfit / stats.totalTargetProfit) * 100)
    }
  ];

  const topProvincesData = [
    ...greenProvinces.slice(0, 5).map(p => ({
      name: p.properties.name.substring(0, 10),
      realization: p.properties.realizationPercentage,
      users: p.properties.wondrUsers / 1000 // Convert to thousands
    }))
  ];

  const infrastructureData = [
    { name: 'Branches', value: stats.totalBranches, color: COLORS.blue },
    { name: 'ATMs', value: stats.totalATMs, color: COLORS.purple },
    { name: 'Agen46', value: stats.totalAgen46, color: COLORS.green }
  ];

  const formatCurrency = (value: number) => {
    return `${value.toFixed(1)}T IDR`;
  };

  return (
    <div className="space-y-6">
      {/* Profit Realization */}
      <Card>
        <CardHeader>
          <CardTitle>National Profit Realization</CardTitle>
          <CardDescription>Target vs Actual Performance (in Trillions IDR)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={() => 'Profit Performance'}
              />
              <Bar dataKey="target" name="Target" fill={COLORS.blue} />
              <Bar dataKey="actual" name="Actual" fill={COLORS.green} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Province Realization Status */}
        <Card>
          <CardHeader>
            <CardTitle>Province Realization Status</CardTitle>
            <CardDescription>Distribution of provinces by performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={realizationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {realizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Adoption */}
        <Card>
          <CardHeader>
            <CardTitle>User Adoption</CardTitle>
            <CardDescription>Wondr users vs non-users nationally</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userAdoptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value, percent}) => `${name}: ${(value / 1e6).toFixed(1)}M (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userAdoptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [(value / 1e6).toFixed(1) + 'M', '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Provinces */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Provinces</CardTitle>
          <CardDescription>Realization percentage and user base (thousands)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProvincesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'realization' ? `${value}%` : `${value.toFixed(0)}K users`,
                  name === 'realization' ? 'Realization' : 'Users'
                ]}
              />
              <Bar yAxisId="left" dataKey="realization" name="Realization %" fill={COLORS.blue} />
              <Bar yAxisId="right" dataKey="users" name="Users (K)" fill={COLORS.green} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Infrastructure Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Infrastructure Distribution</CardTitle>
          <CardDescription>National infrastructure coverage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={infrastructureData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, value, percent}) => `${name}: ${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {infrastructureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};