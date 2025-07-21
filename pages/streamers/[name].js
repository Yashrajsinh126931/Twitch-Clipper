// "use client"

// import { useRouter } from "next/router"
// import { useEffect, useState } from "react"
// import { ArrowLeft, Play, Square, ExternalLink, Activity, Clock, Users, TrendingUp } from "lucide-react"
// import ViewerChart from "../../components/ViewerChart"
// import { startChatMonitor, stopChatMonitor } from "../../utils/chatMonitor"

// export default function StreamerHistoryPage() {
//     const router = useRouter()
//     const { name } = router.query
//     const [data, setData] = useState([])
//     const [isLoading, setIsLoading] = useState(true)
//     const [isMonitoring, setIsMonitoring] = useState(false)
//     const [monitorLog, setMonitorLog] = useState([])
//     const [lastClipUrl, setLastClipUrl] = useState(null)
//     const [isCreatingClip, setIsCreatingClip] = useState(false)

//     const logMessage = (msg) => {
//         setMonitorLog((prev) => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`])
//     }

//     useEffect(() => {
//         if (!name) return
//         setIsLoading(true)
//         fetch(`/api/streamer-history?name=${encodeURIComponent(name)}`)
//             .then((res) => res.json())
//             .then((json) => {
//                 setData(json)
//                 setIsLoading(false)
//             })
//             .catch(() => setIsLoading(false))
//     }, [name])

//     const handleClipClick = async (streamerName) => {
//         setIsCreatingClip(true)
//         try {
//             const tokenRes = await fetch("/api/token")
//             if (!tokenRes.ok) {
//                 const next = `/clipper?streamer=${encodeURIComponent(streamerName)}`
//                 window.location.href = `/login?next=${encodeURIComponent(next)}`
//                 return
//             }

//             const { token } = await tokenRes.json()
//             const idRes = await fetch(`/api/user-id?username=${streamerName}&token=${token}`)
//             const { id: broadcasterId } = await idRes.json()
//             if (!broadcasterId) {
//                 alert("Failed to get broadcaster ID")
//                 return
//             }

//             startChatMonitor(
//                 streamerName,
//                 token,
//                 broadcasterId,
//                 async () => {
//                     logMessage(`🚀 Spike detected! Creating clip...`)
//                     const res = await fetch("/api/create-clip", {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({ token, broadcasterId, streamerName }),
//                     })
//                     const data = await res.json()
//                     if (data.url) {
//                         setLastClipUrl(data.url)
//                         logMessage(`✅ Clip created: ${data.url}`)
//                     } else {
//                         logMessage(`❌ Clip failed: ${data.error || "Unknown error"}`)
//                     }
//                 },
//                 ({ streamer, count, baseline, spike }) => {
//                     logMessage(`[${streamer}] Rate: ${count}/10s | Baseline: ${baseline.toFixed(2)} | Spike: ${spike}`)
//                 }
//             )

//             logMessage(`🚀 Chat monitor started for ${streamerName}`)
//             setIsMonitoring(true)
//         } catch (err) {
//             console.error("Clip monitor failed:", err)
//             logMessage(`❌ Error starting monitor: ${err.message}`)
//         } finally {
//             setIsCreatingClip(false)
//         }
//     }

//     const toggleMonitor = async () => {
//         try {
//             const tokenRes = await fetch("/api/token")
//             const { token } = await tokenRes.json()
//             const idRes = await fetch(`/api/user-id?username=${name}&token=${token}`)
//             const { id: broadcasterId } = await idRes.json()

//             if (!isMonitoring) {
//                 startChatMonitor(
//                     name,
//                     token,
//                     broadcasterId,
//                     async () => {
//                         logMessage(`🚀 Spike detected! Creating clip...`)
//                         const res = await fetch("/api/create-clip", {
//                             method: "POST",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify({ token, broadcasterId, streamerName: name }),
//                         })
//                         const data = await res.json()
//                         if (data.url) {
//                             setLastClipUrl(data.url)
//                             logMessage(`✅ Clip created: ${data.url}`)
//                         } else {
//                             logMessage(`❌ Clip failed: ${data.error || "Unknown error"}`)
//                         }
//                     },
//                     ({ streamer, count, baseline, spike }) => {
//                         logMessage(`[${streamer}] Rate: ${count}/10s | Baseline: ${baseline.toFixed(2)} | Spike: ${spike}`)
//                     }
//                 )

