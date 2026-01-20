import { useMemo, useState } from 'react';
import './ProfilePage.css';

const translations = {
    EN: {
        eyebrow: 'Profile',
        title: 'Your anonymous hub',
        subtitle: 'Manage your identity, links, and friendships in one place.',
        stats: { links: 'Links', friends: 'Friends', messages: 'Messages' },
        linksTitle: 'Temporary links',
        linksEmpty: 'No links yet. Create one from Home.',
        friendsTitle: 'Friends list',
        friendsEmpty: 'No friends yet. Add some from Search.',
        actions: { logout: 'Logout', edit: 'Edit profile', viewLinks: 'View links', viewMessages: 'Messages', login: 'Login', signup: 'Signup', settings: 'Settings' },
        badges: { active: 'Active', expiring: 'Expiring soon' },
        guestTitle: 'Guest Mode',
        guestSubtitle: 'Login or signup to save your data and access more features.',
    },
    AR: {
        eyebrow: 'الملف الشخصي',
        title: 'مركزك المجهول',
        subtitle: 'إدارة هويتك وروابطك وأصدقائك في مكان واحد.',
        stats: { links: 'الروابط', friends: 'الأصدقاء', messages: 'الرسائل' },
        linksTitle: 'الروابط المؤقتة',
        linksEmpty: 'لا توجد روابط بعد. أنشئ رابطًا من الصفحة الرئيسية.',
        friendsTitle: 'قائمة الأصدقاء',
        friendsEmpty: 'لا يوجد أصدقاء بعد. أضف بعضهم من البحث.',
        actions: { logout: 'تسجيل الخروج', edit: 'تعديل الملف', viewLinks: 'عرض الروابط', viewMessages: 'الرسائل', login: 'تسجيل الدخول', signup: 'إنشاء حساب', settings: 'الإعدادات' },
        badges: { active: 'نشط', expiring: 'سينتهي قريبًا' },
        guestTitle: 'وضع الضيف',
        guestSubtitle: 'سجل دخولك أو أنشئ حسابًا لحفظ بياناتك.',
    },
    ES: {
        eyebrow: 'Perfil',
        title: 'Tu centro anónimo',
        subtitle: 'Gestiona identidad, enlaces y amistades en un solo lugar.',
        stats: { links: 'Enlaces', friends: 'Amigos', messages: 'Mensajes' },
        linksTitle: 'Enlaces temporales',
        linksEmpty: 'Sin enlaces aún. Crea uno desde Inicio.',
        friendsTitle: 'Lista de amigos',
        friendsEmpty: 'Sin amigos aún. Añade desde Búsqueda.',
        actions: { logout: 'Cerrar sesión', edit: 'Editar perfil', viewLinks: 'Ver enlaces', viewMessages: 'Mensajes', login: 'Ingresar', signup: 'Registrarse', settings: 'Configuración' },
        badges: { active: 'Activo', expiring: 'Próximo a expirar' },
        guestTitle: 'Modo Invitado',
        guestSubtitle: 'Inicia sesión o regístrate para guardar tus datos.',
    },
};

const ProfilePage = ({ isAuthenticated, currentUser, onLogout, onLoginClick, onSignupClick, onSettingsClick }) => {
    const [language, setLanguage] = useState('EN');
    const username = isAuthenticated ? currentUser?.username || 'User' : 'Guest';

    const mockLinks = [
        { id: 1, label: 'Confession board', status: 'active', timeLeft: '2h 14m' },
        { id: 2, label: 'Feedback form', status: 'expiring', timeLeft: '28m' },
    ];

    const mockFriends = [
        { id: 1, name: 'alex_johnson' },
        { id: 2, name: 'maria_garcia' },
        { id: 3, name: 'sarah_smith' },
    ];

    const t = translations[language];
    const isRTL = language === 'AR';

    const stats = useMemo(() => ({
        links: mockLinks.length,
        friends: mockFriends.length,
        messages: 12,
    }), [mockLinks.length, mockFriends.length]);

    return (
        <div className={`profile-page ${isRTL ? 'rtl' : ''}`}>
            <section className="profile-hero card">
                <div className="hero-row">
                    <div className="hero-copy">
                        <span className="eyebrow">{t.eyebrow}</span>
                        <h1 className="hero-title">{t.title}</h1>
                        <p className="hero-subtitle">{t.subtitle}</p>
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
                    <div className="chip subtle">Soft blues, touch-friendly, animated.</div>
                </div>

                <div className="stat-row">
                    <div className="stat-card">
                        <p className="stat-label">{t.stats.links}</p>
                        <p className="stat-value">{stats.links}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">{t.stats.friends}</p>
                        <p className="stat-value">{stats.friends}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">{t.stats.messages}</p>
                        <p className="stat-value">{stats.messages}</p>
                    </div>
                </div>

                <div className="action-row">
                    {isAuthenticated ? (
                        <>
                            <button className="action primary" onClick={onSettingsClick}>
                                {t.actions.settings}
                            </button>
                            <button className="action outline danger" onClick={onLogout}>
                                {t.actions.logout}
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="action primary" onClick={onLoginClick}>
                                {t.actions.login}
                            </button>
                            <button className="action soft" onClick={onSignupClick}>
                                {t.actions.signup}
                            </button>
                        </>
                    )}
                </div>
            </section>

            <section className="profile-card card">
                <div className="card-header">
                    <div>
                        <p className="eyebrow subtle">{t.linksTitle}</p>
                        <h2 className="card-title">{t.stats.links}</h2>
                    </div>
                    <span className="count-badge">{mockLinks.length}</span>
                </div>
                {mockLinks.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔗</div>
                        <p className="empty-title">{t.linksEmpty}</p>
                    </div>
                ) : (
                    <div className="list">
                        {mockLinks.map((link) => (
                            <div key={link.id} className="list-item">
                                <div>
                                    <p className="item-title">{link.label}</p>
                                    <p className="item-sub">{link.timeLeft}</p>
                                </div>
                                <span className={`pill ${link.status === 'active' ? 'solid' : 'soft'}`}>
                                    {link.status === 'active' ? t.badges.active : t.badges.expiring}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="profile-card card">
                <div className="card-header">
                    <div>
                        <p className="eyebrow subtle">{t.friendsTitle}</p>
                        <h2 className="card-title">{t.stats.friends}</h2>
                    </div>
                    <span className="count-badge">{mockFriends.length}</span>
                </div>
                {mockFriends.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <p className="empty-title">{t.friendsEmpty}</p>
                    </div>
                ) : (
                    <div className="chips-grid">
                        {mockFriends.map((friend) => (
                            <span key={friend.id} className="friend-chip">
                                <span className="avatar-dot"></span>
                                {friend.name}
                            </span>
                        ))}
                    </div>
                )}
            </section>

            {/* Guest Mode: Show login/signup buttons */}
            {/* Guest Mode info */}
            {!isAuthenticated && (
                <section className="profile-card card">
                    <div className="card-header">
                        <div>
                            <p className="eyebrow subtle">{t.guestTitle}</p>
                            <h2 className="card-title">{t.guestSubtitle}</h2>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProfilePage;
