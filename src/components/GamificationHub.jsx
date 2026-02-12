import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaTrophy, FaStar, FaLock, FaCheckCircle, FaMedal } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa'; // Dynamic icon loading
import toast from 'react-hot-toast';

const GamificationHub = () => {
    const { user, refreshProfile } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [badges, setBadges] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userPoints, setUserPoints] = useState(0);

    useEffect(() => {
        if (user) {
            fetchGamificationData();
        }
    }, [user, fetchGamificationData]);

    const fetchGamificationData = React.useCallback(async () => {
        try {
            setLoading(true);

            // 1. Fetch User Points (ensure up to date)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('points, badges')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;
            setUserPoints(profileData.points || 0);

            // 2. Fetch All Badge Definitions
            const { data: badgeDefs, error: badgeError } = await supabase
                .from('badge_definitions')
                .select('*')
                .order('points_required', { ascending: true });

            if (badgeError) throw badgeError;
            setBadges(badgeDefs || []);

            // 3. Fetch Leaderboard (Top 10)
            const { data: topUsers, error: leaderboardError } = await supabase
                .from('profiles')
                .select('username, full_name, points, avatar_url')
                .order('points', { ascending: false })
                .limit(10);

            if (leaderboardError) throw leaderboardError;
            setLeaderboard(topUsers || []);

        } catch (error) {
            console.error("Error fetching gamification data:", error);
            toast.error(t.error_gamification_data || "Failed to load gamification data.");
        } finally {
            setLoading(false);
        }
    }, [user, t]);

    const handleClaimBadge = async (badgeId) => {
        try {
            const toastId = toast.loading(t.claiming_badge || "Claiming badge...");

            // Call RPC or manually update? RPC is safer but let's try direct update if RPC fails
            // Actually I defined an RPC 'claim_badge' earlier.
            // But wait, the RPC name was `claim_badge`.

            // Wait, Supabase RPC call:
            // const { data, error } = await supabase.rpc('claim_badge', { p_badge_id: badgeId });
            // The RPC defined earlier takes p_badge_id.

            // Let's implement the client-side check first visually, but real logic should be server-side.
            // Using the RPC:

            const { error } = await supabase.rpc('claim_badge', { p_badge_id: badgeId });

            if (error) throw error;

            toast.success(t.badge_claimed_success || "Badge claimed!", { id: toastId });
            fetchGamificationData(); // Refresh to show unlocked
            refreshProfile(); // Refresh global user context

        } catch (error) {
            console.error("Error claiming badge:", error);
            toast.error(error.message || t.badge_claim_error || "Failed to claim badge");
        }
    };

    const isBadgeClaimed = (badgeId) => {
        const userBadges = user?.badges || []; // user.badges might be outdated if we don't refresh, but profileData has it.
        // Actually, let's use the local state or ensuring user context is fresh.
        // The fetchGamificationData fetches profileData.badges too, but I didn't set it to state individually.
        // Let's rely on `refreshProfile` updating `user`.

        // Check if badge is in the user's badges array (which is JSONB)
        // Structure: [{id: '...'}]
        return userBadges.some(b => b.id === badgeId);
    };

    const renderIcon = (iconName, className) => {
        const Icon = FaIcons[iconName] || FaIcons.FaAward;
        return <Icon className={className} />;
    };

    if (loading) return <div className="p-8 text-center">{t.loading_gamification || "Loading Gamification Hub..."}</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            {/* Header / My Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{t.gamification_hub || "Gamification Hub"}</h1>
                    <p className="opacity-90">{t.gamification_desc || "Track your progress and achievements!"}</p>
                </div>
                <div className="mt-6 md:mt-0 text-center bg-white/20 backdrop-blur-md rounded-xl p-4 min-w-[200px]">
                    <p className="text-sm uppercase tracking-wider font-semibold opacity-80">{t.my_points || "My Points"}</p>
                    <p className="text-4xl font-extrabold flex items-center justify-center gap-2">
                        <FaStar className="text-yellow-300" />
                        {userPoints}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Badges Section */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <FaMedal className="text-yellow-500" /> {t.available_badges || "Available Badges"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {badges.map(badge => {
                            const claimed = isBadgeClaimed(badge.id);
                            // const locked = userPoints < badge.points_required && !claimed; // Unused
                            const canClaim = userPoints >= badge.points_required && !claimed;

                            return (
                                <div
                                    key={badge.id}
                                    className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${claimed
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : canClaim
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
                                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 opacity-75'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-full ${claimed ? 'text-green-600 bg-green-100' :
                                            canClaim ? 'text-blue-600 bg-blue-100' :
                                                'text-gray-400 bg-gray-200 dark:bg-gray-700'
                                            }`}>
                                            {renderIcon(badge.icon, "text-2xl")}
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${claimed ? 'bg-green-200 text-green-800' :
                                                canClaim ? 'bg-blue-200 text-blue-800' :
                                                    'bg-gray-200 text-gray-600'
                                                }`}>
                                                {badge.points_required} {t.points || "PTS"}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="mt-4 font-bold text-lg dark:text-white">{t[badge.id] || badge.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t[`${badge.id}_desc`] || badge.description}</p>

                                    <div className="mt-4">
                                        {claimed ? (
                                            <span className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                                <FaCheckCircle /> {t.claimed || "Claimed"}
                                            </span>
                                        ) : canClaim ? (
                                            <button
                                                onClick={() => handleClaimBadge(badge.id)}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition-colors animate-pulse"
                                            >
                                                {t.claim_badge || "Claim Badge"}
                                            </button>
                                        ) : (
                                            <span className="flex items-center gap-2 text-gray-500 text-sm">
                                                <FaLock /> {t.locked || "Locked"} ({badge.points_required - userPoints} {t.pts_needed || "pts needed"})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Leaderboard Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" /> {t.leaderboard || "Leaderboard"}
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                        {leaderboard.map((user, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-4 p-4 border-b last:border-0 dark:border-gray-700 ${index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                                    }`}
                            >
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                                    index === 1 ? 'bg-gray-400 text-white' :
                                        index === 2 ? 'bg-orange-500 text-white' :
                                            'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate dark:text-white">{user.username || user.full_name || 'Anonymous'}</p>
                                    <p className="text-xs text-gray-500">{user.points} {t.points || "points"}</p>
                                </div>
                                {index === 0 && <FaTrophy className="text-yellow-500" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationHub;
