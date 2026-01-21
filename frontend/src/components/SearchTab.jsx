import { useState } from 'react';
import { userAPI } from '../services/api';
import './SearchTab.css';

const translations = {
    EN: {
        eyebrow: 'Search',
        searchPlaceholder: 'Search by username or name...',
        startTitle: 'Start Searching',
        startText: 'Type a username or name to see matching users.',
        searching: 'Searching...',
        noResultsTitle: 'No matches found',
        noResultsText: 'Try a different name or check spelling.',
        resultsTitle: 'Live matches',
        follow: 'Follow',
        following: 'Following',
        sendAnonymous: 'Send Anonymous Message',
        sent: 'Message Sent',
        authNeeded: 'Login required to follow.',
        emptyHint: 'Safe, private, and touch-friendly.',
        chipRecent: 'Recent',
        chipPopular: 'Popular now',
    },
    AR: {
        eyebrow: 'بحث',
        searchPlaceholder: 'ابحث بالاسم أو اسم المستخدم...',
        startTitle: 'ابدأ البحث',
        startText: 'اكتب اسم المستخدم أو الاسم لرؤية النتائج.',
        searching: 'جارٍ البحث...',
        noResultsTitle: 'لا توجد نتائج',
        noResultsText: 'جرّب اسمًا مختلفًا أو تحقق من الإملاء.',
        resultsTitle: 'النتائج المباشرة',
        follow: 'متابعة',
        following: 'يتابع',
        sendAnonymous: 'إرسال رسالة مجهولة',
        sent: 'تم الإرسال',
        authNeeded: 'تسجيل الدخول مطلوب للمتابعة.',
        emptyHint: 'آمن، خاص، وملائم للمس.',
        chipRecent: 'الأحدث',
        chipPopular: 'شائع الآن',
    },
    ES: {
        eyebrow: 'Buscar',
        subtitle: 'Busca por nombre o usuario, agrega amigos o envía un mensaje anónimo único.',
        searchPlaceholder: 'Busca por usuario o nombre...',
        startTitle: 'Comienza a buscar',
        startText: 'Escribe un usuario o nombre para ver coincidencias.',
        searching: 'Buscando...',
        noResultsTitle: 'Sin resultados',
        noResultsText: 'Prueba con otro nombre o revisa la ortografía.',
        resultsTitle: 'Coincidencias en vivo',
        follow: 'Seguir',
        following: 'Siguiendo',
        sendAnonymous: 'Enviar mensaje anónimo',
        sent: 'Mensaje enviado',
        authNeeded: 'Debes iniciar sesión para seguir.',
        sessionRule: 'Límite de un mensaje anónimo por sesión.',
        emptyHint: 'Seguro, privado y táctil.',
        chipRecent: 'Reciente',
        chipPopular: 'Popular ahora',
    },
};

