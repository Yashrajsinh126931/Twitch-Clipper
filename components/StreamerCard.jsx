"use client"
import { Eye, Play, Zap, Users, Activity, ArrowUp, Minus, Star, Flame, Sparkles } from "lucide-react"

export default function StreamerCard({ name, game, viewers, avgViewers, clip_score, title, onClick }) {
    const getBadgeStyle = () => {
        const score = Number(clip_score)
        if (isNaN(score))
            return {
                bg: "bg-slate-900/80",
                text: "text-slate-400",
                border: "border-slate-600/50",
                glow: "shadow-slate-500/20",
                icon: "📊",
            }
        if (score > 3)
            return {
                bg: "bg-gradient-to-r from-red-500 to-orange-500",
                text: "text-white",
                border: "border-red-400/50",
                glow: "shadow-red-500/50",
                icon: <Flame className="w-3 h-3" />,
            }
        if (score >= 1.5)
            return {
                bg: "bg-gradient-to-r from-yellow-400 to-orange-400",
                text: "text-black",
                border: "border-yellow-400/50",
                glow: "shadow-yellow-500/50",
                icon: <Zap className="w-3 h-3" />,
            }
        return {
            bg: "bg-gradient-to-r from-emerald-400 to-cyan-400",
            text: "text-black",
            border: "border-emerald-400/50",
            glow: "shadow-emerald-500/50",
            icon: <Sparkles className="w-3 h-3" />,
        }
    }

    const formatViewers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
        return count?.toString() || "0"
    }

    const isClipWorthy = Number(clip_score) >= 1.5
    const isTrending = viewers > avgViewers
    const badgeStyle = getBadgeStyle()

    return (
        <div
            onClick={onClick}
            className="group relative bg-black border-2 border-gray-800 rounded-3xl cursor-pointer transition-all duration-500 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 overflow-hidden"
        >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Clip Worthy Floating Badge */}
            {isClipWorthy && (
                <div className="absolute -top-3 -right-3 z-20">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50 animate-pulse">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping opacity-20"></div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="relative p-6 z-10">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        {/* Live Status */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                                <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-30"></div>
                            </div>
                            <span className="text-red-400 font-bold text-sm uppercase tracking-wider">● LIVE</span>
                        </div>

                        {/* Streamer Name */}
                        <h2 className="text-2xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                            {name}
                        </h2>

                        {/* Game */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-gray-300 font-semibold">{game}</span>
                        </div>
                    </div>

                    {/* Clip Score Badge */}
                    <div
                        className={`px-4 py-2 rounded-2xl ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border} shadow-lg ${badgeStyle.glow} font-bold text-sm flex items-center gap-2`}
                    >
                        {badgeStyle.icon}
                        {(Number(clip_score) || 0).toFixed(1)}
                    </div>
                </div>

                {/* Title */}
                {title && (
                    <div className="mb-6 p-4 bg-gray-900/50 rounded-2xl border border-gray-700/50">
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 italic">"{title}"</p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Live Viewers */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-4 h-4 text-purple-400" />
                                <span className="text-purple-400 font-bold text-xs uppercase tracking-wide">LIVE</span>
                            </div>
                            <div className="text-2xl font-black text-white">{formatViewers(viewers)}</div>
                        </div>
                    </div>

                    {/* Average Viewers */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border border-cyan-500/30 rounded-2xl p-5 backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-cyan-400" />
                                <span className="text-cyan-400 font-bold text-xs uppercase tracking-wide">AVG</span>
                            </div>
                            <div className="text-2xl font-black text-white">{formatViewers(avgViewers)}</div>
                        </div>
                    </div>
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-400 text-sm font-medium">Click for analytics</span>
                    </div>

                    <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isTrending ? "bg-green-500/20 border border-green-500/30" : "bg-gray-600/20 border border-gray-600/30"}`}
                    >
                        {isTrending ? (
                            <>
                                <ArrowUp className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 font-bold text-xs">TRENDING</span>
                            </>
                        ) : (
                            <>
                                <Minus className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-400 font-bold text-xs">STABLE</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-600/50 transform group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-ping opacity-20"></div>
                </div>
            </div>

            {/* Border Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-pink-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Corner Accent */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-600/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    )
}
