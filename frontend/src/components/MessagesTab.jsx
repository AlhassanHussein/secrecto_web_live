import { useMemo, useState } from 'react';
import './MessagesTab.css';

const translations = {
    EN: {
        eyebrow: 'Inbox',
        title: 'Anonymous messages',
        subtitle: 'Read, favorite, or move messages between normal, public, and private.',
        tabs: { normal: 'Normal', public: 'Public', private: 'Private' },
        filters: { all: 'All', favorites: 'Favorites' },
        helperNormal: 'Default inbox for incoming anonymous notes.',
        helperPublic: 'Public messages visible on your public board.',
        helperPrivate: 'Private space only you can see.',
        emptyTitle: 'No messages yet',
        emptyText: 'New anonymous notes will appear here. Try switching tabs.',
        anonymous: 'Anonymous',
        timestampLabel: 'Now',
        delete: 'Delete',
        movePublic: 'Move to Public',
        movePrivate: 'Move to Private',
        moveNormal: 'Move to Normal',
        favorite: 'Favorite',
        unfavorite: 'Unfavorite',
        pillNew: 'New',
        pillPinned: 'Pinned',
        chipQuota: 'Soft blues, smooth scroll, touch-friendly.',
    },
    AR: {
        eyebrow: 'الوارد',
        title: 'رسائل مجهولة',
        subtitle: 'اقرأ الرسائل، ضعها كمفضلة، أو انقلها بين العادي والعام والخاص.',
        tabs: { normal: 'عادي', public: 'عام', private: 'خاص' },
        filters: { all: 'الكل', favorites: 'المفضلة' },
        helperNormal: 'صندوق الوارد الافتراضي للرسائل المجهولة.',
        helperPublic: 'رسائل عامة مرئية في لوحتك العامة.',
        helperPrivate: 'مساحة خاصة لا يراها أحد سواك.',
        emptyTitle: 'لا توجد رسائل',
        emptyText: 'ستظهر الملاحظات المجهولة هنا. جرّب تغيير التبويب.',
        anonymous: 'مجهول',
        timestampLabel: 'الآن',
        delete: 'حذف',
        movePublic: 'انقل إلى العام',
        movePrivate: 'انقل إلى الخاص',
        moveNormal: 'انقل إلى العادي',
        favorite: 'مفضلة',
        unfavorite: 'إزالة المفضلة',
        pillNew: 'جديد',
        pillPinned: 'مثبت',
        chipQuota: 'ألوان هادئة، تمرير سلس، ملائم للمس.',
    },
    ES: {
        eyebrow: 'Bandeja',
        title: 'Mensajes anónimos',
        subtitle: 'Lee, marca como favorito o mueve mensajes entre normal, público y privado.',
        tabs: { normal: 'Normal', public: 'Público', private: 'Privado' },
        filters: { all: 'Todos', favorites: 'Favoritos' },
        helperNormal: 'Bandeja principal para notas anónimas.',
        helperPublic: 'Mensajes públicos visibles en tu tablero.',
        helperPrivate: 'Espacio privado solo para ti.',
        emptyTitle: 'Aún no hay mensajes',
        emptyText: 'Las notas anónimas aparecerán aquí. Prueba otro tab.',
        anonymous: 'Anónimo',
        timestampLabel: 'Ahora',
        delete: 'Eliminar',
        movePublic: 'Mover a Público',
        movePrivate: 'Mover a Privado',
        moveNormal: 'Mover a Normal',
        favorite: 'Favorito',
        unfavorite: 'Quitar favorito',
        pillNew: 'Nuevo',
        pillPinned: 'Fijado',
        chipQuota: 'Azules suaves, scroll fluido, listo para táctil.',
    },
};

const initialMessages = [
    {
        id: 1,
        content: 'You did great today. Keep going! 🚀',
        type: 'normal',
        isFavorite: false,
        isNew: true,
        timestamp: '2m ago',
    },
    {
        id: 2,
        content: 'Can you share your latest link? Curious to try.',
        type: 'normal',
        isFavorite: true,
        isNew: false,
        timestamp: '15m ago',
    },
    {
        id: 3,
        content: 'Love the redesign of your profile—clean and bright.',
        type: 'public',
        isFavorite: false,
        isNew: true,
        timestamp: '1h ago',
    },
    {
        id: 4,
        content: 'Reminder: Be kind to yourself today.',
        type: 'private',
        isFavorite: false,
        isNew: false,
        timestamp: '2h ago',
    },
    {
        id: 5,
        content: 'Your countdown links helped me a lot, thanks!',
        type: 'normal',
        isFavorite: false,
        isNew: false,
        timestamp: 'Yesterday',
    },
];

