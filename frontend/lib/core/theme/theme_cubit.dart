import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ThemeState extends Equatable {
  const ThemeState({this.mode = ThemeMode.light});

  final ThemeMode mode;

  bool get isDark => mode == ThemeMode.dark;

  @override
  List<Object?> get props => [mode];
}

class ThemeCubit extends Cubit<ThemeState> {
  ThemeCubit({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage(),
        super(const ThemeState());

  static const _key = 'mizan_theme_mode';
  final FlutterSecureStorage _storage;

  Future<void> hydrate() async {
    final raw = await _storage.read(key: _key);
    if (raw == 'dark') {
      emit(const ThemeState(mode: ThemeMode.dark));
    } else {
      emit(const ThemeState(mode: ThemeMode.light));
    }
  }

  Future<void> toggle() async {
    final next = state.isDark ? ThemeMode.light : ThemeMode.dark;
    await _storage.write(key: _key, value: next == ThemeMode.dark ? 'dark' : 'light');
    emit(ThemeState(mode: next));
  }

  Future<void> setMode(ThemeMode mode) async {
    await _storage.write(
      key: _key,
      value: mode == ThemeMode.dark ? 'dark' : 'light',
    );
    emit(ThemeState(mode: mode));
  }
}
