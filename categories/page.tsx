'use client';
import { useLang } from '@/app/layout';
import Link from 'next/link';
import BackArrow from '@/components/BackArrow';
import { STORE_CATEGORIES } from '@/utils/egyptData';

export default function CategoriesPage() {
  const lang = useLang();
  const isAr = lang === 'AR';

  const getCategorySvgIcon = (id: string) => {
    switch (id) {
      case 'fashion':
        return <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>;
      case 'beauty-care':
        return <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>;
      case 'accessories':
        return <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0"></path>;
      case 'pet-products':
        return <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"></path>;
      case 'home-living':
        return <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"></path>;
      case 'electronics':
        return <path d="M2 3h20v14H2z M8 21h8 M12 17v4"></path>;
      case 'sports':
        return <><circle cx="12" cy="12" r="10"></circle><path d="M4.93 4.93l4.24 4.24"></path><path d="M14.83 14.83l4.24 4.24"></path></>;
      default:
        return <circle cx="12" cy="12" r="9"></circle>;
    }
  };

  return (
    <div style={{ backgroundColor: '#F5F2EC', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <BackArrow />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px', color: '#20232B' }}>
          {isAr ? 'الأقسام الرئيسية' : 'Main Categories'}
        </h1>
        <p style={{ color: '#666', marginBottom: '35px', fontSize: '1rem' }}>
          {isAr ? 'تصفح جميع الأقسام والمنتجات المتاحة في كشافة.' : 'Browse all available sections and products on Kashafa.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {STORE_CATEGORIES.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/categories/${cat.id}`} 
              style={{ 
                backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #DAD8D2', 
                padding: '28px 20px', textAlign: 'center', textDecoration: 'none', color: '#20232B',
                boxShadow: '0 2px 8px rgba(32, 35, 43, 0.03)', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s'
              }}
            >
              <div style={{ width: '55px', height: '55px', backgroundColor: '#F5F2EC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#20232B' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {getCategorySvgIcon(cat.id)}
                </svg>
              </div>
              <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>
                {isAr ? cat.nameAr : cat.nameEn}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}