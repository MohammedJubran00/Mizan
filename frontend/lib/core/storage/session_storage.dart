import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../features/auth/domain/entities/user_entity.dart';

class WorkspaceSession {
  const WorkspaceSession({
    required this.id,
    required this.name,
    required this.role,
  });

  final String id;
  final String name;
  final String role;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'role': role,
      };

  factory WorkspaceSession.fromJson(Map<String, dynamic> json) {
    return WorkspaceSession(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Workspace',
      role: json['role'] as String? ?? 'MEMBER',
    );
  }
}

/// Persists authenticated user + workspace for dashboard chrome.
class SessionStorage {
  SessionStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const _userKey = 'mizan_user';
  static const _workspaceKey = 'mizan_workspace';

  final FlutterSecureStorage _storage;

  Future<void> saveUser(UserEntity user) {
    return _storage.write(
      key: _userKey,
      value: jsonEncode({
        'id': user.id,
        'fullName': user.fullName,
        'email': user.email,
      }),
    );
  }

  Future<UserEntity?> readUser() async {
    final raw = await _storage.read(key: _userKey);
    if (raw == null || raw.isEmpty) return null;
    final json = jsonDecode(raw) as Map<String, dynamic>;
    return UserEntity(
      id: json['id'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      email: json['email'] as String? ?? '',
    );
  }

  Future<void> saveWorkspace(WorkspaceSession workspace) {
    return _storage.write(
      key: _workspaceKey,
      value: jsonEncode(workspace.toJson()),
    );
  }

  Future<WorkspaceSession?> readWorkspace() async {
    final raw = await _storage.read(key: _workspaceKey);
    if (raw == null || raw.isEmpty) return null;
    return WorkspaceSession.fromJson(
      jsonDecode(raw) as Map<String, dynamic>,
    );
  }

  Future<void> clear() async {
    await _storage.delete(key: _userKey);
    await _storage.delete(key: _workspaceKey);
  }
}
