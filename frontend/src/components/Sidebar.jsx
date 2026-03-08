import React from 'react';

const Sidebar = () => {
    return (
        <nav className="sidebar">
            <div className="logo-icon">
                <i className="ri-bank-line"></i>
            </div>
            <div className="nav-item active">
                <i className="ri-file-text-line"></i>
            </div>
            <div className="nav-item">
                <i className="ri-history-line"></i>
            </div>
            <div className="nav-item">
                <i className="ri-settings-4-line"></i>
            </div>
        </nav>
    );
};

export default Sidebar;
