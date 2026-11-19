'use client';
import { useLang } from '@/app/layout';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api'; // 👈 استدعاء الـ API للربط مع قاعدة البيانات

export default function ProductDetailPage() {
  const lang = useLang();
  const isAr = lang === 'AR';
  const params = useParams();
  const productId = params?.slug;

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const getText = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[lang] || val.EN || val.AR || Object.values(val)[0] || '';
    }
    return String(val);
  };

  // 👈 جلب تفاصيل المنتج من قاعدة البيانات (SQL Server) عبر الـ API مع الاحتفاظ بـ localStorage كبديل
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      try {
        // 1. محاولة جلب جميع المنتجات من قاعدة البيانات عبر الـ API
        const dbProducts = await api.getProducts();
        
        // 2. خيار احتياطي من التخزين المحلي
        const localProducts = JSON.parse(
          localStorage.getItem('kashafa_admin_products') || 
          localStorage.getItem('kashafa_products') || '[]'
        );

        const allProducts = (dbProducts && dbProducts.length > 0) ? dbProducts : localProducts;
        
        const found = allProducts.find((p: any) => String(p.id || p.Id) === String(productId));
        
        if (found) {
          // توحيد تنسيق الحقول القادمة من SQL Server أو التخزين المحلي
          const normalizedProduct = {
            id: found.id || found.Id,
            nameEn: found.nameEn || found.NameEn,
            nameAr: found.nameAr || found.NameAr,
            title: found.title,
            description: found.description || found.Description,
            price: found.price ?? found.Price ?? 0,
            image: found.image || found.Image,
            images: found.images || (found.image ? [found.image] : []),
            sizes: found.sizes || [],
            colors: found.colors || [],
            brand: found.brand || found.Brand || found.category || found.Category
          };

          setProduct(normalizedProduct);
          setSelectedImage(normalizedProduct.images?.[0] || normalizedProduct.image || '');
          if (normalizedProduct.sizes?.length > 0) setSelectedSize(normalizedProduct.sizes[0]);
          if (normalizedProduct.colors?.length > 0) setSelectedColor(normalizedProduct.colors[0]);
        }
      } catch (err) {
        console.error('Error loading product details from server:', err);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (!product) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', direction: isAr ? 'rtl' : 'ltr' }}>
        <h2>{isAr ? 'جاري تحميل المنتج أو أن المنتج غير موجود...' : 'Loading product or product not found...'}</h2>
        <Link href="/" style={{ color: '#2D473B', fontWeight: 'bold', marginTop: '15px', display: 'inline-block' }}>
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('kashafa_cart') || '[]');
    
    const cartItemId = `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`;

    const rawTitle = isAr 
      ? (product.nameAr || product.title?.AR || product.title?.EN || product.title) 
      : (product.nameEn || product.title?.EN || product.title?.AR || product.title);

    const newItem = {
      id: cartItemId,
      productId: product.id,
      title: getText(rawTitle),
      price: product.price,
      image: selectedImage || product.images?.[0] || product.image,
      quantity,
      selectedSize: selectedSize || null,
      size: selectedSize || null,
      selectedColor: selectedColor || null,
      color: selectedColor || null
    };

    const existingIndex = existingCart.findIndex((item: any) => item.id === cartItemId);
    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += quantity;
    } else {
      existingCart.push(newItem);
    }

    localStorage.setItem('kashafa_cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('storage'));

    alert(
      isAr 
        ? `تم إضافة المنتج إلى شنطة التسوق بنجاح! 🛍️` 
        : `Product added to shopping bag successfully! 🛍️`
    );
  };

  const rawTitle = isAr 
    ? (product.nameAr || product.title?.AR || product.title?.EN || product.title) 
    : (product.nameEn || product.title?.EN || product.title?.AR || product.title);
  const currentTitle = getText(rawTitle);

  const rawDesc = isAr 
    ? (product.description?.AR || product.description || 'منتج عالي الجودة من كشافة مصمم بعناية لتلبية احتياجاتك.') 
    : (product.description?.EN || product.description || 'High quality product from Kashafa.');
  const currentDesc = getText(rawDesc);

  const rawBrand = product.brand || 'KASHFA STORE';
  const currentBrand = getText(rawBrand);

  const productImages = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '24px', border: '1px solid #DAD8D2' }}>
        
        {/* صور المنتج */}
        <div>
          <div style={{ width: '100%', height: '380px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#F9F8F6', marginBottom: '15px', border: '1px solid #DAD8D2' }}>
            <img src={selectedImage} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {productImages.map((img: string, idx: number) => (
              <img 
                key={idx} 
                src={img} 
                onClick={() => setSelectedImage(img)}
                style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', cursor: 'pointer', border: selectedImage === img ? '2px solid #20232B' : '1px solid #DAD8D2' }} 
              />
            ))}
          </div>
        </div>

        {/* تفاصيل المنتج والخيارات */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ backgroundColor: '#F5F2EC', width: 'fit-content', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', color: '#20232B' }}>
            {currentBrand}
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#20232B', margin: 0 }}>
            {currentTitle}
          </h1>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#2D473B' }}>
            {product.price} <span style={{ fontSize: '0.9rem' }}>{isAr ? 'ج.م' : 'EGP'}</span>
          </div>

          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {currentDesc}
          </p>

          {/* اختيار الألوان لو موجودة */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label style={{ display: 'block', fontWeight: '800', marginBottom: '8px', fontSize: '0.9rem' }}>
                {isAr ? 'اللون المختار:' : 'Color:'} <span style={{ color: '#2D473B' }}>{selectedColor}</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.colors.map((c: string) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: selectedColor === c ? '2px solid #20232B' : '1px solid #DAD8D2',
                      backgroundColor: selectedColor === c ? '#20232B' : '#F9F8F6',
                      color: selectedColor === c ? '#F5F2EC' : '#20232B',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* اختيار المقاسات لو موجودة */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label style={{ display: 'block', fontWeight: '800', marginBottom: '8px', fontSize: '0.9rem' }}>
                {isAr ? 'المقاس:' : 'Size:'} <span style={{ color: '#2D473B' }}>{selectedSize}</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: selectedSize === s ? '2px solid #20232B' : '1px solid #DAD8D2',
                      backgroundColor: selectedSize === s ? '#20232B' : '#F9F8F6',
                      color: selectedSize === s ? '#F5F2EC' : '#20232B',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* التحكم في الكمية */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
            <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{isAr ? 'الكمية:' : 'Quantity:'}</span>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F5F2EC', borderRadius: '20px', border: '1px solid #DAD8D2', padding: '4px 12px', gap: '15px' }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' }}>-</button>
              <span style={{ fontWeight: '900', fontSize: '1rem' }}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} style={{ background: 'none', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' }}>+</button>
            </div>
          </div>

          {/* زر الإضافة */}
          <button 
            onClick={handleAddToCart}
            style={{ 
              backgroundColor: '#A6C96A', color: '#20232B', border: 'none', padding: '16px', 
              borderRadius: '25px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', marginTop: '15px',
              boxShadow: '0 4px 12px rgba(166, 201, 106, 0.3)'
            }}
          >
            {isAr ? 'أضف إلى شنطة التسوق 🛍️' : 'Add to Shopping Bag 🛍️'}
          </button>

        </div>
      </div>
    </div>
  );
}