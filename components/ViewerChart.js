import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler,
} from "chart.js"

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

export default function ViewerChart({ data }) {
    const maxViewers = Math.max(...data.map((d) => d.y))
    const minViewers = Math.min(...data.map((d) => d.y))
    const avgViewers = Math.round(data.reduce((sum, d) => sum + d.y, 0) / data.length)

    const chartData = {
        labels: data.map((d) =>
            new Date(d.x).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        ),
        datasets: [
            {
                label: "Viewers",
                data: data.map((d) => d.y),
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "#3b82f6",
                pointBorderWidth: 2,
                pointHoverBackgroundColor: "#3b82f6",
                pointHoverBorderColor: "#ffffff",
                pointHoverBorderWidth: 3,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.08)",
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: "index",
        },
        plugins: {
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#ffffff",
                bodyColor: "#ffffff",
                borderColor: "#3b82f6",
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: (context) => {
                        const date = new Date(data[context[0].dataIndex].x)
                        return date.toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                    },
                    label: (context) => `${context.parsed.y.toLocaleString()} viewers`,
                },
            },
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                ticks: {
                    color: "#6B7280",
                    font: {
                        size: 12,
                    },
                    maxTicksLimit: 8,
                },
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
            },
            y: {
                ticks: {
                    color: "#6B7280",
                    font: {
                        size: 12,
                    },
                    callback: (value) => value.toLocaleString(),
                },
                grid: {
                    color: "rgba(229, 231, 235, 0.5)",
                    drawBorder: false,
                },
                border: {
                    display: false,
                },
            },
        },
        elements: {
            point: {
                hoverRadius: 8,
            },
        },
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <svg
                                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Viewership Analytics</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time viewer engagement</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{maxViewers.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Peak</div>
                    </div>
                    <div className="text-center border-x border-gray-200 dark:border-gray-600">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgViewers.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Average</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {data[data.length - 1]?.y.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current</div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="p-6">
                <div className="h-80 relative">
                    <Line data={chartData} options={options} />
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Updated {new Date().toLocaleTimeString()}</span>
                    <span>{data.length} data points</span>
                </div>
            </div>
        </div>
    )
}
