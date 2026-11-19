'use client';
import { useLang } from '@/app/layout';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BackArrow from '@/components/BackArrow';
import ProductCard from '@/components/ProductCard';
import { api } from '@/utils/api'; // 👈 الربط مع الـ API وقاعدة البيانات

export default function CategoryDetailsPage() {
  const lang = useLang();
  const isAr = lang === 'AR';
  const params = useParams();
  
  const rawCat = String(params.category || params.slug || '').trim().toLowerCase();

  const [selectedSubCat, setSelectedSubCat] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getText = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[lang] || val.EN || val.AR || Object.values(val)[0] || '';
    }
    return String(val);
  };

  let categoryKey = rawCat;
  if (categoryKey.includes('home') || categoryKey.includes('living') || categoryKey.includes('بيت')) categoryKey = 'home-living';
  if (categoryKey.includes('electron') || categoryKey.includes('إلكترون')) categoryKey = 'electronics';
  if (categoryKey.includes('beauty') || categoryKey.includes('جمال')) categoryKey = 'beauty-care';
  if (categoryKey.includes('pet') || categoryKey.includes('حيوان')) categoryKey = 'pet-products';
  if (categoryKey.includes('access')) categoryKey = 'accessories';
  if (categoryKey.includes('fash')) categoryKey = 'fashion';
  if (categoryKey.includes('sport') || categoryKey.includes('رياض')) categoryKey = 'sports';

  const subCategoriesMap: Record<string, { EN: { id: string; name: string }[]; AR: { id: string; name: string }[] }> = {
    'fashion': {
      EN: [{ id: 'all', name: 'All' }, { id: 'women', name: 'Women Wear' }, { id: 'men', name: 'Men Wear' }, { id: 'shoes', name: 'Shoes & Bags' }],
      AR: [{ id: 'all', name: 'الكل' }, { id: 'women', name: 'ملابس نسائية' }, { id: 'men', name: 'ملابس رجالية' }, { id: 'shoes', name: 'أحذية وحقائب' }]
    },
    'beauty-care': {
      EN: [{ id: 'all', name: 'All' }, { id: 'skincare', name: 'Skincare' }, { id: 'shampoo', name: 'Shampoo & Hair' }, { id: 'perfumes', name: 'Fragrances' }],
      AR: [{ id: 'all', name: 'الكل' }, { id: 'skincare', name: 'العناية بالبشرة' }, { id: 'shampoo', name: 'الشامبو والعناية بالشعر' }, { id: 'perfumes', name: 'العطور ومستحضرات التجميل' }]
    },
    'accessories': {
      EN: [{ id: 'all', name: 'All' }, { id: 'general-acc', name: 'General Accessories' }, { id: 'bags', name: 'Bags & Wallets' }],
      AR: [{ id: 'all', name: 'الكل' }, { id: 'general-acc', name: 'إكسسوارات عادية' }, { id: 'bags', name: 'حقائب ومحافظ' }]
    },
    'pet-products': {
      EN: [{ id: 'all', name: 'All' }, { id: 'supplies', name: 'Pet Supplies' }, { id: 'food', name: 'Food & Treats' }],
      AR: [{ id: 'all', name: 'الكل' }, { id: 'supplies', name: 'مستلزمات الحيوانات' }, { id: 'food', name: 'طعام ومكافآت' }]
    },
    'home-living': {
      EN: [{ id: 'all', name: 'All' }, { id: 'candles', name: 'Candles & Scents' }, { id: 'decor', name: 'Home Decor' }],
      AR: [{ id: 'all', name: 'الكل' }, { id: 'candles', name: 'الشموع المعطرة' }, { id: 'decor', name: 'ديكورات المنزل' }]
    },
    'electronics': {
      EN: [{ id: 'all', name: 'All' }, { id: 'gaming-headsets', name: 'Gaming Headsets' }, { id: 'keyboards-mice', name: 'Keyboards & Mice' }, { id: 'storage-pc', name: 'Hard Drives & PC' }],
      AR: [{ id: 'all', name: 'الكل' }, { id: 'gaming-headsets', name: 'سماعات الألعاب' }, { id: 'keyboards-mice', name: 'الكيبوردات والماوسات' }, { id: 'storage-pc', name: 'الهاردات ومستلزمات الكمبيوتر' }]
    },
    'sports': {
      EN: [
        { id: 'all', name: 'All' },
        { id: 'training-tools', name: 'Training Equipment' },
        { id: 'sports-whistles', name: 'Sports Whistles' },
        { id: 'fitness-gym', name: 'Fitness & Gym' },
        { id: 'sport-accessories', name: 'Sport Accessories' }
      ],
      AR: [
        { id: 'all', name: 'الكل' },
        { id: 'training-tools', name: 'أدوات التدريب الرياضية' },
        { id: 'sports-whistles', name: 'الصفارات الرياضية' },
        { id: 'fitness-gym', name: 'معدات اللياقة والجيم' },
        { id: 'sport-accessories', name: 'إكسسوارات رياضية' }
      ]
    }
  };

  const currentSubCats = subCategoriesMap[categoryKey]?.[lang] || subCategoriesMap['fashion'][lang];

  const content = {
    EN: {
      title: "Category Products",
      desc: "Browse products of this category with ease.",
      loading: "Fetching products...",
      empty: "No products added in this section yet."
    },
    AR: {
      title: "منتجات القسم",
      desc: "تصفح منتجات هذا القسم بكل سهولة.",
      loading: "جاري إحضار المنتجات...",
      empty: "لا توجد منتجات مضافة في هذا القسم الفرعي حالياً."
    }
  };

  const t = content[lang];

  // 👈 جلب المنتجات من الداتا بيز عبر الـ API مع الاحتفاظ بالـ LocalStorage كخيار بديل
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const dbProducts = await api.getProducts();
        const localProds = JSON.parse(
          localStorage.getItem('kashafa_admin_products') || 
          localStorage.getItem('kashafa_products') || '[]'
        );

        const allProds = (dbProducts && dbProducts.length > 0) ? dbProducts : localProds;

        const matched = allProds.filter((p: any) => {
          const pCat = getText(p.category || p.Category).toLowerCase();
          return pCat.includes(categoryKey) || categoryKey.includes(pCat);
        });

        setProducts(matched);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (categoryKey) {
      loadProducts();
      window.addEventListener('storage', loadProducts);
      return () => window.removeEventListener('storage', loadProducts);
    }
  }, [categoryKey]);

  const filteredProducts = selectedSubCat === 'all'
    ? products
    : products.filter((p) => {
        const pSub = getText(p.subCategory || p.sub_category).toLowerCase();
        return pSub.includes(selectedSubCat.toLowerCase());
      });

  return (
    <div style={{ backgroundColor: '#F5F2EC', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <BackArrow />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px', color: '#20232B' }}>{t.title}</h1>
        <p style={{ color: '#666', marginBottom: '25px' }}>{t.desc}</p>
        
        {currentSubCats && currentSubCats.length > 0 && (
          <div style={{ 
            display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', 
            marginBottom: '30px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
            position: 'relative', zIndex: 10
          }}>
            {currentSubCats.map((sub) => {
              const isActive = selectedSubCat === sub.id;
              return (
                <button
                  type="button"
                  key={sub.id}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedSubCat(sub.id);
                  }}
                  style={{
                    backgroundColor: isActive ? '#20232B' : '#FFFFFF',
                    color: isActive ? '#F5F2EC' : '#20232B',
                    border: '1px solid #DAD8D2',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div style={{ backgroundColor: '#FFFFFF', padding: '50px', borderRadius: '18px', border: '1px solid #DAD8D2', textAlign: 'center', color: '#666' }}>
            {t.loading}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {filteredProducts.map((product) => {
              const pId = product.id || product.Id;
              const formattedTitle = typeof product.title === 'object' ? product.title : { 
                EN: product.nameEn || product.NameEn || product.title || product.name || 'Product', 
                AR: product.nameAr || product.NameAr || product.title || product.name || 'منتج' 
              };

              const catVal = product.category || product.Category;
              const formattedCategory = typeof catVal === 'object' ? catVal : { 
                EN: catVal || 'Kashafa', 
                AR: catVal || 'كاشفا' 
              };

              const imgVal = product.image || product.Image;
              const formattedImages = product.images && product.images.length > 0 
                ? product.images 
                : (imgVal ? [imgVal] : ['/placeholder.jpg']);

              const pPrice = product.price ?? product.Price ?? 0;
              const pStock = product.stock ?? product.Stock ?? 10;

              return (
                <ProductCard
                  key={pId}
                  id={pId}
                  title={formattedTitle}
                  price={`${pPrice} ${isAr ? 'ج.م' : 'EGP'}`}
                  images={formattedImages}
                  category={formattedCategory}
                  stock={pStock}
                  sizes={product.sizes || []}
                  colors={product.colors || []}
                />
              );
            })}
          </div>
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', padding: '50px', borderRadius: '18px', border: '1px solid #DAD8D2', textAlign: 'center', color: '#666' }}>
            {t.empty}
          </div>
        )}

      </div>
    </div>
  );
}