const SearchTab = ({ isAuthenticated, onUserClick, currentUser = null }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [sentMessages, setSentMessages] = useState(new Set());
    const [followingSet, setFollowingSet] = useState(new Set());
    const [language, setLanguage] = useState('EN');
    const [error, setError] = useState(null);
    const [friendMessage, setFriendMessage] = useState(null);

    const currentUsername = currentUser?.username || 'Guest';

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (!query) {
            setSearchResults([]);
            setError(null);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setError(null);
        setFriendMessage(null);
        setHasSearched(true);

        try {
            const users = await userAPI.searchUsers(query);
            const normalized = users.map((u) => ({
                id: u.id,
                username: u.username,
                displayName: u.name || u.username,
                isFriend: false,
                avatar: null,
            }));

            const exact = normalized.filter(
                (u) => u.username.toLowerCase() === query.toLowerCase()
            );

            if (exact.length === 0) {
                setSearchResults([]);
                setError('User not found');
            } else {
                // For each user, check their follow status
                const enrichedResults = await Promise.all(
                    exact.map(async (user) => {
                        try {
                            // Check follow status (works for guests too - returns false)
                            const statusData = await userAPI.checkFollowStatus(user.id);
                            console.log('Follow status for user', user.id, ':', statusData);
                            return {
                                ...user,
                                isFriend: statusData.is_following || false,
                            };
                        } catch (err) {
                            console.error('Error checking follow status:', err);
                            return { ...user, isFriend: false };
                        }
                    })
                );
                console.log('Search results:', enrichedResults);
                setSearchResults(enrichedResults);
                // Update followingSet
                const newFollowingSet = new Set(enrichedResults.filter(u => u.isFriend).map(u => u.id));
                setFollowingSet(newFollowingSet);
            }
        } catch (err) {
            setSearchResults([]);
            setError('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        if (!value.trim()) {
            setHasSearched(false);
            setSearchResults([]);
            setError(null);
            setFriendMessage(null);
        }
    };

    const handleUserClick = (userId) => {
        // Navigate to user profile
        if (onUserClick) {
            onUserClick(userId);
        }
    };

    const handleSendAnonymousMessage = (user) => {
        if (sentMessages.has(user.id)) {
            return;
        }

        setSentMessages((prev) => new Set([...prev, user.id]));
        if (onUserClick) {
            onUserClick(user);
        }
    };

    const handleAddFriend = async (user) => {
        if (!isAuthenticated) {
            setFriendMessage('Login required to follow.');
            return;
        }

        try {
            console.log('Attempting to follow user:', user.id);
            const result = await userAPI.followUser(user.id);
            console.log('Follow result:', result);
            setFollowingSet((prev) => new Set([...prev, user.id]));
            setSearchResults((prev) => prev.map((u) => (u.id === user.id ? { ...u, isFriend: true } : u)));
            setFriendMessage('Now following user!');
            setTimeout(() => setFriendMessage(null), 3000);
        } catch (err) {
            console.error('Error following user:', err);
            const errorMsg = err.message || 'Could not follow user';
            setFriendMessage(errorMsg.includes('Already following') ? 'Already following this user' : errorMsg);
            setTimeout(() => setFriendMessage(null), 3000);
        }
    };

    const handleRemoveFriend = async (user) => {
        if (!isAuthenticated) return;

        try {
            console.log('Attempting to unfollow user:', user.id);
            const result = await userAPI.unfollowUser(user.id);
            console.log('Unfollow result:', result);
            setFollowingSet((prev) => {
                const newSet = new Set(prev);
                newSet.delete(user.id);
                return newSet;
            });
            setSearchResults((prev) => prev.map((u) => (u.id === user.id ? { ...u, isFriend: false } : u)));
            setFriendMessage('Unfollowed user');
            setTimeout(() => setFriendMessage(null), 3000);
        } catch (err) {
            console.error('Error unfollowing user:', err);
            setFriendMessage('Could not unfollow user');
            setTimeout(() => setFriendMessage(null), 3000);
        }
    };

    const getInitials = (name) =>
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    const t = translations[language];
    const isRTL = language === 'AR';
    const resultCount = searchResults.length;

    return (
        <div className={`search-tab ${isRTL ? 'rtl' : ''}`}>
            <section className="search-hero card">
               
              

                <div className="search-input-wrapper elevated">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="search-icon"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <form className="search-form" onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={t.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            aria-label={t.searchPlaceholder}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                        {searchQuery && (
                            <button className="clear-btn" type="button" onClick={() => handleSearch('')} aria-label="Clear search">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                        <button className="submit-btn" type="submit" disabled={isSearching}>
                            {isSearching ? t.searching : 'Search'}
                        </button>
                    </form>
                </div>

           
            </section>

          

            <section className="results-surface card">
                <div className="results-top">
                    <div>
                        <p className="eyebrow subtle">{t.resultsTitle}</p>
                        <h2 className="results-title">{searchQuery ? `“${searchQuery}”` : t.startTitle}</h2>
                    </div>
                    <div className="results-count-chip">{resultCount}</div>
                </div>

                {friendMessage && (
                    <div className="action-message info">{friendMessage}</div>
                )}

                <div className="search-results">
                    {!hasSearched ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3 className="empty-title">{t.startTitle}</h3>
                            <p className="empty-description">{t.startText}</p>
                        </div>
                    ) : isSearching ? (
                        <div className="loading-state">
                            <div className="spinner-large"></div>
                            <p>{t.searching}</p>
                        </div>
                    ) : error ? (
                        <div className="empty-state">
                            <div className="empty-icon">⚠️</div>
                            <h3 className="empty-title">{t.noResultsTitle}</h3>
                            <p className="empty-description">{error}</p>
                        </div>
                    ) : resultCount === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">😕</div>
                            <h3 className="empty-title">{t.noResultsTitle}</h3>
                            <p className="empty-description">{t.noResultsText}</p>
                        </div>
                    ) : (
                        <div className="results-list">
                            {searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    className="user-card animate-slideUp"
                                    onClick={() => handleUserClick(user)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleUserClick(user);
                                        }
                                    }}
                                >
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.displayName} />
                                            ) : (
                                                <div className="avatar-placeholder">{getInitials(user.displayName)}</div>
                                            )}
                                        </div>
                                        <div className="user-details">
                                            <div className="user-row">
                                                <h3 className="user-name">{user.displayName}</h3>
                                                {user.isFriend && (
                                                    <span className="friend-badge">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                            <circle cx="9" cy="7" r="4" />
                                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                        </svg>
                                                        {t.following}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="user-username">@{user.username}</p>
                                            <p className="user-hint">{t.emptyHint}</p>
                                        </div>
                                    </div>

                                  
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default SearchTab;
