import React from "react";
import {
  Wallet,
  IndianRupee,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const Card = ({ title, value, icon, color }) => (
  <div className="bg-surface rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300">

    <div className="flex justify-between items-center">

      <div>

        <p className="text-gray-500 text-sm font-medium">
          {title}
        </p>

        <h2 className="text-3xl font-bold mt-3 text-slate-800 dark:text-white">
          ₹ {Number(value).toLocaleString()}
        </h2>

      </div>

      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>

    </div>

  </div>
);

const BudgetSummaryCards = ({ summary }) => {

  const percentage =
    summary.totalBudget === 0
      ? 0
      : Math.min(
          (summary.totalExpense / summary.totalBudget) * 100,
          100
        );

  return (
    <>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <Card
          title="Total Budget"
          value={summary.totalBudget}
          icon={<Wallet className="text-white" size={26} />}
          color="bg-blue-600"
        />

        <Card
          title="Total Expense"
          value={summary.totalExpense}
          icon={<TrendingDown className="text-white" size={26} />}
          color="bg-red-500"
        />

        <Card
          title="Remaining Budget"
          value={summary.remainingBudget}
          icon={<IndianRupee className="text-white" size={26} />}
          color="bg-green-600"
        />

        <Card
          title="Budget Utilization"
          value={`${percentage.toFixed(1)} %`}
          icon={<TrendingUp className="text-white" size={26} />}
          color="bg-purple-600"
        />

      </div>

      {/* Progress */}

      <div className="bg-surface mt-8 rounded-2xl shadow-md p-6">

        <div className="flex justify-between">

          <h2 className="font-semibold text-lg text-slate-800 dark:text-white">
            Budget Usage
          </h2>

          <span className="text-blue-600 font-semibold">
            {percentage.toFixed(1)}%
          </span>

        </div>

        <div className="w-full h-4 bg-black/20 dark:bg-white/20 rounded-full mt-5 overflow-hidden">

          <div
            className={`h-4 rounded-full transition-all duration-700 ${
              percentage < 50
                ? "bg-green-500"
                : percentage < 80
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4">

            <p className="text-gray-500 text-sm">
              Budget
            </p>

            <h3 className="text-xl font-bold mt-2">
              ₹ {Number(summary.totalBudget).toLocaleString()}
            </h3>

          </div>

          <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4">

            <p className="text-gray-500 text-sm">
              Spent
            </p>

            <h3 className="text-xl font-bold mt-2 text-red-500">
              ₹ {Number(summary.totalExpense).toLocaleString()}
            </h3>

          </div>

          <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4">

            <p className="text-gray-500 text-sm">
              Remaining
            </p>

            <h3 className="text-xl font-bold mt-2 text-green-600">
              ₹ {Number(summary.remainingBudget).toLocaleString()}
            </h3>

          </div>

        </div>

      </div>

    </>
  );
};

export default BudgetSummaryCards;