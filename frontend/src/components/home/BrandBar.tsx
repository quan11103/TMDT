import React from 'react';

const BrandBar: React.FC = () => {
    const containerStyle: React.CSSProperties = {
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '40px 5%', // Tăng padding để logo có không gian thở
        flexWrap: 'wrap',
        gap: '40px'
    };

    const logoStyle: React.CSSProperties = {
        height: '32px', // Chiều cao cố định để các logo trông đồng đều
        width: 'auto',
        filter: 'brightness(0) invert(1)', // Chuyển logo màu đen thành màu trắng để nổi trên nền đen
        objectFit: 'contain',
        cursor: 'pointer'
    };

    return (
        <div style={containerStyle}>
            <img src="/logos/versace.svg" alt="Versace" style={logoStyle} />
            <img src="/logos/zara.svg" alt="Zara" style={logoStyle} />
            <img src="/logos/gucci.svg" alt="Gucci" style={logoStyle} />
            <img src="/logos/prada.svg" alt="Prada" style={logoStyle} />
            <img src="/logos/calvin-klein.svg" alt="Calvin Klein" style={logoStyle} />
        </div>
    );
};

export default BrandBar;