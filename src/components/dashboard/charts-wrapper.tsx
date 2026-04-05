"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell,
    Pie,
    PieChart
} from "recharts";

export function AreaChartComponent({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    className="text-gray-400 dark:text-gray-500"
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    className="text-gray-400 dark:text-gray-500"
                    tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 shadow-2xl ring-1 ring-gray-100 dark:ring-gray-800">
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{payload[0].payload.name}</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-8">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Income</span>
                                            </div>
                                            <span className="font-bold text-blue-700 dark:text-blue-400">₹{payload[0]?.value?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-8">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Expense</span>
                                            </div>
                                            <span className="font-bold text-red-600 dark:text-red-400">₹{payload[1]?.value?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        return null
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                />
                <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export function PieChartComponent({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                </Pie>
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 shadow-2xl ring-1 ring-gray-100 dark:ring-gray-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider font-mono">{payload[0].name}</span>
                                    </div>
                                    <span className="block font-black text-gray-800 dark:text-gray-200">₹{payload[0]?.value?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}</span>
                                </div>
                            )
                        }
                        return null
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
