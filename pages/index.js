"use client"
import Router from "next/router"
import StreamerCard from "../components/StreamerCard"
import ViewerChart from "../components/ViewerChart"
import { startChatMonitor, stopChatMonitor } from "../utils/chatMonitor"
import { useEffect, useState } from "react"
import {
  Play,
  Square,
  ExternalLink,
  Activity,
  TrendingUp,
  Eye,
  Search,
  Filter,
  Scissors,
} from "lucide-react"
import Link from "next/link"
import Header from "@/components/Header"

export default function HomePage() {
  const [streams, setStreams] = useState([])
  const [selectedStreamer, setSelectedStreamer] = useState(null)
  const [selectedHistory, setSelectedHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("viewers")
  const [clipWorthyOnly, setClipWorthyOnly] = useState(false)
  const [selectedGame, setSelectedGame] = useState("All Games")
  const [monitorLog, setMonitorLog] = useState([])
  const [lastClipUrl, setLastClipUrl] = useState(null)
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState(null)
  const [activeTab, setActiveTab] = useState("home")

  const games = ["All Games", ...new Set(streams.map((s) => s.game))]
  const [token, setToken] = useState(null)

  useEffect(() => {
    fetch("/api/token")
      .then((res) => res.json())
      .then((data) => {
        if (data.token) setToken(data.token)
        else Router.push("/login")
      })
  }, [Router])

  const handleStreamerClick = async (streamer) => {
    setSelectedStreamer(streamer)
    setHistoryLoading(true)
    setSelectedHistory([])
    try {
      const res = await fetch(`/api/streamer-history?name=${encodeURIComponent(streamer.name)}`)
      if (!res.ok) throw new Error("Failed to fetch history")
      const data = await res.json()
      setSelectedHistory(data)
    } catch (err) {
      console.error("Error fetching history:", err)
      setSelectedHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const [isMonitoring, setIsMonitoring] = useState(false)
  const [monitoringStreamer, setMonitoringStreamer] = useState(null)

  const logMessage = (msg) => {
    setMonitorLog((prev) => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const ManualClip = async (streamerName) => {
    try {
      const res = await fetch("/api/token")
      if (res.status === 200) {
        window.location.href = `/clipper?streamer=${encodeURIComponent(streamerName)}`
      } else {
        const next = `/clipper?streamer=${encodeURIComponent(streamerName)}`
        window.location.href = `/login?next=${encodeURIComponent(next)}`
      }
    } catch (err) {
      console.error("Clip access check failed:", err)
      alert("Something went wrong. Try again.")
    }
  }

  const handleClipClick = async (streamerName) => {
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
        ({ streamer, count, baseline, spike }) => {
          logMessage(`[${streamer}] Rate: ${count}/10s | Baseline: ${baseline.toFixed(2)} | Spike: ${spike}`)
        },
      )
      setIsMonitoring(true)
      setMonitoringStreamer(streamerName)
      logMessage(`🚀 Chat monitor started for ${streamerName}`)
      alert(`🚀 Chat monitor started for ${streamerName}`)
    } catch (err) {
      console.error("Clip monitor failed:", err)
      alert("Error starting monitor.")
    }
  }

  const toggleMonitor = async (streamerName) => {
    if (isMonitoring) {
      stopChatMonitor(streamerName)
      setIsMonitoring(false)
      setMonitoringStreamer(null)
      logMessage(`📴 Chat monitor stopped for ${streamerName}`)
    } else {
      try {
        const tokenRes = await fetch("/api/token")
        if (!tokenRes.ok) {
          alert("Authentication failed")
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
          ({ streamer, count, baseline, spike }) => {
            logMessage(`[${streamer}] Rate: ${count}/10s | Baseline: ${baseline.toFixed(2)} | Spike: ${spike}`)
          },
        )
        setIsMonitoring(true)
        setMonitoringStreamer(streamerName)
        logMessage(`🚀 Chat monitor started for ${streamerName}`)
      } catch (err) {
        console.error("Monitor toggle failed:", err)
        logMessage(`❌ Error: ${err.message}`)
        alert("Error toggling monitor.")
      }
    }
  }

  const closeModal = () => {
    setSelectedStreamer(null)
    setSelectedHistory([])
    setHistoryLoading(false)
  }

  const handleGlobalSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) return
    setLookupLoading(true)
    setLookupResult(null)
    setLookupError(null)
    try {
      const res = await fetch(`/api/lookup?name=${encodeURIComponent(searchTerm)}`)
      if (!res.ok) throw new Error("Streamer not found")
      const data = await res.json()
      setLookupResult(data)
    } catch (err) {
      setLookupError("Streamer not found or Twitch API error.")
    } finally {
      setLookupLoading(false)
    }
  }

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setError(null)
        const res = await fetch("/api/streams")
        if (!res.ok) throw new Error("Failed to fetch streams")
        const data = await res.json()
        setStreams(data)
      } catch (err) {
        console.error("Error fetching streams:", err)
        setError("Failed to load streams. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchStreams()
    const interval = setInterval(fetchStreams, 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredAndSortedStreams = streams
    .filter((stream) => {
      const matchesSearch =
        stream.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stream.game.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGame = selectedGame === "All Games" || stream.game === selectedGame
      const isClipWorthy = !clipWorthyOnly || Number(stream.clip_score) >= 1
      return matchesSearch && matchesGame && isClipWorthy
    })
    .sort((a, b) => {
      if (clipWorthyOnly) return Number(b.clip_score) - Number(a.clip_score)
      switch (sortBy) {
        case "viewers":
          return b.viewers - a.viewers
        case "name":
          return a.name.localeCompare(b.name)
        case "game":
          return a.game.localeCompare(b.game)
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="container mx-auto px-6 py-8">
          {/* Controls */}
          <div className="mb-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search streamers or games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {/* Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                  >
                    {games.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clip-worthy toggle */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400">Clip Worthy</span>
                  <button
                    onClick={() => setClipWorthyOnly(!clipWorthyOnly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${clipWorthyOnly ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-600"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform duration-200 ${clipWorthyOnly ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                >
                  <option value="viewers">Sort by Viewers</option>
                  <option value="name">Sort by Name</option>
                  <option value="game">Sort by Game</option>
                </select>
              </div>
            </div>
          </div>

          {/* 🔍 Global Lookup */}
          {filteredAndSortedStreams.length === 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={handleGlobalSearch}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-600/25"
              >
                <Search className="w-4 h-4" />
                <span>Can't find the streamer? Try global search →</span>
              </button>
            </div>
          )}

          {/* Global Lookup Result */}
          {lookupLoading && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 text-purple-400">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Looking up streamer...</span>
              </div>
            </div>
          )}
          {lookupError && (
            <p className="text-sm text-red-400 mt-4 text-center bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              {lookupError}
            </p>
          )}
          {lookupResult && (
            <div className="mt-6 p-6 border border-gray-700/50 rounded-2xl bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <img
                  src={lookupResult.profile.profile_image_url || "/placeholder.svg"}
                  className="w-16 h-16 rounded-full border-2 border-purple-500/30"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white">{lookupResult.profile.display_name}</h2>
                  <p className="text-sm text-gray-400">{lookupResult.profile.description}</p>
                </div>
                <span
                  className={`ml-auto text-xs px-3 py-1 rounded-full font-medium ${lookupResult.live ? "bg-green-600/20 text-green-400 border border-green-500/30" : "bg-gray-600/20 text-gray-400 border border-gray-500/30"}`}
                >
                  {lookupResult.live ? "🔴 LIVE" : "Offline"}
                </span>
              </div>
              {lookupResult.live && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400">
                    Playing <strong className="text-purple-400">{lookupResult.stream.game_name}</strong> •{" "}
                    <span className="text-green-400">{lookupResult.stream.viewer_count} viewers</span>
                  </p>
                  <p className="italic mt-1 text-gray-300">{lookupResult.stream.title}</p>
                  <a
                    href={`https://twitch.tv/${lookupResult.profile.login}`}
                    target="_blank"
                    className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                    rel="noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Watch Stream</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading streams...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* Streamers */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {filteredAndSortedStreams.map((stream, i) => (
                <StreamerCard key={i} {...stream} onClick={() => handleStreamerClick(stream)} />
              ))}
            </div>
          )}

          {/* Modal with ViewerChart */}
          {selectedStreamer && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
                <div className="flex justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      <Link
                        href={`/streamers/${selectedStreamer.name}`}
                        className="hover:text-purple-400 transition-colors"
                      >
                        {selectedStreamer.name}
                      </Link>
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{selectedStreamer.viewers} viewers</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Clip Score: {selectedStreamer.clip_score}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                  >
                    ✖
                  </button>
                </div>
                {historyLoading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading history...</p>
                  </div>
                ) : (
                  <>
                    <ViewerChart data={selectedHistory} />
                    <div className="mt-6 flex justify-end gap-4">
                      <button
                        onClick={() => ManualClip(selectedStreamer.name)}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-600/25"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>🎬 Clip This Stream</span>
                      </button>
                      <button
                        onClick={() => toggleMonitor(selectedStreamer.name)}
                        className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg ${isMonitoring ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-600/25" : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-600/25"} text-white`}
                      >
                        {isMonitoring ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>{isMonitoring ? "🛑 Stop Monitor" : "📡 Start Monitor"}</span>
                      </button>
                    </div>
                    {lastClipUrl && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/30 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <p className="text-green-400 font-medium flex items-center gap-2">
                                <Play size={16} />
                                Latest Clip Created!
                              </p>
                              <p className="text-green-300/70 text-sm">Ready to watch</p>
                            </div>
                          </div>
                          <a
                            href={lastClipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors duration-200"
                          >
                            <span>Watch</span>
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-xl p-6 mt-4">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-purple-400" />
                        Activity Log
                      </h4>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {monitorLog.length > 0 ? (
                          monitorLog.map((entry, idx) => (
                            <div
                              key={idx}
                              className="text-sm font-mono text-gray-300 py-3 px-4 bg-gray-800/50 rounded-lg border-l-4 border-purple-500/50 hover:border-purple-400 hover:bg-gray-800/70 transition-all duration-200"
                            >
                              {entry}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Activity className="text-gray-500 w-8 h-8" />
                            </div>
                            <p className="text-gray-400 mb-2">No activity logged yet</p>
                            <p className="text-gray-500 text-sm italic">Start monitoring to see real-time updates.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
