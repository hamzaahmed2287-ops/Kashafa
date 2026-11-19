'use client';
import { useLang } from '@/app/layout';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { api } from '@/utils/api';

export default function BrandDetailPage() {
  const lang = useLang();
  const isAr = lang === 'AR';
  const params = useParams();
  const brandSlug = decodeURIComponent(String(params?.slug || '')).toLowerCase();

  const [brandData, setBrandData] = useState<any>(null);
  const [brandProducts, setBrandProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandNotFound, setBrandNotFound] = useState(false);

  useEffect(() => {
    if (!brandSlug) return;

    const fetchBrandAndProducts = async () => {
      setLoading(true);
      setBrandNotFound(false);
      try {
        // 1. جلب البراندات من قاعدة البيانات أو التخزين المحلي
        const dbBrands = await (api as any).getBrands?.();
        const savedBrands = (dbBrands && dbBrands.length > 0) 
          ? dbBrands 
          : JSON.parse(localStorage.getItem('kashafa_admin_brands') || '[]');

        const matchedBrand = savedBrands.find((b: any) => {
          const bSlug = String(b.slug || b.Slug || '').toLowerCase();
          const bNameEnSlug = String(b.nameEn || b.NameEn || '').toLowerCase().replace(/\s+/g, '-');
          const bNameArSlug = String(b.nameAr || b.NameAr || '').toLowerCase().replace(/\s+/g, '-');
          return bSlug === brandSlug || bNameEnSlug === brandSlug || bNameArSlug === brandSlug;
        });

        // إذا تم حذف البراند أو لم يتم العثور عليه، نعتبره غير موجود تماماً ولا نضع براند وهمي
        if (!matchedBrand) {
          setBrandNotFound(true);
          setLoading(false);
          return;
        }

        setBrandData({
          nameEn: matchedBrand.nameEn || matchedBrand.NameEn,
          nameAr: matchedBrand.nameAr || matchedBrand.NameAr,
          logo: matchedBrand.logo || matchedBrand.LogoUrl || '',
          descriptionEn: matchedBrand.descriptionEn || matchedBrand.DescriptionEn,
          descriptionAr: matchedBrand.descriptionAr || matchedBrand.DescriptionAr,
        });

        // 2. جلب المنتجات المرتبطة بهذا البراند فقط
        const dbProducts = await api.getProducts();
        const allProducts = (dbProducts && dbProducts.length > 0)
          ? dbProducts
          : JSON.parse(localStorage.getItem('kashafa_admin_products') || localStorage.getItem('kashafa_products') || '[]');

        const filteredProducts = allProducts.filter((p: any) => {
          const productBrand = String(p.brand || p.Brand || '').toLowerCase();
          const productBrandSlug = productBrand.replace(/\s+/g, '-');
          const targetNameEn = String(matchedBrand?.nameEn || matchedBrand?.NameEn || '').toLowerCase();
          const targetNameAr = String(matchedBrand?.nameAr || matchedBrand?.NameAr || '').toLowerCase();

          return (
            productBrandSlug === brandSlug ||
            (targetNameEn && productBrand === targetNameEn) ||
            (targetNameAr && productBrand === targetNameAr)
          );
        });

        setBrandProducts(filteredProducts);
      } catch (error) {
        console.error('Error loading brand details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandAndProducts();
  }, [brandSlug]);

  const displayName = isAr
    ? (brandData?.nameAr || brandData?.nameEn || '')
    : (brandData?.nameEn || brandData?.nameAr || '');

  const displayDesc = isAr
    ? (brandData?.descriptionAr || brandData?.description || '')
    : (brandData?.descriptionEn || brandData?.description || '');

  const displayInitial = (displayName || 'K').charAt(0).toUpperCase();

  return (
    <div className="brand-detail-container" style={{ backgroundColor: '#F5F2EC', minHeight: '100vh', padding: '40px 80px', fontFamily: 'system-ui, sans-serif', direction: isAr ? 'rtl' : 'ltr', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666', fontSize: '1.1rem' }}>
            {isAr ? 'جاري تحميل تفاصيل البراند...' : 'Loading brand details...'}
          </div>
        ) : brandNotFound ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#20232B', marginBottom: '12px' }}>
              {isAr ? 'البراند غير موجود أو تم حذفه' : 'Brand not found or deleted'}
            </h2>
            <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
              {isAr ? 'عذراً، هذا البراند لم يعد متاحاً على المتجر.' : 'Sorry, this brand is no longer available on the store.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: isAr ? 'right' : 'left', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#20232B', margin: '0 0 8px 0', wordBreak: 'break-word' }}>
                {displayName}
              </h2>
              {displayDesc && (
                <p style={{ color: '#666', fontSize: '1rem', margin: 0, wordBreak: 'break-word' }}>
                  {displayDesc}
                </p>
              )}
            </div>

            <div className="brand-card-box" style={{ 
              backgroundColor: '#FFFFFF', padding: '30px 40px', borderRadius: '20px', 
              border: '1px solid #DAD8D2', marginBottom: '40px', 
              display: 'flex', alignItems: 'center', justifyContent: 'flex-start', 
              gap: '24px', boxShadow: '0 4px 12px rgba(32, 35, 43, 0.03)', boxSizing: 'border-box',
              flexWrap: 'wrap'
            }}>
              <div style={{ 
                width: '80px', height: '80px', backgroundColor: '#F5F2EC', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', 
                fontWeight: 'bold', color: '#20232B', flexShrink: 0, overflow: 'hidden', border: '2px solid #E2DCCB' 
              }}>
                {brandData?.logo ? (
                  <img src={brandData.logo} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{displayInitial}</span>
                )}
              </div>
              
              <div style={{ textAlign: isAr ? 'right' : 'left', flex: '1 1 200px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px', color: '#20232B', margin: 0, wordBreak: 'break-word' }}>
                  {displayName}
                </h1>
                <span style={{ color: '#888', fontSize: '0.85rem' }}>
                  {isAr ? 'براند معتمد' : 'Verified Brand'}
                </span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px', color: '#20232B', textAlign: isAr ? 'right' : 'left' }}>
              {isAr ? 'منتجات البراند' : 'Brand Products'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {brandProducts.length > 0 ? (
                brandProducts.map((product: any) => {
                  const pId = product.id || product.Id;
                  const pNameEn = product.nameEn || product.NameEn || product.title?.EN || product.title || 'Product';
                  const pNameAr = product.nameAr || product.NameAr || product.title?.AR || product.title || 'منتج';
                  const pPrice = product.price ?? product.Price ?? 0;
                  const pCat = product.category || product.Category || displayName;
                  const pImg = product.image || product.Image;
                  const images = product.images?.length > 0 ? product.images : (pImg ? [pImg] : []);

                  return (
                    <ProductCard
                      key={pId}
                      id={pId}
                      title={{ EN: pNameEn, AR: pNameAr }}
                      price={`${pPrice} ${isAr ? 'ج.م' : 'EGP'}`}
                      images={images}
                      category={{ EN: pCat, AR: pCat }}
                      stock={product.stock ?? product.Stock ?? 10}
                      sizes={product.sizes || []}
                      colors={product.colors || []}
                    />
                  );
                })
              ) : (
                <div style={{ gridColumn: '1 / -1', backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '16px', border: '1px solid #DAD8D2', textAlign: 'center', color: '#666' }}>
                  {isAr ? 'لا توجد منتجات متاحة لهذا البراند حالياً.' : 'No products available for this brand currently.'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}