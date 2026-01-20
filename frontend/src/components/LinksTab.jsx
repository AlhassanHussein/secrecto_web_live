import { useState } from 'react';
import './LinksTab.css';

const LinksTab = ({ links }) => {
    const [copiedId, setCopiedId] = useState(null);

    // Mock data for demonstration - will be replaced with real data from backend
    const mockLinks = [
        {
            id: 1,
            name: 'Ask me anything',
            type: 'temporary',
            duration: '24h',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            publicUrl: 'https://saytruth.app/l/abc123xyz',
            privateUrl: 'https://saytruth.app/p/xyz789abc',
            messageCount: 12,
            isExpired: false,
        },
        {
            id: 2,
            name: 'Feedback',
            type: 'temporary',
            duration: '1w',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            publicUrl: 'https://saytruth.app/l/def456uvw',
            privateUrl: 'https://saytruth.app/p/uvw123def',
            messageCount: 5,
            isExpired: false,
        },
        {
            id: 3,
            name: 'Anonymous Questions',
            type: 'permanent',
            duration: 'permanent',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            publicUrl: 'https://saytruth.app/l/ghi789rst',
            privateUrl: 'https://saytruth.app/p/rst456ghi',
            messageCount: 47,
            isExpired: false,
        },
        {
            id: 4,
            name: 'Old Survey',
            type: 'temporary',
            duration: '12h',
            createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
            publicUrl: 'https://saytruth.app/l/jkl012mno',
            privateUrl: 'https://saytruth.app/p/mno789jkl',
            messageCount: 3,
            isExpired: true,
        },
    ];

    const displayLinks = links.length > 0 ? links : mockLinks;

    const handleCopy = async (url, id) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const getTimeRemaining = (link) => {
        if (link.type === 'permanent') return 'Permanent';
        if (link.isExpired) return 'Expired';

        const now = new Date();
        const created = new Date(link.createdAt);

        const durationMs = {
            '6h': 6 * 60 * 60 * 1000,
            '12h': 12 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '1w': 7 * 24 * 60 * 60 * 1000,
            '1m': 30 * 24 * 60 * 60 * 1000,
        }[link.duration];

        const expiresAt = new Date(created.getTime() + durationMs);
        const remaining = expiresAt - now;

        if (remaining <= 0) return 'Expired';

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h remaining`;
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    };

    return (
        <div className="links-tab">
            <div className="links-tab-header">
                <h1 className="page-title">My Links</h1>
                <p className="page-subtitle">Manage your public and private anonymous links</p>
            </div>

            <div className="links-sections">
                {/* Public Links Section */}
                <section className="link-section">
                    <div className="section-header">
                        <div className="section-title-wrapper">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="section-icon">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M2 12h20" />
                            </svg>
                            <h2 className="section-title">Public Links</h2>
                        </div>
                        <span className="section-badge">{displayLinks.filter(l => !l.isExpired).length}</span>
                    </div>
                    <p className="section-description">Share these links to receive anonymous messages</p>

                    <div className="links-list">
                        {displayLinks.map((link) => (
                            <div key={link.id} className={`link-item ${link.isExpired ? 'expired' : ''}`}>
                                <div className="link-item-header">
                                    <div className="link-item-info">
                                        <h3 className="link-item-name">{link.name}</h3>
                                        <div className="link-item-meta">
                                            <span className={`type-badge ${link.type}`}>
                                                {link.type === 'permanent' ? '∞ Permanent' : `⏱️ ${link.duration.toUpperCase()}`}
                                            </span>
                                            <span className={`time-status ${link.isExpired ? 'expired' : ''}`}>
                                                {getTimeRemaining(link)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="link-item-url">
                                    <input
                                        type="text"
                                        value={link.publicUrl}
                                        readOnly
                                        className="url-input"
                                    />
                                    <button
                                        className={`copy-btn ${copiedId === `public-${link.id}` ? 'copied' : ''}`}
                                        onClick={() => handleCopy(link.publicUrl, `public-${link.id}`)}
                                        disabled={link.isExpired}
                                    >
                                        {copiedId === `public-${link.id}` ? (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                </svg>
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Private Links Section */}
                <section className="link-section">
                    <div className="section-header">
                        <div className="section-title-wrapper">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="section-icon">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <h2 className="section-title">Private Links</h2>
                        </div>
                        <span className="section-badge private">{displayLinks.filter(l => !l.isExpired).length}</span>
                    </div>
                    <p className="section-description">Access your received messages (login required)</p>

                    <div className="links-list">
                        {displayLinks.map((link) => (
                            <div key={link.id} className={`link-item private ${link.isExpired ? 'expired' : ''}`}>
                                <div className="link-item-header">
                                    <div className="link-item-info">
                                        <h3 className="link-item-name">{link.name}</h3>
                                        <div className="link-item-meta">
                                            <span className="message-count">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                                {link.messageCount} {link.messageCount === 1 ? 'message' : 'messages'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className={`view-messages-btn ${link.isExpired ? 'disabled' : ''}`}
                                    disabled={link.isExpired}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    View Messages
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LinksTab;
