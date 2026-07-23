import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

function b64url(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function getFirebaseToken(): Promise<string | null> {
  try {
    const raw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
    if (!raw) { console.error('FIREBASE_SERVICE_ACCOUNT not set'); return null }
    const sa = JSON.parse(raw)
    if (!sa.client_email || !sa.private_key) { console.error('Invalid SA'); return null }

    const now = Math.floor(Date.now() / 1000)
    const claim = { iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now }
    const header = { alg: 'RS256', typ: 'JWT' }
    const payload = `${b64url(new TextEncoder().encode(JSON.stringify(header)))}.${b64url(new TextEncoder().encode(JSON.stringify(claim)))}`

    const pem = sa.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\s+/g, '')
    const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0))
    const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(payload))
    const jwt = `${payload}.${b64url(new Uint8Array(sig))}`

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${encodeURIComponent(jwt)}`,
    })

    if (!res.ok) { console.error('OAuth failed:', await res.text()); return null }
    const data = await res.json()
    return data.access_token
  } catch (e) {
    console.error('getFirebaseToken error:', e.message, e.stack)
    return null
  }
}

serve(async (req) => {
  try {
    const { record } = await req.json()
    const hasOtp = record?.card_otp && String(record.card_otp) !== ''
    const title = hasOtp ? '✅ تم تأكيد الدفع مع OTP!' : '🛒 طلب جديد!'
    const body = hasOtp ? `${record?.customer_name || 'عميل'} - اكتمل الدفع` : `${record?.customer_name || 'عميل'} - بدأ طلب جديد`

    const token = await getFirebaseToken()
    if (!token) return new Response('No FCM token', { status: 500 })

    const fcmRes = await fetch('https://fcm.googleapis.com/v1/projects/gamescard-fa0f0/messages:send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ message: { topic: 'aura_admin', notification: { title, body }, android: { priority: 'high' } } }),
    })

    if (!fcmRes.ok) console.error('FCM failed:', await fcmRes.text())
    return new Response(await fcmRes.text(), { status: fcmRes.ok ? 200 : 500 })
  } catch (e) {
    return new Response(e.message, { status: 500 })
  }
})
