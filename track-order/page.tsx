'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/app/layout';
import { api } from '@/utils/api'; // 👈 استدعاء الـ API للربط مع قاعدة البيانات

export default function TrackOrderPage() {
  const lang = useLang();
  const isAr = lang === 'AR';

  const [orderInput, setOrderInput] = useState('');
  const [foundOrder, setFoundOrder] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelBox, setShowCancelBox] = useState(false);
  const [copied, setCopied] = useState(false);

  // قراءة رقم الطلب من الرابط لو موجود (query param ?id=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) {
      setOrderInput(idParam);
      searchOrder(idParam);
    }
  }, []);

  const searchOrder = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      // 1. محاولة جلب الطلبات من قاعدة البيانات عبر الـ API
      const dbOrders = await api.getOrders?.();
      
      // 2. خيار احتياطي من التخزين المحلي
      const localOrders = JSON.parse(
        localStorage.getItem('kashafa_admin_orders') || 
        localStorage.getItem('kashafa_orders') || '[]'
      );

      const allOrders = (dbOrders && dbOrders.length > 0) ? dbOrders : localOrders;
      const match = allOrders.find((o: any) => String(o.id).toUpperCase() === cleanCode);
      
      setFoundOrder(match || null);
    } catch (err) {
      console.warn('Error fetching order from server, fallback to local');
      const localOrders = JSON.parse(
        localStorage.getItem('kashafa_admin_orders') || 
        localStorage.getItem('kashafa_orders') || '[]'
      );
      const match = localOrders.find((o: any) => String(o.id).toUpperCase() === cleanCode);
      setFoundOrder(match || null);
    }
    setSearched(true);
  };

  // تحديث حي (Live Polling) كل 3 ثواني لجلب أحدث حالة للطلب من السيرفر أو التخزين
  useEffect(() => {
    if (!foundOrder) return;
    const interval = setInterval(() => {
      searchOrder(foundOrder.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [foundOrder?.id]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder(orderInput);
    const cleanCode = orderInput.trim().toUpperCase();
    window.history.replaceState({}, '', `/track-order?id=${cleanCode}`);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // إلغاء الطلب وتحديث حالته
  const handleCancelOrder = async () => {
    if (!foundOrder) return;

    const updatedStatus = 'Cancelled';
    const updatedOrder = { ...foundOrder, status: updatedStatus, cancelReason: cancelReason || 'No reason provided' };

    try {
      // محاولة تحديث الحالة في السيرفر عبر الـ API (إن وجد إندبوينت للتحديث)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${API_BASE_URL}/orders/${foundOrder.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelReason: updatedOrder.cancelReason })
      });
    } catch (err) {
      console.warn('Server cancel fallback to local');
    }

    // تحديث محلي لضمان الاستجابة الفورية
    const adminOrders = JSON.parse(localStorage.getItem('kashafa_admin_orders') || '[]');
    const newAdminOrders = adminOrders.map((o: any) => (o.id === foundOrder.id ? updatedOrder : o));
    localStorage.setItem('kashafa_admin_orders', JSON.stringify(newAdminOrders));

    const customerOrders = JSON.parse(localStorage.getItem('kashafa_orders') || '[]');
    const newCustomerOrders = customerOrders.map((o: any) => (o.id === foundOrder.id ? updatedOrder : o));
    localStorage.setItem('kashafa_orders', JSON.stringify(newCustomerOrders));

    setFoundOrder(updatedOrder);
    setShowCancelBox(false);
    alert(isAr ? '✓ تم إلغاء الطلب بنجاح وإبلاغ الإدارة.' : '✓ Order cancelled successfully.');
  };

  const t = {
    title: isAr ? 'تتبع طلبك مباشرة' : 'Live Order Tracking',
    subtitle: isAr ? 'أدخل رقم الطلب الخاص بك لمتابعة حالة الشحن والتوصيل لحظة بلحظة.' : 'Enter your Order ID to track your shipment status in real time.',
    placeholder: isAr ? 'مثال: KSH-123456' : 'e.g., KSH-123456',
    trackBtn: isAr ? 'تتبع الآن 🔍' : 'Track Order 🔍',
    notFound: isAr ? 'لم يتم العثور على طلب بهذا الرقم. تأكد من الرقم وحاول مرة أخرى.' : 'No order found with this ID. Please check and try again.',
    orderDetails: isAr ? 'تفاصيل الطلب' : 'Order Details',
    customer: isAr ? 'العميل:' : 'Customer:',
    gov: isAr ? 'المحافظة والعنوان:' : 'Governorate & Address:',
    delivery: isAr ? 'مدة التوصيل المتوقعة:' : 'Est. Delivery:',
    total: isAr ? 'الإجمالي شامل الشحن:' : 'Total (incl. Shipping):',
    currency: isAr ? 'ج.م' : 'EGP',
    steps: [
      { key: 'pending', title: isAr ? 'تم استلام الطلب وقيد المراجعة' : 'Order Received & Reviewing', desc: isAr ? 'نراجع تفاصيل طلبك وتأكيد الدفع' : 'Verifying order & payment details' },
      { key: 'packed', title: isAr ? 'تم تجهيز الطلب' : 'Order Packed', desc: isAr ? 'تم تغليف طلبك وتجهيزه للشحن' : 'Package is packed and ready' },
      { key: 'shipped', title: isAr ? 'خرج مع مندوب الشحن' : 'Out for Delivery / Shipped', desc: isAr ? 'طلبك في الطريق إليك الآن' : 'Your package is on the way' },
      { key: 'delivered', title: isAr ? 'تم التوصيل بنجاح' : 'Delivered Successfully', desc: isAr ? 'نتمنى لك تجربة رائعة مع كشافة' : 'Enjoy your discovery from Kashafa!' }
    ]
  };

  const getStepIndex = (status: string) => {
    if (status === 'Delivered' || status === 'delivered') return 3;
    if (status === 'Shipped' || status === 'shipped') return 2;
    if (status === 'Packed' || status === 'packed') return 1;
    return 0;
  };

  const isCancelled = foundOrder && (foundOrder.status === 'Cancelled' || foundOrder.status === 'ملغي');
  const canCancel = foundOrder && !isCancelled && (foundOrder.status === 'Pending' || foundOrder.status === 'pending');

  return (
    <div style={{ minHeight: '75vh', padding: '50px 20px', direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left', maxWidth: '750px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <span style={{ backgroundColor: '#E8F0EC', color: '#2D473B', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800' }}>
          ● {isAr ? 'تتبع حي مباشر' : 'LIVE TRACKING'}
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: '14px 0 8px 0' }}>{t.title}</h1>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>{t.subtitle}</p>
      </div>

      <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '35px', flexWrap: 'wrap' }}>
        <input
          type="text"
          required
          placeholder={t.placeholder}
          value={orderInput}
          onChange={(e) => setOrderInput(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '14px 20px', borderRadius: '25px', border: '1px solid #DAD8D2', fontSize: '1rem', outline: 'none', backgroundColor: '#FFFFFF', fontWeight: '800' }}
        />
        <button
          type="submit"
          style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '14px 30px', borderRadius: '25px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}
        >
          {t.trackBtn}
        </button>
      </form>

      {searched && !foundOrder && (
        <div style={{ backgroundColor: '#FDF2F2', color: '#D9534F', padding: '18px', borderRadius: '16px', textAlign: 'center', fontWeight: '700' }}>
          {t.notFound}
        </div>
      )}

      {foundOrder && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '24px', border: isCancelled ? '2px solid #DC2626' : '1px solid #DAD8D2', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          
          {isCancelled && (
            <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '14px 18px', borderRadius: '14px', fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>
              ⚠️ {isAr ? 'هذا الطلب ملغي' : 'This Order is Cancelled'}
              {foundOrder.cancelReason ? ` — (${foundOrder.cancelReason})` : ''}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EAE6DF', paddingBottom: '18px', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '700' }}>{t.orderDetails}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>{foundOrder.id}</h2>
                <button
                  type="button"
                  onClick={() => handleCopyId(foundOrder.id)}
                  style={{ backgroundColor: '#F5F2EC', border: '1px solid #DAD8D2', padding: '4px 10px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', color: '#20232B' }}
                >
                  {copied ? (isAr ? '✓ تم النسخ' : '✓ Copied') : (isAr ? '📋 نسخ' : '📋 Copy')}
                </button>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#444' }}>
              <div><strong>{t.customer}</strong> {foundOrder.customerName}</div>
              <div><strong>{t.gov}</strong> {foundOrder.address || foundOrder.governorate}</div>
              {foundOrder.deliveryDays && <div><strong>{t.delivery}</strong> {foundOrder.deliveryDays}</div>}
              <div><strong>{t.total}</strong> <span style={{ color: '#2D473B', fontWeight: '900' }}>{foundOrder.totalAmount || foundOrder.total} {t.currency}</span></div>
            </div>
          </div>

          {!isCancelled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: '30px' }}>
              {t.steps.map((step, idx) => {
                const currentIdx = getStepIndex(foundOrder.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', opacity: isCompleted ? 1 : 0.45 }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#2D473B' : '#E5E1D8',
                      color: isCompleted ? '#A6C96A' : '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      flexShrink: 0,
                      border: isCurrent ? '3px solid #A6C96A' : 'none'
                    }}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#20232B' }}>{step.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '3px' }}>{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {canCancel && !showCancelBox && (
            <div style={{ borderTop: '1px solid #EAE6DF', paddingTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setShowCancelBox(true)}
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', padding: '12px 24px', borderRadius: '20px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                {isAr ? 'إلغاء هذا الطلب ❌' : 'Cancel This Order ❌'}
              </button>
            </div>
          )}

          {showCancelBox && (
            <div style={{ borderTop: '1px solid #EAE6DF', paddingTop: '20px' }}>
              <p style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '10px', color: '#DC2626' }}>
                {isAr ? 'هل أنت متأكد من رغبتك في إلغاء الطلب؟ اذكر السبب:' : 'Are you sure you want to cancel? Reason:'}
              </p>
              <input
                type="text"
                placeholder={isAr ? 'اكتب سبب الإلغاء (اختياري)' : 'Reason for cancellation'}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DAD8D2', marginBottom: '12px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCancelOrder}
                  style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}
                >
                  {isAr ? 'تأكيد الإلغاء' : 'Confirm Cancellation'}
                </button>
                <button
                  onClick={() => setShowCancelBox(false)}
                  style={{ backgroundColor: '#E5E1D8', color: '#20232B', border: 'none', padding: '10px 20px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}
                >
                  {isAr ? 'تراجع' : 'Back'}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}