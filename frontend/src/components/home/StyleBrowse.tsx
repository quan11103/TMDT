import React from 'react';
import './StyleBrowse.css';

export const StyleBrowse: React.FC = () => {
    const styles = [
        { title: 'Casual', img: '/images/casual.svg', className: 'short' },
        { title: 'Formal', img: '/images/formal.svg', className: 'long' },
        { title: 'Party', img: '/images/party.svg', className: 'long' },
        { title: 'Gym', img: '/images/gym.svg', className: 'short' },
    ];

    return (
        <section className="style-browse">
            <h2 className="section-title">BROWSE BY DRESS STYLE</h2>
            <div className="style-grid">
                {styles.map((style) => (
                    <div key={style.title} className={`style-card ${style.className}`}>
                        <h3>{style.title}</h3>
                        <img src={style.img} alt={style.title} />
                    </div>
                ))}
            </div>
        </section>
    );
};