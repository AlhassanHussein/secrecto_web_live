import { useState, useEffect } from 'react';
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
import CreateLinkSection from './components/CreateLinkSection';
import ActiveLinksSection from './components/ActiveLinksSection';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeLinks, setActiveLinks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthPage, setShowAuthPage] = useState(null); // 'login', 'signup', 'recovery', 'settings'

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
    setShowAuthPage(null);
    setIsAuthenticated(true);
    setActiveTab('home');
    // Reload user info
    authAPI.getCurrentUser().then(user => setCurrentUser(user)).catch(() => {});
  };

  const handleSignupSuccess = () => {
    setShowAuthPage(null);
    setIsAuthenticated(true);
    setActiveTab('home');
    // Reload user info
    authAPI.getCurrentUser().then(user => setCurrentUser(user)).catch(() => {});
  };

  const handleRecoverySuccess = () => {
    setShowAuthPage(null);
    setIsAuthenticated(true);
    setActiveTab('home');
    // Reload user info
    authAPI.getCurrentUser().then(user => setCurrentUser(user)).catch(() => {});
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('home');
    setShowAuthPage('login'); // Redirect to login after logout
  };

  const handleLanguageChange = (newLang) => {
    // Reload user info after language change
    authAPI.getCurrentUser().then(user => setCurrentUser(user)).catch(() => {});
  };

  // Auth guard: redirect to login/signup if trying to access protected features
  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      setShowAuthPage('login');
      return false;
    }
    callback();
    return true;
  };

  // Render auth pages
  if (showAuthPage === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={() => setShowAuthPage('recovery')}
      />
    );
  }
  if (showAuthPage === 'signup') {
    return <SignupPage onSignupSuccess={handleSignupSuccess} />;
  }
  if (showAuthPage === 'recovery') {
    return (
      <PasswordRecoveryPage
        onRecoverySuccess={handleRecoverySuccess}
        onBackToLogin={() => setShowAuthPage('login')}
      />
    );
  }
  if (showAuthPage === 'settings') {
    return (
      <SettingsPage
        currentUser={currentUser}
        onLogout={handleLogout}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <CreateLinkSection onCreateLink={handleCreateLink} />
            <ActiveLinksSection links={activeLinks} onDeleteLink={handleDeleteLink} />
          </>
        );
      case 'links':
        return <LinksTab links={activeLinks} />;
      case 'search':
        return (
          <SearchTab
            onAddFriendClick={() => requireAuth(() => {})} // Trigger auth check
          />
        );
      case 'messages':
        return (
          <MessagesTab
            onMessageClick={() => requireAuth(() => {})} // Trigger auth check
          />
        );
      case 'profile':
        return (
          <ProfilePage
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            onLogout={handleLogout}
            onLoginClick={() => setShowAuthPage('login')}
            onSignupClick={() => setShowAuthPage('signup')}
            onSettingsClick={() => requireAuth(() => setShowAuthPage('settings'))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        {renderTabContent()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
