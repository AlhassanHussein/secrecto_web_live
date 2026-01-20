import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import './ProfilePage.css'; // Reuse profile styles

const UserProfilePage = ({ userId, isAuthenticated, currentUser, onBack, onLoginClick }) => {
    const [profile, setProfile] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('EN');

    const translations = {
        EN: {
            back: '← Back',
            sendAnonymous: 'Send Anonymous Message',
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

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userAPI.getUserProfile(userId);
            setProfile(data);
            setIsFollowing(data.is_following || false);
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
                await userAPI.unfollowUser(userId);
                setIsFollowing(false);
            } else {
                await userAPI.followUser(userId);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error('Failed to update follow status:', err);
        }
    };

    const handleSendMessage = async () => {
        const content = prompt(t.sendAnonymous + ':');
        if (!content) return;

        try {
            await userAPI.sendAnonymousMessage(userId, content);
            alert('✓ ' + t.sendAnonymous);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    if (loading) {
        return (
            <div className={`user-profile-page ${isRTL ? 'rtl' : ''}`}>
                <button onClick={onBack} className="back-button">{t.back}</button>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className={`user-profile-page ${isRTL ? 'rtl' : ''}`}>
                <button onClick={onBack} className="back-button">{t.back}</button>
                <div className="error-state card">
                    <p className="error-icon">⚠️</p>
                    <p className="error-title">{t.error}</p>
                    <button onClick={loadProfile} className="action primary">{t.retry}</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`user-profile-page ${isRTL ? 'rtl' : ''}`}>
            <button onClick={onBack} className="back-button">{t.back}</button>

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

                <div className="action-row">
                    <button onClick={handleSendMessage} className="action primary">
                        {t.sendAnonymous}
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
