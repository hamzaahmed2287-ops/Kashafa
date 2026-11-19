'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/app/layout';
import { EGYPT_GOVERNORATES } from '@/utils/egyptData';
import { api } from '@/utils/api'; // 👈 استدعاء الـ API للربط مع قاعدة البيانات

export default function CheckoutPage() {
  const lang = useLang();
  const isAr = lang === 'AR';

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [selectedGov, setSelectedGov] = useState<string>('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'instapay' | 'vodafone'>('cod');
  const [receiptFile, setReceiptFile] = useState<string>('');
  
  const [paymentSettings, setPaymentSettings] = useState({
    vodafoneCash1: '01012345678',
    vodafoneCash2: '01098765432',
    instapayHandle: 'kashafa@instapay'
  });
  const [selectedWallet, setSelectedWallet] = useState('');
  const [savedRates, setSavedRates] = useState<any[]>([]);
  
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');

  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedCart = JSON.parse(localStorage.getItem('kashafa_cart') || '[]');
      setCartItems(savedCart);
    } catch (e) {}

    try {
      const currentUser = JSON.parse(localStorage.getItem('kashafa_current_user') || 'null');
      if (currentUser) {
        if (currentUser.fullName || currentUser.name) setFullName(currentUser.fullName || currentUser.name);
      }
    } catch (e) {}

    try {
      const localRates = JSON.parse(localStorage.getItem('kashafa_shipping_rates') || '[]');
      setSavedRates(localRates);
    } catch (e) {}

    const fetchPaymentAndSettings = async () => {
      try {
        const rates = await api.getShippingRates();
        if (rates && Array.isArray(rates) && rates.length > 0) {
          setSavedRates(rates);
        }
      } catch (e) {}

      try {
        const settings = await (api as any).getPaymentSettings?.();
        if (settings) {
          setPaymentSettings(settings);
          if (settings.vodafoneCash1) setSelectedWallet(settings.vodafoneCash1);
        }
      } catch (err) {
        if (typeof window !== 'undefined') {
          const savedPayment = localStorage.getItem('kashafa_payment_settings');
          if (savedPayment) {
            try {
              const parsed = JSON.parse(savedPayment);
              setPaymentSettings(parsed);
              if (parsed.vodafoneCash1) setSelectedWallet(parsed.vodafoneCash1);
            } catch (e) {}
          }
        }
      }
    };

    fetchPaymentAndSettings();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => {
    const numPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
    return sum + numPrice * (item.quantity || 1);
  }, 0);

  const activeGovObj = EGYPT_GOVERNORATES.find((g) => g.id === selectedGov);
  const matchedRate = savedRates.find((r: any) => String(r.id) === String(selectedGov) || String(r.nameAr) === String(activeGovObj?.nameAr));

  const shipping = cartItems.length > 0 
    ? (matchedRate ? Number(matchedRate.shippingCost ?? matchedRate.price ?? 50) : (activeGovObj ? activeGovObj.shippingFee : 50)) 
    : 0;
  
  const deliveryDaysText = matchedRate 
    ? (isAr ? (matchedRate.deliveryDaysAr || '2 - 4 أيام عمل') : (matchedRate.deliveryDaysEn || '2 - 4 Business Days'))
    : (isAr ? '2 - 4 أيام عمل' : '2 - 4 Business Days');

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedPromo.value) / 100);
    } else {
      discountAmount = Number(appliedPromo.value) || 0;
    }
  }

  const total = Math.max(0, subtotal - discountAmount) + shipping;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) return;

    const savedPromos = JSON.parse(localStorage.getItem('kashafa_promo_codes') || '[]');
    const found = savedPromos.find((p: any) => p.code === cleanCode && p.active !== false);

    if (found) {
      setAppliedPromo(found);
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError(isAr ? '⚠️ البرومو كود غير صحيح أو منتهي الصلاحية' : '⚠️ Invalid or expired promo code');
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !selectedGov || !address) {
      alert(isAr ? 'برجاء إدخال الاسم ورقم الموبايل واختيار المحافظة والعنوان بالكامل' : 'Please fill in your name, phone, governorate, and address');
      return;
    }
    if ((paymentMethod === 'instapay' || paymentMethod === 'vodafone') && !receiptFile) {
      alert(isAr ? 'برجاء إرفاق صورة إيصال التحويل لتأكيد الطلب' : 'Please upload the transfer screenshot to confirm');
      return;
    }

    setLoading(true);
    const generatedId = 'KSH-' + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(generatedId);

    const currentUser = JSON.parse(localStorage.getItem('kashafa_current_user') || 'null');
    const govNameStr = activeGovObj ? (isAr ? activeGovObj.nameAr : activeGovObj.nameEn) : selectedGov;

    const orderPayload = {
      id: generatedId,
      customerName: fullName,
      phone,
      altPhone,
      governorate: govNameStr,
      address: `${govNameStr} - ${address}`,
      items: cartItems,
      subtotal,
      shipping,
      discountAmount,
      promoCode: appliedPromo ? appliedPromo.code : null,
      deliveryDays: deliveryDaysText,
      totalAmount: total,
      paymentMethod,
      receiptImage: receiptFile || '',
      targetWallet: paymentMethod === 'cod' ? null : (selectedWallet || paymentSettings.vodafoneCash1),
      userEmail: currentUser ? currentUser.email : null,
      createdAt: new Date().toISOString()
    };

    try {
      // 👈 إرسال الطلب وحفظه في قاعدة بيانات SQL Server عبر الـ API
      await api.createOrder(orderPayload);

      // حفظ احتياطي محلي لتجربة المستخدم السريعة
      const existingOrders = JSON.parse(localStorage.getItem('kashafa_admin_orders') || '[]');
      localStorage.setItem('kashafa_admin_orders', JSON.stringify([orderPayload, ...existingOrders]));

      if (currentUser) {
        const earnedPoints = Math.max(20, Math.floor(subtotal * 0.1));
        currentUser.points = (currentUser.points || 0) + earnedPoints;
        localStorage.setItem('kashafa_current_user', JSON.stringify(currentUser));
      }

      localStorage.removeItem('kashafa_cart');
      window.dispatchEvent(new Event('storage'));
      setOrderSubmitted(true);
    } catch (err) {
      console.error('Error submitting order to database:', err);
      alert(isAr ? '⚠️ حدث خطأ أثناء إرسال الطلب لقاعدة البيانات. حاول مرة أخرى.' : '⚠️ Error submitting order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSubmitted) {
    return (
      <div style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', direction: isAr ? 'rtl' : 'ltr' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#A6C96A', color: '#20232B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', margin: '0 auto 18px' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#20232B', marginBottom: '10px' }}>
            {isAr ? 'تم استلام طلبك بنجاح في قاعدة البيانات!' : 'Order Confirmed & Saved in Database!'}
          </h2>
          {orderNumber && (
            <div style={{ display: 'inline-block', backgroundColor: '#F5F2EC', border: '1px solid #DAD8D2', padding: '8px 18px', borderRadius: '12px', fontWeight: '800', color: '#20232B', marginBottom: '14px', fontSize: '0.95rem' }}>
              {isAr ? `رقم الطلب: ${orderNumber}` : `Order ID: ${orderNumber}`}
            </div>
          )}
          <p style={{ color: '#666', marginBottom: '28px' }}>
            {isAr ? 'شكراً لتسوقك من كشافة. تم تسجيل أوردرك بدقة في النظام.' : 'Thank you for shopping with KASHAFA.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/track-order?id=${orderNumber}`} style={{ backgroundColor: '#20232B', color: '#F5F2EC', padding: '14px 28px', borderRadius: '30px', fontWeight: '800', textDecoration: 'none' }}>
              {isAr ? 'تتبع حالة الطلب' : 'Track Your Order'}
            </Link>
            <Link href="/" style={{ backgroundColor: '#A6C96A', color: '#20232B', padding: '14px 28px', borderRadius: '30px', fontWeight: '800', textDecoration: 'none' }}>
              {isAr ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px 60px', maxWidth: '1150px', margin: '0 auto', direction: isAr ? 'rtl' : 'ltr' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#20232B', margin: 0 }}>
          {isAr ? 'إتمام الطلب السريع' : 'Express Checkout'}
        </h1>
        <Link href="/cart" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #DAD8D2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#20232B', textDecoration: 'none', fontWeight: 'bold' }}>
          {isAr ? '←' : '→'}
        </Link>
      </div>

      <form onSubmit={handleConfirmOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1px solid #DAD8D2', gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '18px', color: '#20232B' }}>
            {isAr ? '1. بيانات الاستلام' : '1. Delivery Details'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={isAr ? 'الاسم الكامل' : 'Full Name'} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #DAD8D2', outline: 'none' }} />
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={isAr ? 'رقم الموبايل الأساسي' : 'Primary Mobile'} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #DAD8D2', outline: 'none' }} />
            <input type="tel" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} placeholder={isAr ? 'رقم هاتف بديل (اختياري)' : 'Alternative Phone'} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #DAD8D2', outline: 'none' }} />

            <select required value={selectedGov} onChange={(e) => setSelectedGov(e.target.value)} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #DAD8D2', backgroundColor: '#FFFFFF', cursor: 'pointer', fontWeight: '700' }}>
              <option value="" disabled>{isAr ? '-- اختر المحافظة لحساب الشحن --' : '-- Select Governorate --'}</option>
              {EGYPT_GOVERNORATES.map((gov) => {
                const customRate = savedRates.find((r: any) => String(r.id) === String(gov.id) || String(r.nameAr) === String(gov.nameAr));
                const govFee = customRate ? Number(customRate.shippingCost ?? customRate.price ?? gov.shippingFee) : gov.shippingFee;
                return (
                  <option key={gov.id} value={gov.id}>
                    {isAr ? `${gov.nameAr} (شحن: ${govFee} ج.م)` : `${gov.nameEn} (Shipping: ${govFee} EGP)`}
                  </option>
                );
              })}
            </select>

            <textarea rows={3} required value={address} onChange={(e) => setAddress(e.target.value)} placeholder={isAr ? 'العنوان بالتفصيل' : 'Detailed Address'} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #DAD8D2', outline: 'none' }} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px', color: '#20232B' }}>
            {isAr ? '2. اختر طريقة الدفع' : '2. Select Payment Method'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label onClick={() => setPaymentMethod('cod')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '14px', border: paymentMethod === 'cod' ? '2px solid #20232B' : '1px solid #DAD8D2', backgroundColor: paymentMethod === 'cod' ? '#F9F8F6' : '#FFFFFF', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span style={{ fontWeight: '700' }}>{isAr ? 'الدفع عند الاستلام (كاش)' : 'Cash on Delivery (COD)'}</span>
              </div>
            </label>

            <div onClick={() => setPaymentMethod('instapay')} style={{ padding: '16px', borderRadius: '14px', border: paymentMethod === 'instapay' ? '2px solid #20232B' : '1px solid #DAD8D2', backgroundColor: paymentMethod === 'instapay' ? '#F9F8F6' : '#FFFFFF', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'instapay'} onChange={() => { setPaymentMethod('instapay'); setSelectedWallet(paymentSettings.instapayHandle); }} />
                  <span style={{ fontWeight: '700' }}>InstaPay ({paymentSettings.instapayHandle})</span>
                </div>
              </div>
              {paymentMethod === 'instapay' && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #DAD8D2' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#2D473B' }}>
                    {isAr ? `يرجى التحويل على حساب إنستا باي: ${paymentSettings.instapayHandle} ثم ارفع إيصال التحويل:` : `Please transfer to InstaPay: ${paymentSettings.instapayHandle} and upload receipt:`}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setReceiptFile(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
              )}
            </div>

            <div onClick={() => setPaymentMethod('vodafone')} style={{ padding: '16px', borderRadius: '14px', border: paymentMethod === 'vodafone' ? '2px solid #20232B' : '1px solid #DAD8D2', backgroundColor: paymentMethod === 'vodafone' ? '#F9F8F6' : '#FFFFFF', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'vodafone'} onChange={() => { setPaymentMethod('vodafone'); setSelectedWallet(paymentSettings.vodafoneCash1); }} />
                  <span style={{ fontWeight: '700' }}>Vodafone Cash</span>
                </div>
              </div>
              {paymentMethod === 'vodafone' && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #DAD8D2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2D473B' }}>
                    {isAr ? 'اختر الرقم الذي قمت بالتحويل عليه:' : 'Select the number you transferred to:'}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', cursor: 'pointer' }}>
                      <input type="radio" name="vodafoneNum" checked={selectedWallet === paymentSettings.vodafoneCash1} onChange={() => setSelectedWallet(paymentSettings.vodafoneCash1)} />
                      <span style={{ direction: 'ltr' }}>{paymentSettings.vodafoneCash1}</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', cursor: 'pointer' }}>
                      <input type="radio" name="vodafoneNum" checked={selectedWallet === paymentSettings.vodafoneCash2} onChange={() => setSelectedWallet(paymentSettings.vodafoneCash2)} />
                      <span style={{ direction: 'ltr' }}>{paymentSettings.vodafoneCash2}</span>
                    </label>
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setReceiptFile(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} style={{ marginTop: '6px' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '26px', borderRadius: '20px', border: '1px solid #DAD8D2' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: '#20232B' }}>
            {isAr ? 'مراجعة الطلب' : 'Order Review'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', maxHeight: '220px', overflowY: 'auto' }}>
            {cartItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #F0EDE6' }}>
                <img src={item.image} alt="" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{isAr ? item.title?.AR || item.title : item.title?.EN || item.title}</div>
                  
                  <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '2px 0' }}>
                    <span>Qty: {item.quantity || 1}</span>
                    {item.selectedSize && <span style={{ color: '#B45309', fontWeight: '800' }}>• {isAr ? 'المقاس:' : 'Size:'} {item.selectedSize}</span>}
                    {item.selectedColor && <span style={{ color: '#2D473B', fontWeight: '800' }}>• {isAr ? 'اللون:' : 'Color:'} {item.selectedColor}</span>}
                  </div>

                  <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#2D473B' }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '20px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'stretch' }}>
              <input
                type="text"
                placeholder={isAr ? 'أدخل برومو كود الخصم' : 'Enter Promo Code'}
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: '10px', border: '1px solid #DAD8D2', textTransform: 'uppercase', fontWeight: '800', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                style={{ backgroundColor: '#20232B', color: '#F5F2EC', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0 }}
              >
                {isAr ? 'تطبيق' : 'Apply'}
              </button>
            </div>
            {promoError && <div style={{ color: '#DC2626', fontSize: '0.8rem', fontWeight: '700', marginTop: '6px' }}>{promoError}</div>}
            {appliedPromo && (
              <div style={{ color: '#059669', fontSize: '0.85rem', fontWeight: '800', marginTop: '6px' }}>
                ✓ {isAr ? `تم تطبيق الكود (${appliedPromo.code}) بنجاح!` : `Promo code (${appliedPromo.code}) applied!`}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
            <span style={{ fontWeight: '700' }}>{subtotal} {isAr ? 'ج.م' : 'EGP'}</span>
          </div>

          {appliedPromo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#059669', fontWeight: '800' }}>
              <span>{isAr ? 'قيمة الخصم' : 'Discount'}</span>
              <span>-{discountAmount} {isAr ? 'ج.م' : 'EGP'}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>{isAr ? 'تكلفة الشحن' : 'Shipping'}</span>
            <span style={{ fontWeight: '700' }}>{shipping} {isAr ? 'ج.م' : 'EGP'}</span>
          </div>

          {selectedGov && (
            <div style={{ backgroundColor: '#E8F0EC', color: '#2D473B', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800', marginBottom: '14px' }}>
              🚚 {isAr ? 'مدة التوصيل المتوقعة:' : 'Est. Delivery:'} {deliveryDaysText}
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #DAD8D2', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '22px', fontSize: '1.15rem', fontWeight: '900' }}>
            <span>{isAr ? 'الإجمالي النهائي' : 'Total'}</span>
            <span>{total} {isAr ? 'ج.م' : 'EGP'}</span>
          </div>

          <button type="submit" disabled={cartItems.length === 0 || loading} style={{ width: '100%', backgroundColor: cartItems.length === 0 || loading ? '#DAD8D2' : '#A6C96A', color: '#20232B', border: 'none', padding: '15px', borderRadius: '30px', fontWeight: '900', cursor: cartItems.length === 0 || loading ? 'not-allowed' : 'pointer' }}>
            {loading ? (isAr ? 'جاري إرسال الطلب...' : 'Processing...') : (isAr ? 'تأكيد وإتمام الطلب 🚀' : 'Confirm & Place Order 🚀')}
          </button>
        </div>
      </form>
    </div>
  );
}