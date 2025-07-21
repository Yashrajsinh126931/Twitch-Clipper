"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import { Gamepad2, Zap, Users, TrendingUp, Sparkles } from "lucide-react"

export default function Login() {
    const router = useRouter()
    const { next = "/" } = router.query
    const [isLoading, setIsLoading] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const handleLogin = () => {
        setIsLoading(true)
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
            redirect_uri: process.env.NEXT_PUBLIC_TWITCH_REDIRECT_URI,
            response_type: "code",
            scope: "clips:edit user:read:email",
            state: next,
        })
        window.location.href = `https://id.twitch.tv/oauth2/authorize?${params.toString()}`
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleLogin()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Enhanced Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                    className="absolute top-10 right-10 w-48 h-48 bg-pink-500/15 rounded-full blur-2xl animate-pulse"
                    style={{ animationDelay: "1.5s" }}
                ></div>
                <div
                    className="absolute bottom-10 left-10 w-56 h-56 bg-cyan-500/15 rounded-full blur-2xl animate-pulse"
                    style={{ animationDelay: "2s" }}
                ></div>
            </div>

            {/* Enhanced Floating Gaming Icons */}
            <div className="absolute inset-0 pointer-events-none">
                <Gamepad2
                    className="absolute top-1/4 left-1/4 w-8 h-8 text-purple-400/30 animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                />
                <Zap
                    className="absolute top-1/3 right-1/4 w-6 h-6 text-blue-400/30 animate-bounce"
                    style={{ animationDelay: "0.7s" }}
                />
                <Users
                    className="absolute bottom-1/3 left-1/3 w-7 h-7 text-indigo-400/30 animate-bounce"
                    style={{ animationDelay: "1s" }}
                />
                <TrendingUp
                    className="absolute bottom-1/4 right-1/3 w-6 h-6 text-purple-400/30 animate-bounce"
                    style={{ animationDelay: "0.5s" }}
                />
                <Sparkles
                    className="absolute top-1/2 right-1/6 w-5 h-5 text-blue-400/30 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                />
                <Gamepad2
                    className="absolute top-3/4 left-1/6 w-6 h-6 text-pink-400/25 animate-bounce"
                    style={{ animationDelay: "1.2s" }}
                />
                <Zap
                    className="absolute top-1/6 left-1/2 w-5 h-5 text-cyan-400/25 animate-bounce"
                    style={{ animationDelay: "0.8s" }}
                />
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                        }}
                    ></div>
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-purple-500/25">
                    <div className="p-8">
                        {/* Logo Section */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 shadow-lg transform transition-transform duration-300 hover:rotate-12 hover:scale-110">
                                <span className="text-3xl">🎯</span>
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 animate-pulse">
                                TwitchRadar
                            </h1>
                            <p className="text-gray-400 text-sm">Discover, analyze, and dominate the streaming world</p>
                        </div>

                        {/* Enhanced Features Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {[
                                { icon: Gamepad2, text: "Gaming Analytics", color: "purple" },
                                { icon: TrendingUp, text: "Trend Tracking", color: "blue" },
                                { icon: Users, text: "Community Insights", color: "indigo" },
                                { icon: Zap, text: "Real-time Data", color: "pink" },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className={`bg-${feature.color}-500/10 rounded-lg p-3 border border-${feature.color}-500/20 transform transition-all duration-300 hover:scale-105 hover:bg-${feature.color}-500/20 cursor-pointer group`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <feature.icon
                                        className={`w-5 h-5 text-${feature.color}-400 mb-1 group-hover:scale-110 transition-transform duration-200`}
                                    />
                                    <p className="text-xs text-gray-300 group-hover:text-white transition-colors duration-200">
                                        {feature.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Login Button */}
                        <button
                            onClick={handleLogin}
                            onKeyDown={handleKeyDown}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            disabled={isLoading}
                            className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-4 focus:ring-purple-500/50 relative overflow-hidden group"
                        >
                            {/* Button shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Connecting to Twitch...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2 relative z-10">
                                    <svg
                                        className={`w-6 h-6 transition-transform duration-200 ${isHovered ? "scale-110" : ""}`}
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                                    </svg>
                                    <span>Continue with Twitch</span>
                                </div>
                            )}
                        </button>

                        {/* Enhanced Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500 mb-3">Secure OAuth 2.0 authentication powered by Twitch</p>
                            <div className="flex justify-center space-x-1 mb-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <div
                                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                                    style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                                    style={{ animationDelay: "0.2s" }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-600">Trusted by 10,000+ streamers worldwide</p>
                        </div>
                    </div>

                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
            </div>

            {/* Enhanced Animated Border Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
                <div
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-indigo-500 to-transparent animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                    className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-pink-500 to-transparent animate-pulse"
                    style={{ animationDelay: "1.5s" }}
                ></div>
            </div>

            {/* Corner accent elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-400/30"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-blue-400/30"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-indigo-400/30"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-pink-400/30"></div>
        </div>
    )
}