//                 logMessage(`📡 Started monitoring ${name}`)
//                 setIsMonitoring(true)
//             } else {
//                 stopChatMonitor(name)
//                 logMessage(`🛑 Stopped monitoring ${name}`)
//                 setIsMonitoring(false)
//             }
//         } catch (err) {
//             logMessage(`❌ Error toggling monitor: ${err.message}`)
//         }
//     }

//     const getViewerStats = () => {
//         if (!data.length) return { current: 0, peak: 0, average: 0 }
//         const viewers = data.map((d) => d.viewers || 0)
//         return {
//             current: viewers[viewers.length - 1] || 0,
//             peak: Math.max(...viewers),
//             average: Math.round(viewers.reduce((a, b) => a + b, 0) / viewers.length),
//         }
//     }

//     const stats = getViewerStats()

//     if (isLoading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
//                 <div className="container mx-auto px-4 py-8">
//                     <div className="animate-pulse">
//                         <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
//                         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//                             <div className="h-64 bg-gray-300 rounded"></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
//             <div className="container mx-auto px-4 py-8 max-w-7xl">
//                 {/* Header */}
//                 <div className="flex items-center gap-4 mb-8">
//                     <button
//                         onClick={() => router.back()}
//                         className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
//                     >
//                         <ArrowLeft size={20} />
//                         <span className="font-medium">Back</span>
//                     </button>
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-900">{name} Analytics</h1>
//                         <p className="text-gray-600 mt-1">Viewership history and monitoring tools</p>
//                     </div>
//                 </div>

//                 {data.length > 0 ? (
//                     <div className="space-y-6">
//                         {/* Stats Cards */}
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                             <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
//                                 <div className="flex items-center gap-3">
//                                     <div className="p-3 bg-green-100 rounded-lg">
//                                         <Users className="text-green-600 w-6 h-6" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-gray-600 font-medium">Current Viewers</p>
//                                         <p className="text-2xl font-bold text-gray-900">{stats.current.toLocaleString()}</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
//                                 <div className="flex items-center gap-3">
//                                     <div className="p-3 bg-purple-100 rounded-lg">
//                                         <TrendingUp className="text-purple-600 w-6 h-6" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-gray-600 font-medium">Peak Viewers</p>
//                                         <p className="text-2xl font-bold text-gray-900">{stats.peak.toLocaleString()}</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
//                                 <div className="flex items-center gap-3">
//                                     <div className="p-3 bg-blue-100 rounded-lg">
//                                         <Activity className="text-blue-600 w-6 h-6" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-gray-600 font-medium">Average Viewers</p>
//                                         <p className="text-2xl font-bold text-gray-900">{stats.average.toLocaleString()}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Chart Section */}
//                         <div className="bg-white rounded-xl shadow-lg p-6">
//                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//                                 <h2 className="text-xl font-semibold text-gray-900">Viewership Timeline</h2>
//                                 <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//                                     <button
//                                         onClick={() => handleClipClick(name)}
//                                         disabled={isCreatingClip}
//                                         className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//                                     >
//                                         {isCreatingClip ? (
//                                             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                         ) : (
//                                             <Play size={16} />
//                                         )}
//                                         {isCreatingClip ? "Creating..." : "Create Clip"}
//                                     </button>

//                                     <button
//                                         onClick={toggleMonitor}
//                                         className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors duration-200 font-medium ${isMonitoring ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
//                                             }`}
//                                     >
//                                         {isMonitoring ? <Square size={16} /> : <Play size={16} />}
//                                         {isMonitoring ? "Stop Monitor" : "Start Monitor"}
//                                     </button>
//                                 </div>
//                             </div>
//                             <div className="bg-gray-50 rounded-lg p-4">
//                                 <ViewerChart data={data} />
//                             </div>
//                         </div>

//                         {/* Monitor Activity */}
//                         <div className="bg-white rounded-xl shadow-lg p-6">
//                             <div className="flex items-center justify-between mb-6">
//                                 <h3 className="text-xl font-semibold text-gray-900">Monitor Activity</h3>
//                                 <div className="flex items-center gap-2">
//                                     <div
//                                         className={`w-3 h-3 rounded-full ${isMonitoring ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
//                                     ></div>
//                                     <span className={`text-sm font-medium ${isMonitoring ? "text-green-700" : "text-red-700"}`}>
//                                         {isMonitoring ? "Active" : "Inactive"}
//                                     </span>
//                                 </div>
//                             </div>

