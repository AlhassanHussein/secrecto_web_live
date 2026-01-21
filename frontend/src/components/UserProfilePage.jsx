import { useEffect, useState } from 'react';
import { userAPI, messagesAPI } from '../services/api';
import './ProfilePage.css'; // Reuse profile styles

const UserProfilePage = ({ userId, isAuthenticated, currentUser, onBack, onLoginClick }) => {
    const [profile, setProfile] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('EN');
    const [messageContent, setMessageContent] = useState('');
    const [messageStatus, setMessageStatus] = useState(null);
    const [copied, setCopied] = useState(false);

    const translations = {
        EN: {
            back: '← Back',
            sendAnonymous: 'Send Anonymous Message',
            sendPlaceholder: 'Write an anonymous note...',
            sendCta: 'Send message',
            sent: 'Message sent',
            emptyError: 'Message cannot be empty',
            follow: 'Follow',
            unfollow: 'Unfollow',
            following: 'Following',
            loginToFollow: 'Login to follow',
            publicMessages: 'Public Messages',
            noMessages: 'No public messages yet',
            username: 'Username',
            name: 'Name',
            noName: 'No name provided',
            error: 'Unable to load profile',
            retry: 'Retry',
        },
        AR: {
            back: '← رجوع',
            sendAnonymous: 'إرسال رسالة مجهولة',
            sendPlaceholder: 'اكتب رسالة مجهولة...',
            sendCta: 'إرسال الرسالة',
            sent: 'تم إرسال الرسالة',
            emptyError: 'لا يمكن أن تكون الرسالة فارغة',
            follow: 'متابعة',
            unfollow: 'إلغاء المتابعة',
            following: 'يتابع',
            loginToFollow: 'سجل الدخول للمتابعة',
            publicMessages: 'الرسائل العامة',
            noMessages: 'لا توجد رسائل عامة حتى الآن',
            username: 'اسم المستخدم',
            name: 'الاسم',
            noName: 'لم يتم توفير اسم',
            error: 'تعذر تحميل الملف الشخصي',
            retry: 'إعادة محاولة',
        },
        ES: {
            back: '← Atrás',
            sendAnonymous: 'Enviar mensaje anónimo',
            sendPlaceholder: 'Escribe un mensaje anónimo...',
            sendCta: 'Enviar mensaje',
            sent: 'Mensaje enviado',
            emptyError: 'El mensaje no puede estar vacío',
            follow: 'Seguir',
            unfollow: 'Dejar de seguir',
            following: 'Siguiendo',
            loginToFollow: 'Inicia sesión para seguir',
            publicMessages: 'Mensajes públicos',
            noMessages: 'Sin mensajes públicos aún',
            username: 'Usuario',
            name: 'Nombre',
            noName: 'Sin nombre proporcionado',
            error: 'No se pudo cargar el perfil',
            retry: 'Reintentar',
        },
    };

    const t = translations[language];
    const isRTL = language === 'AR';
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';

    useEffect(() => {
        if (userId) {
            loadProfile();
        }
    }, [userId, isAuthenticated]); // Re-fetch when userId or auth state changes

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch user profile using user_id
            const data = await userAPI.getUserProfile(userId);
            setProfile(data);
            
            // Check follow status - MUST be checked before rendering button
            if (isAuthenticated) {
                try {
                    const statusData = await userAPI.checkFollowStatus(userId);
                    console.log('✅ Follow status for user', userId, ':', statusData);
                    // CRITICAL: Set the exact boolean value from backend
                    setIsFollowing(statusData.is_following === true);
                } catch (err) {
                    console.error('❌ Error checking follow status:', err);
                    // If error, default to false (not following)
                    setIsFollowing(false);
                }
            } else {
                // Guest users are never following anyone
                setIsFollowing(false);
            }
        } catch (err) {
            setError(err.message || t.error);
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!isAuthenticated) {
            onLoginClick();
            return;
        }

        try {
            if (isFollowing) {
                // User is following → UNFOLLOW
                console.log('🔄 Unfollowing user', profile.id);
                await userAPI.unfollowUser(profile.id);
                console.log('✅ Successfully unfollowed');
                setIsFollowing(false);
            } else {
                // User is NOT following → FOLLOW
                console.log('🔄 Following user', profile.id);
                await userAPI.followUser(profile.id);
                console.log('✅ Successfully followed');
                setIsFollowing(true);
            }
        } catch (err) {
            console.error('❌ Failed to update follow status:', err);
            // Re-fetch the actual state from backend to stay in sync
            try {
                const statusData = await userAPI.checkFollowStatus(profile.id);
                setIsFollowing(statusData.is_following === true);
            } catch (refetchErr) {
                console.error('❌ Failed to refetch follow status:', refetchErr);
            }
        }
    };

    const handleSendMessage = async () => {
        const trimmed = messageContent.trim();
        if (!trimmed) {
            setMessageStatus({ type: 'error', text: t.emptyError });
            return;
        }

        try {
            await messagesAPI.sendMessage(profile.username, trimmed);
            setMessageStatus({ type: 'success', text: t.sent });
            setMessageContent('');
        } catch (err) {
            setMessageStatus({ type: 'error', text: t.error });
            console.error('Failed to send message:', err);
        }
    };

    if (loading) {
        return (
            <div className={`user-profile-page ${isRTL ? 'rtl' : ''}`}>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className={`user-profile-page ${isRTL ? 'rtl' : ''}`}>
                <div className="error-state card">
                    <p className="error-icon">⚠️</p>
                    <p className="error-title">{t.error}</p>
                    <button onClick={loadProfile} className="action primary">{t.retry}</button>
                </div>

                <div className="hero-controls">
                    {profile && (
                        <div
                            className="chip subtle"
                            role="button"
                            aria-label="Copy user URL"
                            onClick={() => {
                                const canonicalUrl = `${origin}/user/${profile.username}`;
                                if (navigator?.clipboard?.writeText) {
                                    navigator.clipboard.writeText(canonicalUrl).then(() => {
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 1500);
                                    }).catch(() => {});
                                }
                            }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                                <span>Share URL:</span>
                            </span>
                            <a href={`/user/${profile.username}`} style={{ marginLeft: '0.35rem' }}>/user/{profile.username}</a>
                            {copied && <span style={{ marginLeft: '0.5rem', fontWeight: 700 }}>Copied!</span>}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`user-profile-page ${isRTL ? 'rtl' : ''}`}>
            <section className="profile-hero card">
                <div className="hero-row">
                    <div className="hero-copy">
                        <h1 className="hero-title">{profile.username}</h1>
                        {profile.name ? (
                            <p className="hero-subtitle">{profile.name}</p>
                        ) : (
                            <p className="hero-subtitle subtle">{t.noName}</p>
                        )}
                    </div>
                    <div className="user-avatar">
                        <div className="avatar-large">{profile.username[0].toUpperCase()}</div>
                    </div>
                </div>

                <div className="hero-controls">
                    {profile && (
                        <div
                            className="chip subtle clickable"
                            role="button"
                            aria-label="Copy user URL"
                            onClick={() => {
                                const canonicalUrl = `${origin}/user/${profile.username}`;
                                if (navigator?.clipboard?.writeText) {
                                    navigator.clipboard.writeText(canonicalUrl).then(() => {
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 1500);
                                    }).catch(() => {});
                                }
                            }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                                <span>Share URL:</span>
                            </span>
                            <a href={`/user/${profile.username}`} style={{ marginLeft: '0.35rem' }}>/user/{profile.username}</a>
                            <span className="copy-pill" style={{ marginLeft: '0.35rem' }}>Copy</span>
                            {copied && <span style={{ marginLeft: '0.5rem', fontWeight: 700 }}>Copied!</span>}
                        </div>
                    )}
                </div>

                <div className="message-composer card">
                    <div className="composer-header">
                        <div>
                            <p className="eyebrow subtle">{t.sendAnonymous}</p>
                            <h3 className="composer-title">{profile.username}</h3>
                        </div>
                        <span className="count-badge">✉️</span>
                    </div>
                    <textarea
                        className="composer-input"
                        placeholder={t.sendPlaceholder}
                        value={messageContent}
                        onChange={(e) => {
                            setMessageContent(e.target.value);
                            if (messageStatus) setMessageStatus(null);
                        }}
                        maxLength={500}
                    />
                    {messageStatus && (
                        <div className={`composer-status ${messageStatus.type}`}>
                            {messageStatus.text}
                        </div>
                    )}
                    <div className="composer-actions">
                        <button
                            className="action primary"
                            onClick={handleSendMessage}
                            disabled={!messageContent.trim()}
                        >
                            {t.sendCta}
                        </button>
                        {isAuthenticated ? (
                            <button
                                onClick={handleFollow}
                                className={`action ${isFollowing ? 'outline' : 'soft'}`}
                            >
                                {isFollowing ? t.following : t.follow}
                            </button>
                        ) : (
                            <button onClick={onLoginClick} className="action soft">
                                {t.loginToFollow}
                            </button>
                        )}
                    </div>
                </div>

            </section>

            <section className="profile-card card">
                <div className="card-header">
                    <h2 className="card-title">{t.publicMessages}</h2>
                    <span className="count-badge">{profile.public_messages?.length || 0}</span>
                </div>

                {!profile.public_messages || profile.public_messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💭</div>
                        <p className="empty-title">{t.noMessages}</p>
                    </div>
                ) : (
                    <div className="messages-list">
                        {profile.public_messages.map((msg) => (
                            <div key={msg.id} className="message-card public">
                                <div className="message-content">{msg.content}</div>
                                <div className="message-meta">
                                    <span className="message-date">
                                        {new Date(msg.created_at).toLocaleDateString(language === 'AR' ? 'ar-EG' : language === 'ES' ? 'es-ES' : 'en-US')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default UserProfilePage;
