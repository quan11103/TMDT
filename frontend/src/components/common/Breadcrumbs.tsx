import './Breadcrumbs.css';

const Breadcrumbs = () => {
    return (
        <nav className="breadcrumbs">
            <a href="/">Home</a> <span>{'>'}</span>
            <a href="/shop">Shop</a> <span>{'>'}</span>
            <a href="/men">Men</a> <span>{'>'}</span>
            <span className="current">T-shirts</span>
        </nav>
    );
};
export default Breadcrumbs;