//                             {lastClipUrl && (
//                                 <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//                                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                                         <div>
//                                             <p className="text-sm font-medium text-green-800">Latest Clip Created</p>
//                                             <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
//                                                 <Clock size={14} />
//                                                 {new Date().toLocaleTimeString()}
//                                             </p>
//                                         </div>
//                                         <a
//                                             href={lastClipUrl}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
//                                         >
//                                             View Clip
//                                             <ExternalLink size={14} />
//                                         </a>
//                                     </div>
//                                 </div>
//                             )}

//                             <div className="bg-gray-50 rounded-lg p-4">
//                                 <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
//                                     <Activity size={16} />
//                                     Activity Log
//                                 </h4>
//                                 <div className="max-h-64 overflow-y-auto space-y-2">
//                                     {monitorLog.length > 0 ? (
//                                         monitorLog.map((entry, idx) => (
//                                             <div
//                                                 key={idx}
//                                                 className="text-sm font-mono text-gray-600 py-2 px-3 bg-white rounded border-l-4 border-gray-300 hover:border-purple-400 transition-colors duration-200"
//                                             >
//                                                 {entry}
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <div className="text-center py-12">
//                                             <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
//                                                 <Activity className="text-gray-400 w-8 h-8" />
//                                             </div>
//                                             <p className="text-sm text-gray-500 italic">
//                                                 No activity logged yet. Start monitoring to see real-time updates.
//                                             </p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="bg-white rounded-xl shadow-lg p-12 text-center">
//                         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                             <Users className="text-gray-400 w-10 h-10" />
//                         </div>
//                         <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
//                         <p className="text-gray-600 max-w-md mx-auto">
//                             We couldn't find any viewership data for this streamer. Please check the streamer name or try again later.
//                         </p>
//                         <button
//                             onClick={() => window.location.reload()}
//                             className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
//                         >
//                             Refresh Page
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }


"use client"

import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { ArrowLeft, Play, Square, ExternalLink, Activity, Clock, Users, TrendingUp, Eye } from "lucide-react"
import ViewerChart from "../../components/ViewerChart"
import { startChatMonitor, stopChatMonitor } from "../../utils/chatMonitor"

