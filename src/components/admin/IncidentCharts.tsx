import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ChartProps {
  data: any[];
  type: 'line' | 'bar' | 'pie';
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ErrorTimelineChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        dataKey="hour" 
        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
      />
      <YAxis />
      <Tooltip 
        labelFormatter={(value) => new Date(value).toLocaleString()}
      />
      <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

export const ComponentErrorChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#ef4444" />
    </BarChart>
  </ResponsiveContainer>
);

export const BrowserErrorChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

export const MemoryUsageChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="index" />
      <YAxis />
      <Tooltip formatter={(value) => [`${value}MB`, 'Memory']} />
      <Line type="monotone" dataKey="memory" stroke="#8884d8" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

// Default export for lazy loading
const IncidentCharts = {
  ErrorTimelineChart,
  ComponentErrorChart,
  BrowserErrorChart,
  MemoryUsageChart
};

export default IncidentCharts;