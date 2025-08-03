'use client';

import { Transaction } from '@/lib/pdf-parser';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TransactionChartProps {
  data: Transaction[];
}

const processDataForChart = (transactions: Transaction[]) => {
  const monthlyExpenses: { [key: string]: number } = {};

  transactions.forEach((transaction) => {
    if (transaction.debit) {
      const date = new Date(transaction.date);
      // Check if date is valid before processing
      if (isNaN(date.getTime())) {
          return; // Skip invalid dates
      }
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });

      if (!monthlyExpenses[month]) {
        monthlyExpenses[month] = 0;
      }
      monthlyExpenses[month] += transaction.debit;
    }
  });

  const sortedMonths = Object.keys(monthlyExpenses).sort((a, b) => {
    const dateA = new Date(`01 ${a.replace(" '", " 20")}`);
    const dateB = new Date(`01 ${b.replace(" '", " 20")}`);
    return dateA.getTime() - dateB.getTime();
  });

  return sortedMonths.map((month) => ({
    name: month,
    Expenses: monthlyExpenses[month],
  }));
};

export function TransactionChart({ data }: TransactionChartProps) {
  const chartData = processDataForChart(data);

  if (chartData.length === 0) {
    return <div className="text-center p-4">No expense data to display in chart.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value)
          }
        />
        <Legend />
        <Bar dataKey="Expenses" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
