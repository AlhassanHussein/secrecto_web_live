import { useMemo, useState, useEffect } from 'react';
import './MessagesTab.css';
import { messagesAPI } from '../services/api';
import { translations } from '../i18n/translations';

const MessagesTab = ({ isAuthenticated, onLoginClick, onSignupClick, language = 'EN' }) => {
    const [activeTab, setActiveTab] = useState('inbox');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [operatingIds, setOperatingIds] = useState(new Set());

    const t = translations[language] || translations.EN;
    const isRTL = language === 'AR';

    // Load messages on mount - ONLY if authenticated
    useEffect(() => {
        const fetchMessages = async () => {
            // CRITICAL: Never call protected endpoints as guest
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Fetch grouped inbox data
                const inboxData = await messagesAPI.getInbox();
                
                // Flatten and add status to each message
                const allMessages = [];
                if (inboxData.inbox) {
                    allMessages.push(...inboxData.inbox.map(msg => ({ ...msg, status: 'inbox' })));
                }
                if (inboxData.public) {
                    allMessages.push(...inboxData.public.map(msg => ({ ...msg, status: 'public' })));
                }
                if (inboxData.deleted) {
                    allMessages.push(...inboxData.deleted.map(msg => ({ ...msg, status: 'deleted' })));
                }
                
                setMessages(allMessages);
            } catch (error) {
                console.error('Failed to load messages:', error);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [isAuthenticated]); // Re-fetch when auth state changes

    const counts = useMemo(() => {
        return messages.reduce(
            (acc, msg) => {
                acc[msg.status] = (acc[msg.status] || 0) + 1;
                return acc;
            },
            { inbox: 0, public: 0, deleted: 0 }
        );
    }, [messages]);

    const filteredMessages = useMemo(() => {
        return messages.filter((msg) => msg.status === activeTab);
    }, [messages, activeTab]);

    // Optimistic update for state changes
    const updateMessageStatus = async (id, newStatus) => {
        // Add to operating set
        setOperatingIds(prev => new Set([...prev, id]));

        // Optimistic update
        const oldMessages = messages;
        setMessages(prev => prev.map(msg => 
            msg.id === id ? { ...msg, status: newStatus } : msg
        ));

        try {
            if (newStatus === 'public') {
                await messagesAPI.makeMessagePublic(id);
            } else if (newStatus === 'inbox') {
                await messagesAPI.makeMessagePrivate(id);
            } else if (newStatus === 'deleted') {
                await messagesAPI.deleteMessage(id);
            }
        } catch (error) {
            console.error('Failed to update message:', error);
            // Rollback on error
            setMessages(oldMessages);
        } finally {
            setOperatingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleDelete = (id) => {
        updateMessageStatus(id, 'deleted');
    };

    const handleMakePublic = (id) => {
        updateMessageStatus(id, 'public');
    };

    const handleMakePrivate = (id) => {
        updateMessageStatus(id, 'inbox');
    };

    // GUEST MODE: Show locked UI instead of calling protected endpoints
    if (!isAuthenticated) {
        return (
            <div className={`messages-tab ${isRTL ? 'rtl' : ''}`} style={{ padding: '1rem', maxWidth: '520px', margin: '0 auto' }}>
                <section className="empty-state-card">
                    <div className="empty-state-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h2 className="empty-state-title">{t.messages.lockedTitle}</h2>
                    <p className="empty-state-subtitle">
                        {t.messages.lockedSubtitle}
                    </p>
                    <div className="empty-state-actions">
                        <button
                            className="btn btn-primary"
                            onClick={onLoginClick}
                        >
                            {t.buttons.login}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={onSignupClick}
                        >
                            {t.buttons.signup}
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className={`messages-tab ${isRTL ? 'rtl' : ''}`}>
            <section className="messages-hero card">
                <div className="hero-row">
                    <div className="hero-copy">
                        <span className="eyebrow">{t.nav.messages}</span>
                        <h1 className="hero-title">{t.messages.title}</h1>
                        <p className="hero-subtitle">{t.messages.subtitle}</p>
                    </div>
                </div>

              

            </section>

            <section className="page-tabs">
                {['inbox', 'public', 'deleted'].map((tab) => (
                    <button
                        key={tab}
                        className={`page-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        <span>{t.messages.tabs?.[tab] || tab}</span>
                        <span className="count-badge">{counts[tab] || 0}</span>
                    </button>
                ))}
            </section>

            <section className="messages-list card">
                <div className="list-header">
                    <div>
                        <p className="eyebrow subtle">{t.messages.tabs?.[activeTab] || activeTab}</p>
                        <h2 className="list-title">{filteredMessages.length} {filteredMessages.length === 1 ? t.messages.messageSingular : t.messages.messagePlural}</h2>
                    </div>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <div className="empty-icon">⏳</div>
                        <h3 className="empty-title">{t.common.loading}</h3>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3 className="empty-title">{t.messages.noMessages}</h3>
                        <p className="empty-description">{t.messages.noMessagesText}</p>
                    </div>
                ) : (
                    <div className="message-stack">
                        {filteredMessages.map((msg) => (
                            <article key={msg.id} className="message-card animate-slideUp">
                                <div className="message-top">
                                    <div className="chip primary">{t.messages.anonymous}</div>
                                    <span className="timestamp">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : t.common.loading}</span>
                                </div>

                                <p className="message-body">{msg.content}</p>

                                <div className="message-actions">
                                    <button 
                                        className="action ghost" 
                                        onClick={() => handleDelete(msg.id)}
                                        disabled={operatingIds.has(msg.id)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                            <path d="M10 11v6" />
                                            <path d="M14 11v6" />
                                            <path d="M9 6l1-3h4l1 3" />
                                        </svg>
                                        {t.common.delete}
                                    </button>

                                    {activeTab === 'inbox' && (
                                        <button 
                                            className="action primary" 
                                            onClick={() => handleMakePublic(msg.id)}
                                            disabled={operatingIds.has(msg.id)}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="1" />
                                                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0" />
                                                <path d="M12 7v8" />
                                                <path d="M9 12h6" />
                                            </svg>
                                            {t.buttons.publish}
                                        </button>
                                    )}

                                    {activeTab === 'public' && (
                                        <button 
                                            className="action outline" 
                                            onClick={() => handleMakePrivate(msg.id)}
                                            disabled={operatingIds.has(msg.id)}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            {t.buttons.hide}
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
