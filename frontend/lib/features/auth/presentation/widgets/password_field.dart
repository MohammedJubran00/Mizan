import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import 'auth_text_field.dart';

class PasswordField extends StatefulWidget {
  const PasswordField({
    super.key,
    required this.label,
    required this.controller,
    this.hintText,
    this.textInputAction,
    this.validator,
    this.enabled = true,
    this.autofillHints,
    this.onFieldSubmitted,
    this.labelTrailing,
  });

  final String label;
  final TextEditingController controller;
  final String? hintText;
  final TextInputAction? textInputAction;
  final String? Function(String?)? validator;
  final bool enabled;
  final Iterable<String>? autofillHints;
  final ValueChanged<String>? onFieldSubmitted;
  final Widget? labelTrailing;

  @override
  State<PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<PasswordField> {
  bool _obscured = true;

  @override
  Widget build(BuildContext context) {
    return AuthTextField(
      label: widget.label,
      controller: widget.controller,
      hintText: widget.hintText,
      prefixIcon: Icons.lock_outline_rounded,
      obscureText: _obscured,
      textInputAction: widget.textInputAction,
      validator: widget.validator,
      enabled: widget.enabled,
      autofillHints: widget.autofillHints,
      onFieldSubmitted: widget.onFieldSubmitted,
      labelTrailing: widget.labelTrailing,
      suffixIcon: IconButton(
        onPressed: widget.enabled
            ? () => setState(() => _obscured = !_obscured)
            : null,
        icon: Icon(
          _obscured
              ? Icons.visibility_outlined
              : Icons.visibility_off_outlined,
          size: 20,
          color: AppColors.navyMuted,
        ),
        tooltip: _obscured ? 'Show password' : 'Hide password',
      ),
    );
  }
}
