import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SidebarState extends Equatable {
  const SidebarState({this.collapsed = false});

  final bool collapsed;

  @override
  List<Object?> get props => [collapsed];
}

class SidebarCubit extends Cubit<SidebarState> {
  SidebarCubit({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage(),
        super(const SidebarState());

  static const _key = 'mizan_sidebar_collapsed';
  final FlutterSecureStorage _storage;

  Future<void> hydrate() async {
    final raw = await _storage.read(key: _key);
    emit(SidebarState(collapsed: raw == 'true'));
  }

  Future<void> toggle() async {
    final next = !state.collapsed;
    await _storage.write(key: _key, value: next ? 'true' : 'false');
    emit(SidebarState(collapsed: next));
  }
}
