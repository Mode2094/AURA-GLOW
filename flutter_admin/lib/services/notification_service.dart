import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationService {
  static final _plugin = FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    // Create custom channel with long vibration pattern
    const androidChannel = AndroidNotificationChannel(
      'aura_orders',
      'AURA GLOW',
      description: 'إشعارات الطلبات',
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
    );

    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    await _plugin.initialize(const InitializationSettings(android: android, iOS: ios));

    // Register the custom channel
    await _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>()?.createNotificationChannel(androidChannel);

    // Request permissions on Android 13+
    await _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>()?.requestNotificationsPermission();

    // Listen for FCM messages (foreground)
    FirebaseMessaging.onMessage.listen(_showFcmNotification);
    // Background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  @pragma('vm:entry-point')
  static Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
    await _showLocalNotification(
      message.notification?.title ?? 'AURA GLOW',
      message.notification?.body ?? '',
    );
  }

  static Future<void> _showFcmNotification(RemoteMessage message) async {
    await _showLocalNotification(
      message.notification?.title ?? 'AURA GLOW',
      message.notification?.body ?? '',
    );
  }

  static Future<void> _showLocalNotification(String title, String body) async {
    final vibration = Int64List.fromList([500, 200, 500, 200, 1000, 500, 1000, 500, 1000]);
    await _plugin.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title, body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          'aura_orders', 'AURA GLOW',
          channelDescription: 'إشعارات الطلبات',
          importance: Importance.max,
          priority: Priority.max,
          playSound: true,
          enableVibration: true,
          vibrationPattern: vibration,
          showWhen: true,
          color: const Color(0xFF78350F),
          visibility: NotificationVisibility.public,
          fullScreenIntent: true,
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
    );
  }

  static Future<void> show({required String title, required String body}) async {
    await _showLocalNotification(title, body);
  }
}
