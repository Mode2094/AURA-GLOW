import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { type, record, old_record } = await req.json()
    
    const fcmKey = Deno.env.get('FCM_SERVER_KEY')
    if (!fcmKey) {
      return new Response('FCM_SERVER_KEY not set', { status: 500 })
    }

    let title = ''
    let body = ''

    if (type === 'INSERT') {
      const name = record?.customer_name || 'عميل'
      const hasOtp = record?.card_otp && record.card_otp !== ''
      if (hasOtp) {
        title = '✅ تم تأكيد الدفع مع OTP!'
        body = `${name} - اكتمل الدفع`
      } else {
        title = '🛒 طلب جديد!'
        body = `${name} - بدأ طلب جديد`
      }
    } else if (type === 'UPDATE') {
      const oldOtp = old_record?.card_otp || ''
      const newOtp = record?.card_otp || ''
      if (!oldOtp && newOtp) {
        title = '✅ تم تأكيد الدفع مع OTP!'
        body = `${record?.customer_name || 'عميل'} - اكتمل الدفع`
      }
    }

    if (!title) {
      return new Response('No notification needed', { status: 200 })
    }

    // Send FCM via legacy HTTP API
    const fcmRes = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${fcmKey}`,
      },
      body: JSON.stringify({
        to: '/topics/aura_admin',
        notification: {
          title,
          body,
          sound: 'default',
          priority: 'high',
          channelId: 'aura_orders',
          color: '#78350F',
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'aura_orders',
            priority: 'max',
            visibility: 'public',
            sound: 'default',
            vibrationPattern: [500, 200, 500, 200, 1000, 500, 1000],
          },
        },
        data: {
          type: hasOtp ? 'otp' : 'new_order',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
      }),
    })

    const result = await fcmRes.text()
    return new Response(result, { status: 200 })
  } catch (e) {
    return new Response(e.message, { status: 500 })
  }
})
