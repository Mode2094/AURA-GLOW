import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'firebase_options.dart';
import 'screens/orders_screen.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await NotificationService.init();

  // Subscribe to FCM topic for admin push notifications
  try {
    await FirebaseMessaging.instance.subscribeToTopic('aura_admin');
  } catch (_) {}

  await Supabase.initialize(
    url: 'https://blozysudthytzkfepgqc.supabase.co',
    anonKey: 'sb_publishable_tRk0OqQQQlxCt8dlngXwfw_DtrqVaXM',
  );
  runApp(const AuraGlowApp());
}

// Arabic-first localization for the admin panel: Arabic locale, RTL layout,
// and Arabic strings for Material's built-in widgets (dialogs, pickers, tooltips).
const appLocale = Locale('ar');
const appSupportedLocales = [Locale('ar'), Locale('en')];
const appLocalizationsDelegates = <LocalizationsDelegate<dynamic>>[
  GlobalMaterialLocalizations.delegate,
  GlobalWidgetsLocalizations.delegate,
  GlobalCupertinoLocalizations.delegate,
];

class AuraGlowApp extends StatelessWidget {
  const AuraGlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'أورا جلو - لوحة التحكم',
      debugShowCheckedModeBanner: false,
      locale: appLocale,
      supportedLocales: appSupportedLocales,
      localizationsDelegates: appLocalizationsDelegates,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF78350F),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const OrdersScreen(),
    );
  }
}
