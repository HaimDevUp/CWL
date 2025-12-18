import './Cards.scss';
import { Product } from '@/app/page';

interface ProductCardProps {
    product: Product
    fullWidth: boolean;
    className?: string;
}

export const ProductCard = ({ product, fullWidth=false, className }: ProductCardProps) => {
    return (
        <div className={`product-card ${fullWidth ? 'full-width' : ''} ${className}`}>
            <div className="image-container">
                <img src={product.image} alt={product.title} />
                {product.notice && <span>{product.notice}</span>}
            </div>
            <div className="product-card--content">
                <h4>{product.title}</h4>
                <p dangerouslySetInnerHTML={{ __html: product.description }} />
                <button className=" btn-primary fw" onClick={product.onClick}>{product.buttonText}</button>
            </div>
        </div>
    )
}