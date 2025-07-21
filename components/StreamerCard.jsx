// export default function StreamerCard({ name, game, viewers, avgViewers, clip_score, title, onClick }) {
//   const getBadgeColor = () => {
//   const score = Number(clip_score);
//   if (isNaN(score)) return 'bg-gray-400 text-white'; // fallback
//   if (score > 3) return 'bg-red-500 text-white';
//   if (score >= 1.5) return 'bg-yellow-400 text-black';
//   return 'bg-green-500 text-white';
// };

//   return (
//     <div onClick={onClick} className="cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition">
//       <div className="mb-2">
//         <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h2>
//         <p className="text-sm text-gray-600 dark:text-gray-300">{game} — {viewers} viewers</p>
//         <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
//       </div>
//       <div className="flex justify-between items-center">
//         <span className="text-xs text-gray-400">Avg: {avgViewers}</span>
//         <span className={`text-xs px-2 py-1 rounded ${getBadgeColor()}`}>
//         📈 {(Number(clip_score) || 0).toFixed(2)}
//         </span>
//       </div>
//     </div>
//   );
// }

"use client"

export default function StreamerCard({ name, game, viewers, avgViewers, clip_score, title, onClick }) {
    const getBadgeColor = () => {
        const score = Number(clip_score)
        if (isNaN(score)) return "bg-gray-100 text-gray-600 border-gray-200"
        if (score > 3) return "bg-red-50 text-red-700 border-red-200"
        if (score >= 1.5) return "bg-yellow-50 text-yellow-700 border-yellow-200"
        return "bg-green-50 text-green-700 border-green-200"
    }

    const getBadgeIcon = () => {
        const score = Number(clip_score)
        if (isNaN(score)) return "📊"
        if (score > 3) return "🔥"
        if (score >= 1.5) return "⚡"
        return "✨"
    }

    const formatViewers = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
        return count?.toString() || "0"
    }

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 overflow-hidden"
        >
            {/* Header with live indicator */}
            <div className="relative p-5 pb-3">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {name}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="font-medium">{game}</span>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${getBadgeColor()}`}>
                        <span className="mr-1">{getBadgeIcon()}</span>
                        {(Number(clip_score) || 0).toFixed(2)}
                    </div>
                </div>

                {/* Title */}
                {title && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">{title}</p>
                    </div>
                )}
            </div>

            {/* Stats Section */}
            <div className="px-5 pb-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Current Viewers */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Live Now</p>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatViewers(viewers)}</p>
                            </div>
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Average Viewers */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Average</p>
                                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{formatViewers(avgViewers)}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with trend indicator */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span>Click to view details</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {viewers > avgViewers ? (
                            <>
                                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Trending</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Stable</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
