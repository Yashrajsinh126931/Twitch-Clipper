"use client";
import { useState } from "react";
import useSWR from "swr";
import {
    ExternalLink,
    RefreshCw,
    Loader2,
    Download,
    Search,
    Play,
    Calendar,
    User,
    Film,
    Zap,
    CheckCircle,
    AlertCircle,
    Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const fetcher = (url) => fetch(url).then((r) => r.json());

function ClipCard({ clip }) {
    const [status, setStatus] = useState("idle"); // idle | down | ok | err
    const [thumbnailError, setThumbnailError] = useState(false);
    const [mobileMessage, setMobileMessage] = useState("");

    const downloadClip = async () => {
        if (status === "down") return;
        setStatus("down");
        setMobileMessage("");

        try {
            // Detect mobile devices more comprehensively
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            // For mobile devices, use a direct link approach
            if (isMobile) {
                setMobileMessage("Opening download link for mobile device...");

                // For mobile, open the download URL in a new window/tab
                // This allows the mobile browser to handle the download appropriately
                const downloadUrl = `/api/mobileDownload?clipId=${clip.clipId}`;
                window.open(downloadUrl, '_blank');

                setStatus("ok");
                setMobileMessage("Download link opened! Check your browser downloads or follow the link to save the video.");

                // Clear message after some time
                setTimeout(() => setMobileMessage(""), 8000);
                return;
            }            // For Safari on desktop, use GET redirect approach
            if (isSafari) {
                const downloadUrl = `/api/clipDownload?clipId=${clip.clipId}`;
                window.open(downloadUrl, "_blank");
                setStatus("ok");
                return;
            }

            // For desktop browsers: use POST with blob response
            const res = await fetch("/api/downloadClip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clipId: clip.clipId }),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error(`Download failed: ${res.status} - ${errText}`);
                throw new Error(errText || 'Download failed');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${clip.streamerName}_${clip.clipId}.mp4`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
            setStatus("ok");
        } catch (err) {
            console.error("Download error:", err);
            setStatus("err");
            setMobileMessage("Download failed. Please try again or use the 'Watch' button.");
        } finally {
            setTimeout(() => {
                setStatus("idle");
                setMobileMessage("");
            }, 3000);
        }
    };

    const getStatusButton = () => {
        switch (status) {
            case "down":
                return {
                    text: "Downloading...",
                    icon: <Loader2 className="w-4 h-4 animate-spin" />,
                    className: "bg-blue-600 border-blue-500 cursor-not-allowed",
                };
            case "ok":
                return {
                    text: "Downloaded!",
                    icon: <CheckCircle className="w-4 h-4" />,
                    className: "bg-green-600 border-green-500",
                };
            case "err":
                return {
                    text: "Failed",
                    icon: <AlertCircle className="w-4 h-4" />,
                    className: "bg-red-600 border-red-500",
                };
            default:
                return {
                    text: "Download",
                    icon: <Download className="w-4 h-4" />,
                    className:
                        "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500 hover:from-purple-700 hover:to-pink-700",
                };
        }
    };

    const buttonConfig = getStatusButton();

    // Format duration if available or use default
    const formatDuration = (seconds) => {
        if (!seconds && seconds !== 0) return "0:30";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const duration = formatDuration(clip.duration);

    return (
        <div className="group bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
            {/* Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                {clip.thumbnailUrl && !thumbnailError ? (
                    <Image
                        src={clip.thumbnailUrl}
                        alt={clip.title || `${clip.streamerName}'s clip`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105 duration-300"
                        onError={() => setThumbnailError(true)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-600/50 group-hover:scale-110 transition-transform duration-300">
                            {thumbnailError ? (
                                <ImageIcon className="w-8 h-8 text-white" />
                            ) : (
                                <Play className="w-8 h-8 text-white ml-1" />
                            )}
                        </div>
                    </div>
                )}

                <div className="absolute top-3 left-3">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-red-600/90 backdrop-blur-sm rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-bold uppercase tracking-wide">Clip</span>
                    </div>
                </div>

                <div className="absolute top-3 right-3">
                    <div className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
                        <span className="text-white text-xs font-medium">{duration}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors duration-200">
                            {clip.streamerName}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(clip.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {clip.title && (
                    <div className="mb-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                        <p className="text-gray-300 text-sm italic">"{clip.title}"</p>
                    </div>
                )}

                <div className="flex space-x-3">
                    <a
                        href={clip.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500 rounded-xl text-white font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-blue-600/25"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>Watch</span>
                    </a>

                    <button
                        onClick={downloadClip}
                        disabled={status === "down"}
                        className={`flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 border rounded-xl text-white font-medium transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${buttonConfig.className}`}
                    >
                        {buttonConfig.icon}
                        <span>{buttonConfig.text}</span>
                    </button>
                </div>

                {/* Mobile download message */}
                {mobileMessage && (
                    <div className="mt-3 p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-200 text-xs text-center">{mobileMessage}</p>
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">`
                    <div className="flex items-center space-x-1">
                        <Film className="w-3 h-3" />
                        <span>Clip ID: {clip.clipId?.slice(-6) || "N/A"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span>Auto-generated</span>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-pink-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
    );
}

export default function ClipLibrary() {
    const { data, isLoading, mutate } = useSWR("/api/clips", fetcher, {
        refreshInterval: 60000,
    });
    const [search, setSearch] = useState("");

    const filtered =
        data?.filter((c) =>
            c.streamerName?.toLowerCase().includes(search.toLowerCase()) ||
            (c.title?.toLowerCase() || "").includes(search.toLowerCase())
        ) ?? [];

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="bg-gradient-to-r from-purple-900 via-black to-purple-900 border-b border-purple-500/20 sticky top-0 z-40">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="text-white hover:text-purple-400 transition-colors duration-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                                    <Film className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Clip Library
                                </h1>
                            </div>
                        </Link>
                        <div className="text-sm text-gray-400">
                            {filtered.length} clip{filtered.length !== 1 ? "s" : ""} found
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Your Clip Collection
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Browse and download all your automatically generated clips
                    </p>
                </div>

                <div className="mb-8 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by streamer name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        <button
                            onClick={() => mutate()}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-600/25"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 text-lg">Loading your clips...</p>
                    </div>
                )}

                {!isLoading && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Film className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">No clips found</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            {search
                                ? `No clips match "${search}". Try a different search term.`
                                : "Start monitoring streamers to automatically generate clips!"}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors duration-200"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}

                {!isLoading && filtered.length > 0 && (
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((clip) => (
                            <ClipCard key={clip._id} clip={clip} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
