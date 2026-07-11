import '../../domain/entities/user_entity.dart';

class UserModel {
  const UserModel({
    required this.id,
    required this.fullName,
    required this.email,
  });

  final String id;
  final String fullName;
  final String email;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      email: json['email'] as String,
    );
  }

  UserEntity toEntity() {
    return UserEntity(
      id: id,
      fullName: fullName,
      email: email,
    );
  }
}