const MessagesTab = () => {
    const [language, setLanguage] = useState('EN');
    const [activeTab, setActiveTab] = useState('normal');
    const [normalFilter, setNormalFilter] = useState('all');
    const [messages, setMessages] = useState(initialMessages);
    const username = 'Guest';

    const t = translations[language];
    const isRTL = language === 'AR';

    const counts = useMemo(() => {
        return messages.reduce(
            (acc, msg) => {
                acc[msg.type] += 1;
                return acc;
            },
            { normal: 0, public: 0, private: 0 }
        );
    }, [messages]);

    const filteredMessages = useMemo(() => {
        let list = messages.filter((msg) => msg.type === activeTab);
        if (activeTab === 'normal' && normalFilter === 'favorites') {
            list = list.filter((msg) => msg.isFavorite);
        }
        return list;
    }, [messages, activeTab, normalFilter]);

    const handleDelete = (id) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    const handleMove = (id, target) => {
        setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, type: target, isNew: false } : msg)));
    };

    const handleFavorite = (id) => {
        setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, isFavorite: !msg.isFavorite } : msg)));
    };

    return (
        <div className={`messages-tab ${isRTL ? 'rtl' : ''}`}>
            <section className="messages-hero card">
                <div className="hero-row">
                    <div className="hero-copy">
                        <span className="eyebrow">{t.eyebrow}</span>
                        <h1 className="hero-title">{t.title}</h1>
                        <p className="hero-subtitle">{t.subtitle}</p>
                        <div className="chip subtle">{t.chipQuota}</div>
                    </div>
                    <div className="hero-user">
                        <div className="user-chip">
                            <span className="user-dot"></span>
                            {username}
                        </div>
                        <button className="profile-icon-btn" aria-label="Profile">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                            </svg>
                        </button>
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
                    <div className="pill-row">
                        <span className="pill ghost">{t.helperNormal}</span>
                        <span className="pill ghost">{t.helperPublic}</span>
                        <span className="pill ghost">{t.helperPrivate}</span>
                    </div>
                </div>

                <div className="stat-row">
                    <div className="stat-card">
                        <p className="stat-label">{t.tabs.normal}</p>
                        <p className="stat-value">{counts.normal}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">{t.tabs.public}</p>
                        <p className="stat-value">{counts.public}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">{t.tabs.private}</p>
                        <p className="stat-value">{counts.private}</p>
                    </div>
                </div>
            </section>

            <section className="page-tabs">
                {(['normal', 'public', 'private']).map((tab) => (
                    <button
                        key={tab}
                        className={`page-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        <span>{t.tabs[tab]}</span>
                        <span className="count-badge">{counts[tab]}</span>
                    </button>
                ))}
            </section>

            {activeTab === 'normal' && (
                <div className="subfilters">
                    <button
                        className={`subfilter ${normalFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setNormalFilter('all')}
                    >
                        {t.filters.all}
                    </button>
                    <button
                        className={`subfilter ${normalFilter === 'favorites' ? 'active' : ''}`}
                        onClick={() => setNormalFilter('favorites')}
                    >
                        {t.filters.favorites}
                    </button>
                </div>
            )}

            <section className="messages-list card">
                <div className="list-header">
                    <div>
                        <p className="eyebrow subtle">{t.tabs[activeTab]}</p>
                        <h2 className="list-title">{filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}</h2>
                    </div>
                </div>

                {filteredMessages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3 className="empty-title">{t.emptyTitle}</h3>
                        <p className="empty-description">{t.emptyText}</p>
                    </div>
                ) : (
                    <div className="message-stack">
                        {filteredMessages.map((msg) => (
                            <article key={msg.id} className="message-card animate-slideUp">
                                <div className="message-top">
                                    <div className="chip primary">{t.anonymous}</div>
                                    <div className="pill-group">
                                        {msg.isNew && <span className="pill solid">{t.pillNew}</span>}
                                        {msg.isFavorite && <span className="pill soft">★</span>}
                                    </div>
                                    <span className="timestamp">{msg.timestamp || t.timestampLabel}</span>
                                </div>

                                <p className="message-body">{msg.content}</p>

                                <div className="message-actions">
                                    <button className="action ghost" onClick={() => handleDelete(msg.id)}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                            <path d="M10 11v6" />
                                            <path d="M14 11v6" />
                                            <path d="M9 6l1-3h4l1 3" />
                                        </svg>
                                        {t.delete}
                                    </button>

                                    {msg.type === 'normal' && (
                                        <button className="action outline" onClick={() => handleFavorite(msg.id)}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
                                            </svg>
                                            {msg.isFavorite ? t.unfavorite : t.favorite}
                                        </button>
                                    )}

                                    {msg.type === 'normal' && (
                                        <button className="action primary" onClick={() => handleMove(msg.id, 'public')}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-8a4 4 0 0 0-4-4H5" />
                                                <polyline points="9 17 5 13 1 17" />
                                                <path d="M21 3H5a2 2 0 0 0-2 2v10" />
                                            </svg>
                                            {t.movePublic}
                                        </button>
                                    )}

                                    {msg.type === 'normal' && (
                                        <button className="action soft" onClick={() => handleMove(msg.id, 'private')}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            {t.movePrivate}
                                        </button>
                                    )}

                                    {msg.type === 'public' && (
                                        <button className="action outline" onClick={() => handleMove(msg.id, 'normal')}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 14v-3a4 4 0 0 1 4-4h12" />
                                                <polyline points="14 10 18 14 22 10" />
                                                <path d="M2 20h16a2 2 0 0 0 2-2v-4" />
                                            </svg>
                                            {t.moveNormal}
                                        </button>
                                    )}

                                    {msg.type === 'private' && (
                                        <button className="action outline" onClick={() => handleMove(msg.id, 'normal')}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 14v-3a4 4 0 0 1 4-4h12" />
                                                <polyline points="14 10 18 14 22 10" />
                                                <path d="M2 20h16a2 2 0 0 0 2-2v-4" />
                                            </svg>
                                            {t.moveNormal}
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default MessagesTab;
