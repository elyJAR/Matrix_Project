import React from 'react';

const Header = () => {
    return (
        <header style={{
            textAlign: 'center',
            marginBottom: '3rem',
            color: 'white',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
            <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '500',
                opacity: 0.9,
                marginBottom: '0.5rem'
            }}>
                Matrix Machine Learning
            </h1>
            <div style={{
                fontSize: '0.9rem',
                opacity: 0.6,
                fontWeight: '300',
                letterSpacing: '0.05em'
            }}>
                v1.0.0
            </div>
        </header>
    );
};

export default Header;
