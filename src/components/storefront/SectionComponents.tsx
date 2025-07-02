import HeaderSection from './sections/HeaderSection';
import FooterSection from './sections/FooterSection';
import HeroBannerSection from './sections/HeroBannerSection';
import FeaturedProductsSection from './sections/FeaturedProductsSection';
import ProductGridSection from './sections/ProductGridSection';
import ProductDetailSection from './sections/ProductDetailSection';
import CartSection from './sections/CartSection';

const SectionComponents: Record<string, React.ComponentType<any>> = {
  'header': HeaderSection,
  'footer': FooterSection,
  'hero-banner': HeroBannerSection,
  'featured-products': FeaturedProductsSection,
  'product-grid': ProductGridSection,
  'product-detail': ProductDetailSection,
  'cart': CartSection,
};

export default SectionComponents; 