export default function StreamerHistoryPage() {
    const router = useRouter()
    const { name } = router.query
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isMonitoring, setIsMonitoring] = useState(false)
    const [monitorLog, setMonitorLog] = useState([])
    const [lastClipUrl, setLastClipUrl] = useState(null)
    const [isCreatingClip, setIsCreatingClip] = useState(false)

    const logMessage = (msg) => {
        setMonitorLog((prev) => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    useEffect(() => {
        if (!name) return
        setIsLoading(true)
        fetch(`/api/streamer-history?name=${encodeURIComponent(name)}`)
            .then((res) => res.json())
            .then((json) => {
                console.log("Received data:", json); // Debug the data received
                setData(json)
                setIsLoading(false)
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setIsLoading(false)
            })
    }, [name])

    const handleClipClick = async (streamerName) => {
        setIsCreatingClip(true)
        try {
            const tokenRes = await fetch("/api/token")
            if (!tokenRes.ok) {
                const next = `/clipper?streamer=${encodeURIComponent(streamerName)}`
                window.location.href = `/login?next=${encodeURIComponent(next)}`
                return
            }

            const { token } = await tokenRes.json()
            const idRes = await fetch(`/api/user-id?username=${streamerName}&token=${token}`)
            const { id: broadcasterId } = await idRes.json()
            if (!broadcasterId) {
                alert("Failed to get broadcaster ID")
                return
            }

            startChatMonitor(
                streamerName,
                token,
                broadcasterId,
                async () => {
                    logMessage(`🚀 Spike detected! Creating clip...`)
                    const res = await fetch("/api/create-clip", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token, broadcasterId, streamerName }),
                    })
                    const data = await res.json()
                    if (data.url) {
                        setLastClipUrl(data.url)
                        logMessage(`✅ Clip created: ${data.url}`)
                    } else {
                        logMessage(`❌ Clip failed: ${data.error || "Unknown error"}`)
                    }
                },
                ({ streamer, rate, baseline, spike }) => {
                    logMessage(`[${streamer}] Rate: ${rate}/10s | Baseline: ${baseline.toFixed(2)} | Spike: ${spike}`)
                },
            )

            logMessage(`🚀 Chat monitor started for ${streamerName}`)
            setIsMonitoring(true)
        } catch (err) {
            console.error("Clip monitor failed:", err)
            logMessage(`❌ Error starting monitor: ${err.message}`)
        } finally {
            setIsCreatingClip(false)
        }
    }

    const toggleMonitor = async () => {
        try {
            const tokenRes = await fetch("/api/token")
            const { token } = await tokenRes.json()
            const idRes = await fetch(`/api/user-id?username=${name}&token=${token}`)
            const { id: broadcasterId } = await idRes.json()

            if (!isMonitoring) {
                startChatMonitor(
                    name,
                    token,
                    broadcasterId,
                    async () => {
                        logMessage(`🚀 Spike detected! Creating clip...`)
                        const res = await fetch("/api/create-clip", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ token, broadcasterId, streamerName: name }),
                        })
                        const data = await res.json()
                        if (data.url) {
                            setLastClipUrl(data.url)
                            logMessage(`✅ Clip created: ${data.url}`)
                        } else {
                            logMessage(`❌ Clip failed: ${data.error || "Unknown error"}`)
                        }
                    },
                    ({ streamer, rate, baseline, spike }) => {
                        logMessage(`[${streamer}] Rate: ${rate}/10s | Baseline: ${baseline.toFixed(2)} | Spike: ${spike}`)
                    },
                )

                logMessage(`📡 Started monitoring ${name}`)
                setIsMonitoring(true)
            } else {
                stopChatMonitor(name)
                logMessage(`🛑 Stopped monitoring ${name}`)
                setIsMonitoring(false)
            }
        } catch (err) {
            logMessage(`❌ Error toggling monitor: ${err.message}`)
        }
    }

    function ClipControls({ name, isCreatingClip, isMonitoring, handleClipClick, toggleMonitor }) {
        return (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                    onClick={() => handleClipClick(name)}
                    disabled={isCreatingClip}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg
                   hover:bg-purple-700 disabled:opacity-50 border border-purple-500"
                >
                    {isCreatingClip
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Play size={16} />}
                    {isCreatingClip ? 'Creating…' : '🎬 Create Clip'}
                </button>

                <button
                    onClick={toggleMonitor}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white border
                    ${isMonitoring
                            ? 'bg-red-600 hover:bg-red-700 border-red-500'
                            : 'bg-green-600 hover:bg-green-700 border-green-500'}`}
                >
                    {isMonitoring ? <Square size={16} /> : <Play size={16} />}
                    {isMonitoring ? '🛑 Stop Monitor' : '📡 Start Monitor'}
                </button>
            </div>
        );
    }


    const getViewerStats = () => {
        if (!data || !data.length) return { current: 0, peak: 0, average: 0 }

        // Debug data structure
        console.log("Processing data for stats:", data);

        // Make sure we're accessing the right property and handling various data formats
        const viewers = data.map(d => {
            // Check if viewers exists directly or inside a nested property
            if (typeof d.viewers === 'number') return d.viewers;
            if (d.data && typeof d.data.viewers === 'number') return d.data.viewers;
            if (d.viewerCount && typeof d.viewerCount === 'number') return d.viewerCount;
            return 0; // Default to 0 if no viewer data found
        });

        console.log("Extracted viewer counts:", viewers);

        // Handle empty viewers array
        if (!viewers.length) return { current: 0, peak: 0, average: 0 };

        return {
            current: viewers[viewers.length - 1] || 0,
            peak: Math.max(...viewers),
            average: Math.round(viewers.reduce((a, b) => a + b, 0) / viewers.length),
        }
    }

    const stats = getViewerStats()
    console.log("Calculated stats:", stats); // Debug the calculated stats

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-1/3 mb-8"></div>
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
                            <div className="h-64 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            {name}
                        </h1>
                        <p className="text-gray-400 mt-1">Viewership Analytics & Auto-Clipper</p>
                    </div>
                </div>

                {/* {data.length > 0 ? (
                    <div className="space-y-6">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <h2 className="text-xl font-semibold text-white">📊 Viewership Timeline</h2>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleClipClick(name)}
                                        disabled={isCreatingClip}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium border border-purple-500"
                                    >
                                        {isCreatingClip ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Play size={16} />
                                        )}
                                        {isCreatingClip ? "Creating..." : "🎬 Create Clip"}
                                    </button>

                                    <button
                                        onClick={toggleMonitor}
                                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors duration-200 font-medium border ${isMonitoring
                                            ? "bg-red-600 hover:bg-red-700 border-red-500"
                                            : "bg-green-600 hover:bg-green-700 border-green-500"
                                            }`}
                                    >
                                        {isMonitoring ? <Square size={16} /> : <Play size={16} />}
                                        {isMonitoring ? "🛑 Stop Monitor" : "📡 Start Monitor"}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                                <ViewerChart data={data} />
                            </div>
                        </div>

                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white">🛠 Monitor Activity</h3>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-3 h-3 rounded-full ${isMonitoring ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                                    ></div>
                                    <span
                                        className={`text-sm font-medium px-2 py-1 rounded ${isMonitoring ? "text-green-400 bg-green-900/30" : "text-red-400 bg-red-900/30"
                                            }`}
                                    >
                                        {isMonitoring ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>

                            {lastClipUrl && (
                                <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-green-400">✅ Latest Clip Created</p>
                                            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock size={14} />
                                                {new Date().toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <a
                                            href={lastClipUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium border border-green-500"
                                        >
                                            View Clip
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                    <Activity size={16} />
                                    Activity Log
                                </h4>
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {monitorLog.length > 0 ? (
                                        monitorLog.map((entry, idx) => (
                                            <div
                                                key={idx}
                                                className="text-sm font-mono text-gray-300 py-2 px-3 bg-gray-800 rounded border-l-4 border-blue-500 hover:border-purple-400 transition-colors duration-200"
                                            >
                                                {entry}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Activity className="text-gray-500 w-8 h-8" />
                                            </div>
                                            <p className="text-sm text-gray-500 italic">
                                                No activity logged yet. Start monitoring to see real-time updates.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
                        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="text-gray-500 w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
                        <p className="text-gray-400 max-w-md mx-auto mb-6">
                            We couldn't find any viewership data for this streamer. Please check the streamer name or try again later.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium border border-blue-500"
                        >
                            Refresh Page
                        </button>
                    </div>
                )} */}

                {data.length > 0 && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-semibold text-white">📊 Viewership Timeline</h2>
                            <ClipControls
                                name={name}
                                isCreatingClip={isCreatingClip}
                                isMonitoring={isMonitoring}
                                handleClipClick={handleClipClick}
                                toggleMonitor={toggleMonitor}
                            />
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                            <ViewerChart data={data} />
                        </div>
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                <Activity size={16} />
                                Activity Log
                            </h4>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {monitorLog.length > 0 ? (
                                    monitorLog.map((entry, idx) => (
                                        <div
                                            key={idx}
                                            className="text-sm font-mono text-gray-300 py-2 px-3 bg-gray-800 rounded border-l-4 border-blue-500 hover:border-purple-400 transition-colors duration-200"
                                        >
                                            {entry}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Activity className="text-gray-500 w-8 h-8" />
                                        </div>
                                        <p className="text-sm text-gray-500 italic">
                                            No activity logged yet. Start monitoring to see real-time updates.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {data.length === 0 && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center space-y-6">
                        <h3 className="text-xl font-semibold text-white">No Data Available</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            We haven’t recorded any viewership snapshots for this streamer yet.
                            You can still start monitoring or create a clip right away.
                        </p>

                        <ClipControls
                            name={name}
                            isCreatingClip={isCreatingClip}
                            isMonitoring={isMonitoring}
                            handleClipClick={handleClipClick}
                            toggleMonitor={toggleMonitor}
                        />
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                <Activity size={16} />
                                Activity Log
                            </h4>
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {monitorLog.length > 0 ? (
                                    monitorLog.map((entry, idx) => (
                                        <div
                                            key={idx}
                                            className="text-sm font-mono text-gray-300 py-2 px-3 bg-gray-800 rounded border-l-4 border-blue-500 hover:border-purple-400 transition-colors duration-200"
                                        >
                                            {entry}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Activity className="text-gray-500 w-8 h-8" />
                                        </div>
                                        <p className="text-sm text-gray-500 italic">
                                            No activity logged yet. Start monitoring to see real-time updates.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
