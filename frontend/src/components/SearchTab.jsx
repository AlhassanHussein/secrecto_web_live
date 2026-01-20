import { useMemo, useState } from 'react';
import './SearchTab.css';

const translations = {
    EN: {
        eyebrow: 'Search',
        title: 'Find people. Send the truth.',
        subtitle: 'Search by username or name, or send one-time anonymous messages.',
        searchPlaceholder: 'Search by username or name...',
        startTitle: 'Start Searching',
        startText: 'Type a username or name to see matching users.',
        searching: 'Searching...',
        noResultsTitle: 'No matches found',
        noResultsText: 'Try a different name or check spelling.',
        resultsTitle: 'Live matches',
        sendAnonymous: 'Send Anonymous Message',
        sent: 'Message Sent',
        quotaLabel: '1 message / session per user',
        sessionRule: 'One-time anonymous message limit enforced per session.',
        emptyHint: 'Safe, private, and touch-friendly.',
        chipRecent: 'Recent',
        chipPopular: 'Popular now',
    },
    AR: {
        eyebrow: 'بحث',
        title: 'ابحث عن الأصدقاء وأرسل الحقيقة',
        subtitle: 'ابحث بالاسم أو اسم المستخدم أو أرسل رسالة مجهولة لمرة واحدة.',
        searchPlaceholder: 'ابحث بالاسم أو اسم المستخدم...',
        startTitle: 'ابدأ البحث',
        startText: 'اكتب اسم المستخدم أو الاسم لرؤية النتائج.',
        searching: 'جارٍ البحث...',
        noResultsTitle: 'لا توجد نتائج',
        noResultsText: 'جرّب اسمًا مختلفًا أو تحقق من الإملاء.',
        resultsTitle: 'النتائج المباشرة',
        sendAnonymous: 'إرسال رسالة مجهولة',
        sent: 'تم الإرسال',
        quotaLabel: 'رسالة واحدة لكل جلسة لكل مستخدم',
        sessionRule: 'يتم تطبيق حد رسالة مجهولة واحدة لكل جلسة.',
        emptyHint: 'آمن، خاص، وملائم للمس.',
        chipRecent: 'الأحدث',
        chipPopular: 'شائع الآن',
    },
    ES: {
        eyebrow: 'Buscar',
        title: 'Encuentra personas. Envía la verdad.',
        subtitle: 'Busca por nombre o usuario o envía un mensaje anónimo único.',
        searchPlaceholder: 'Busca por usuario o nombre...',
        startTitle: 'Comienza a buscar',
        startText: 'Escribe un usuario o nombre para ver coincidencias.',
        searching: 'Buscando...',
        noResultsTitle: 'Sin resultados',
        noResultsText: 'Prueba con otro nombre o revisa la ortografía.',
        resultsTitle: 'Coincidencias en vivo',
        sendAnonymous: 'Enviar mensaje anónimo',
        sent: 'Mensaje enviado',
        quotaLabel: '1 mensaje / sesión por usuario',
        sessionRule: 'Límite de un mensaje anónimo por sesión.',
        emptyHint: 'Seguro, privado y táctil.',
        chipRecent: 'Reciente',
        chipPopular: 'Popular ahora',
    },
};

const mockUsers = [
    { id: 1, username: 'john_doe', displayName: 'John Doe', avatar: null },
    { id: 2, username: 'sarah_smith', displayName: 'Sarah Smith', avatar: null },
    { id: 3, username: 'alex_johnson', displayName: 'Alex Johnson', avatar: null },
    { id: 4, username: 'maria_garcia', displayName: 'Maria Garcia', avatar: null },
    { id: 5, username: 'david_lee', displayName: 'David Lee', avatar: null },
];

const SearchTab = ({ isAuthenticated, onUserClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [sentMessages, setSentMessages] = useState(new Set());
    const [language, setLanguage] = useState('EN');

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return mockUsers.filter(
            (user) =>
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const handleSearch = (value) => {
        setSearchQuery(value);
        if (value.trim()) {
            setIsSearching(true);
            setTimeout(() => setIsSearching(false), 320);
        }
    };

    const handleUserClick = (userId) => {
        if (onUserClick) {
            onUserClick(userId);
        }
    };

    const handleSendAnonymousMessage = (userId, e) => {
        if (e) {
            e.stopPropagation();
        }

        if (sentMessages.has(userId)) {
            alert('You can only send one anonymous message per session to this user');
            return;
        }

        setSentMessages((prev) => new Set([...prev, userId]));
        console.log('Sending anonymous message to:', userId);
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

    return (
        <div className={`search-tab ${isRTL ? 'rtl' : ''}`}>
            <section className="search-hero card">
                <div className="hero-copy">
                    <span className="eyebrow">{t.eyebrow}</span>
                    <h1 className="hero-title">{t.title}</h1>
                    <p className="hero-subtitle">{t.subtitle}</p>
                    <div className="quota-chip">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {t.quotaLabel}
                    </div>
                </div>

                <div className="hero-controls">
                    <div className="language-toggle" aria-label="Language selector">
                        {Object.keys(translations).map((lang) => (
                            <button
                                key={lang}
                                className={`lang-pill ${language === lang ? 'active' : ''}`}
                                onClick={() => setLanguage(lang)}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

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
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        aria-label={t.searchPlaceholder}
                    />
                </div>

                <div className="search-helper-row">
                    <span className="helper-pill primary">{t.chipRecent}</span>
                    <span className="helper-pill soft">{t.chipPopular}</span>
                    <span className="helper-pill ghost">{t.emptyHint}</span>
                </div>
            </section>

            <section className="results-surface card">
                <div className="results-top">
                    <div>
                        <p className="eyebrow subtle">{t.resultsTitle}</p>
                        <h2 className="results-title">{searchQuery ? `"${searchQuery}"` : t.startTitle}</h2>
                    </div>
                    <div className="results-count-chip">{filteredUsers.length}</div>
                </div>

                <div className="search-results">
                    {!searchQuery.trim() ? (
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
                    ) : filteredUsers.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">😕</div>
                            <h3 className="empty-title">{t.noResultsTitle}</h3>
                            <p className="empty-description">{t.noResultsText}</p>
                        </div>
                    ) : (
                        <div className="results-list">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="user-card animate-slideUp"
                                    onClick={() => handleUserClick(user.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUserClick(user.id)}
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
                                            <h3 className="user-name">{user.displayName}</h3>
                                            <p className="user-username">@{user.username}</p>
                                        </div>
                                    </div>

                                    <div className="user-actions">
                                        <button
                                            className={`action-btn anonymous-msg-btn ${sentMessages.has(user.id) ? 'sent' : ''}`}
                                            onClick={(e) => handleSendAnonymousMessage(user.id, e)}
                                            disabled={sentMessages.has(user.id)}
                                        >
                                            {sentMessages.has(user.id) ? (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    {t.sent}
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                    {t.sendAnonymous}
                                                </>
                                            )}
                                        </button>
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
