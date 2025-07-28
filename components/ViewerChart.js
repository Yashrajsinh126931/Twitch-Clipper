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
import { TrendingUp, Users, Clock, Activity, Eye, Zap } from "lucide-react"

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

export default function ViewerChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-lg">No viewer history available</p>
                <p className="text-gray-500 text-sm mt-2">Start monitoring to see real-time analytics</p>
            </div>
        )
    }

    const maxViewers = Math.max(...data.map((d) => d.y))
    const minViewers = Math.min(...data.map((d) => d.y))
    const avgViewers = Math.round(data.reduce((sum, d) => sum + d.y, 0) / data.length)
    const currentViewers = data[data.length - 1]?.y || 0

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
                pointRadius: 0,
                pointHoverRadius: 8,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "#a855f7",
                pointBorderWidth: 3,
                pointHoverBackgroundColor: "#a855f7",
                pointHoverBorderColor: "#ffffff",
                pointHoverBorderWidth: 3,
                borderColor: "#a855f7",
                backgroundColor: "rgba(168, 85, 247, 0.1)",
                shadowColor: "rgba(168, 85, 247, 0.3)",
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 4,
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
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                titleColor: "#ffffff",
                bodyColor: "#ffffff",
                borderColor: "#a855f7",
                borderWidth: 2,
                cornerRadius: 12,
                displayColors: false,
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: "bold",
                },
                bodyFont: {
                    size: 13,
                },
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
                    label: (context) => `👥 ${context.parsed.y.toLocaleString()} viewers`,
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
                        size: 11,
                        weight: "500",
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
                        size: 11,
                        weight: "500",
                    },
                    callback: (value) => value.toLocaleString(),
                    padding: 8,
                },
                grid: {
                    color: "rgba(75, 85, 99, 0.3)",
                    drawBorder: false,
                    lineWidth: 1,
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
        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Viewership Analytics</h3>
                            <p className="text-sm text-gray-400">Real-time viewer engagement</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400 font-medium uppercase tracking-wide">Live</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-700/50">
                <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-600/20 to-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 text-green-400" />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-green-400">{maxViewers.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Peak</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-blue-400" />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-blue-400">{avgViewers.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Average</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600/20 to-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                                <Eye className="w-4 h-4 text-purple-400" />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-purple-400">{currentViewers.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Current</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-600/20 to-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
                                <Activity className="w-4 h-4 text-orange-400" />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-orange-400">{minViewers.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Low</div>
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
            <div className="px-6 py-3 bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Updated {new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Activity className="w-3 h-3" />
                            <span>{data.length} data points</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-gray-400">Viewer Count</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
