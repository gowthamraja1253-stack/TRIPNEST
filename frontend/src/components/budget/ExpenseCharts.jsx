import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F97316",
  "#A855F7",
  "#EF4444",
  "#14B8A6",
];

const ExpenseCharts = ({ expenses = [], summary = {} }) => {

  const categoryData = useMemo(() => {

    const map = {};

    expenses.forEach((item) => {

      if (!map[item.category]) {
        map[item.category] = 0;
      }

      map[item.category] += Number(item.amount);

    });

    return Object.keys(map).map((key) => ({
      name: key,
      value: map[key],
    }));

  }, [expenses]);

  const monthlyData = useMemo(() => {

    const map = {};

    expenses.forEach((item) => {

      const month = new Date(item.date)
        .toLocaleString("default", {
          month: "short",
        });

      if (!map[month]) {

        map[month] = 0;

      }

      map[month] += Number(item.amount);

    });

    return Object.keys(map).map((key) => ({
      month: key,
      amount: map[key],
    }));

  }, [expenses]);

  return (

    <div className="grid lg:grid-cols-2 gap-6">

      {/* Pie Chart */}

      <div className="bg-surface rounded-2xl shadow-md p-6">

        <h2 className="text-xl font-bold mb-6">
          Expense Categories
        </h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <PieChart>

            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >

              {categoryData.map((entry, index) => (

                <Cell
                  key={index}
                  fill={
                    COLORS[
                      index % COLORS.length
                    ]
                  }
                />

              ))}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

      {/* Bar Chart */}

      <div className="bg-surface rounded-2xl shadow-md p-6">

        <h2 className="text-xl font-bold mb-6">
          Monthly Expenses
        </h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <BarChart data={monthlyData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="amount"
              radius={[10,10,0,0]}
              fill="#2563EB"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* Budget Summary */}

      <div className="lg:col-span-2 bg-surface rounded-2xl shadow-md p-8">

        <h2 className="text-2xl font-bold mb-8">
          Budget Insights
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-blue-50 rounded-xl p-5">

            <h4 className="text-gray-500">
              Total Budget
            </h4>

            <h2 className="text-3xl font-bold text-blue-700 mt-2">
              ₹ {summary.totalBudget}
            </h2>

          </div>

          <div className="bg-red-50 rounded-xl p-5">

            <h4 className="text-gray-500">
              Total Expenses
            </h4>

            <h2 className="text-3xl font-bold text-red-600 mt-2">
              ₹ {summary.totalExpense}
            </h2>

          </div>

          <div className="bg-green-50 rounded-xl p-5">

            <h4 className="text-gray-500">
              Remaining
            </h4>

            <h2 className="text-3xl font-bold text-green-700 mt-2">
              ₹ {summary.remainingBudget}
            </h2>

          </div>

          <div className="bg-purple-50 rounded-xl p-5">

            <h4 className="text-gray-500">
              Utilization
            </h4>

            <h2 className="text-3xl font-bold text-purple-700 mt-2">
              {summary.utilization}%
            </h2>

          </div>

        </div>

      </div>

    </div>

  );

};

export default ExpenseCharts;