import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { authAPI } from './services/api';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import LinksTab from './components/LinksTab';
import SearchTab from './components/SearchTab';
import MessagesTab from './components/MessagesTab';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import PasswordRecoveryPage from './components/PasswordRecoveryPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import UserProfilePage from './components/UserProfilePage';
import CreateLinkSection from './components/CreateLinkSection';
import ActiveLinksSection from './components/ActiveLinksSection';
import HomeTab from './components/HomeTab';
import PublicLinkPage from './components/PublicLinkPage';
import PrivateLinkPage from './components/PrivateLinkPage';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeLinks, setActiveLinks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [language, setLanguage] = useState('EN');

  // Determine active tab based on URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/links') return 'links';
    if (path === '/search') return 'search';
    if (path === '/messages') return 'messages';
    if (path === '/profile' || path.startsWith('/profile/')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTabFromPath();

  const UserProfileRouteWrapper = ({ isAuthenticated, currentUser, selectedUser }) => {
    const { username } = useParams();
    return (
      <UserProfilePage
        username={username}
        selectedUser={selectedUser}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onBack={() => navigate('/search')}
        onLoginClick={() => navigate('/login')}
      />
    );
  };

  const ProfileRouteWrapper = ({ isAuthenticated, currentUser }) => {
    const { username } = useParams();
    // If authenticated, always force the URL to your own username
    if (isAuthenticated) {
      if (!currentUser?.username) {
        return <Navigate to="/profile/guest" replace />;
      }
      if (username !== currentUser.username) {
        return <Navigate to={`/profile/${currentUser.username}`} replace />;
      }
    } else {
      // If not authenticated, any non-guest profile path should point to guest
      if (username !== 'guest') {
        return <Navigate to="/profile/guest" replace />;
      }
    }
    return (
      <ProfilePage
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => navigate('/login')}
        onSignupClick={() => navigate('/signup')}
        onSettingsClick={() => requireAuth() && navigate('/settings')}
      />
    );
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (err) {
        // Not authenticated
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleCreateLink = (newLink) => {
    setActiveLinks([newLink, ...activeLinks]);
  };

  const handleDeleteLink = (linkId) => {
    setActiveLinks(activeLinks.filter((link) => link.id !== linkId));
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    authAPI.getCurrentUser().then(user => setCurrentUser(user)).catch(() => {});
    navigate('/home');
  };

  const handleSignupSuccess = () => {
    setIsAuthenticated(true);
    authAPI.getCurrentUser().then(user => setCurrentUser(user)).catch(() => {});
    navigate('/home');
  };

  const handleRecoverySuccess = () => {
    setIsAuthenticated(true);
    authAPI.getCurrentUser().then(user => setCurrentUser(user)).catch(() => {});
    navigate('/home');
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/login');
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    authAPI.getCurrentUser().then(user => setCurrentUser(user)).catch(() => {});
  };

  // Auth guard
  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleTabChange = (tab) => {
    const pathMap = {
      home: '/home',
      links: '/links',
      search: '/search',
      messages: '/messages',
      profile: isAuthenticated && currentUser?.username ? `/profile/${currentUser.username}` : '/profile/guest',
    };
    navigate(pathMap[tab] || '/home');
  };

  // Only show BottomNav and Header when not on auth pages
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/signup' || 
                     location.pathname === '/recover';
  const isLinkPage = location.pathname.startsWith('/link/');

  return (
    <div className="app">
      {!isAuthPage && !isLinkPage && (
        <Header isAuthenticated={isAuthenticated} currentUser={currentUser} />
      )}

      <main className="main-content">
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onForgotPassword={() => navigate('/recover')}
              />
            }
          />
          <Route
            path="/signup"
            element={<SignupPage onSignupSuccess={handleSignupSuccess} />}
          />
          <Route
            path="/recover"
            element={
              <PasswordRecoveryPage
                onRecoverySuccess={handleRecoverySuccess}
                onBackToLogin={() => navigate('/login')}
              />
            }
          />

          {/* Link Pages */}
          <Route
            path="/link/public/:publicId"
            element={
              <div>
                <PublicLinkPage
                  publicId={location.pathname.split('/link/public/')[1]}
                  language={language}
                />
                <div className="link-page-close">
                  <button onClick={() => navigate('/home')} className="btn secondary">
                    ← Back
                  </button>
                </div>
              </div>
            }
          />
          <Route
            path="/link/private/:privateId"
            element={
              <div>
                <PrivateLinkPage
                  privateId={location.pathname.split('/link/private/')[1]}
                  language={language}
                />
                <div className="link-page-close">
                  <button onClick={() => navigate('/home')} className="btn secondary">
                    ← Back
                  </button>
                </div>
              </div>
            }
          />

          {/* Main App Routes */}
          <Route
            path="/home"
            element={
              <>
                <HomeTab language={language} onLinkCreated={handleCreateLink} />
                <CreateLinkSection onCreateLink={handleCreateLink} />
                <ActiveLinksSection links={activeLinks} onDeleteLink={handleDeleteLink} />
              </>
            }
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
          <Route path="/links" element={<LinksTab links={activeLinks} />} />
          <Route
            path="/search"
            element={
              <SearchTab
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onUserClick={(user) => {
                  setSelectedUser(user);
                  navigate(`/user/${user.username}`);
                }}
              />
            }
          />
          <Route
            path="/user/:username"
            element={<UserProfileRouteWrapper
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              selectedUser={selectedUser}
            />}
          />
          <Route
            path="/messages"
            element={<MessagesTab onMessageClick={() => requireAuth()} />}
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                currentUser={currentUser}
                onLogout={handleLogout}
                onLanguageChange={handleLanguageChange}
              />
            }
          />
          <Route
            path="/profile"
            element={<Navigate to={isAuthenticated && currentUser?.username ? `/profile/${currentUser.username}` : '/profile/guest'} replace />}
          />
          <Route
            path="/profile/:username"
            element={<ProfileRouteWrapper isAuthenticated={isAuthenticated} currentUser={currentUser} />}
          />
        </Routes>
      </main>

      {!isAuthPage && !isLinkPage && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}

export default App;
