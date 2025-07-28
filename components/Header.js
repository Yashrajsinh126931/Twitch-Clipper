import React, { useState } from "react";
import {
    Zap,
    Video,
    Scissors,
} from "lucide-react"
import Link from "next/link";

export default function Header() {
    const [activeTab, setActiveTab] = useState("home");
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [monitoringStreamer, setMonitoringStreamer] = useState("");
    return (
        <header className="bg-gradient-to-r from-purple-900 via-black to-purple-900 border-b border-purple-500/20 sticky top-0 z-40">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Ultimate Clipper Pro
                            </h1>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center space-x-8">
                        {/* <button
                            href="/Streamers"
                            onClick={() => setActiveTab("streamers")}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === "streamers"
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                                : "text-gray-300 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            <Video className="w-4 h-4" />
                            <span>Streamers</span>
                        </button> */}
                        <Link
                            href="/clips"
                            onClick={() => setActiveTab("clips")}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === "clips"
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                                : "text-gray-300 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            <Scissors className="w-4 h-4" />
                            <span>Clips</span>
                        </Link>
                    </nav>

                    {/* Status Indicator */}
                    <div className="flex items-center space-x-3">
                        {isMonitoring && (
                            <div className="flex items-center space-x-2 px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-400">Monitoring {monitoringStreamer}</span>
                            </div>
                        )}
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full"></div>
                    </div>
                </div>
            </div>
        </header>
    );
}