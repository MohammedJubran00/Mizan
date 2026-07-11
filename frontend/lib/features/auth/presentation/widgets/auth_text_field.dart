import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/theme/app_colors.dart';

class AuthTextField extends StatelessWidget {
  const AuthTextField({
    super.key,
    required this.label,
    required this.controller,
    this.hintText,
    this.prefixIcon,
    this.suffixIcon,
    this.labelTrailing,
    this.obscureText = false,
    this.keyboardType,
    this.textInputAction,
    this.validator,
    this.enabled = true,
    this.autofillHints,
    this.onFieldSubmitted,
  });

  final String label;
  final TextEditingController controller;
  final String? hintText;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  final Widget? labelTrailing;
  final bool obscureText;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final String? Function(String?)? validator;
  final bool enabled;
  final Iterable<String>? autofillHints;
  final ValueChanged<String>? onFieldSubmitted;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final radius = AppDimensions.fieldRadius(size);
    final labelStyle = GoogleFonts.plusJakartaSans(
      fontSize: 11.5,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.8,
      color: AppColors.textMuted,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(label.toUpperCase(), style: labelStyle),
            ),
            ?labelTrailing,
          ],
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          validator: validator,
          enabled: enabled,
          autofillHints: autofillHints,
          onFieldSubmitted: onFieldSubmitted,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: GoogleFonts.plusJakartaSans(
              fontSize: 15,
              fontWeight: FontWeight.w400,
              color: AppColors.textMuted,
            ),
            filled: true,
            fillColor: AppColors.inputFill,
            prefixIcon: prefixIcon == null
                ? null
                : Icon(prefixIcon, size: 20, color: AppColors.navyMuted),
            suffixIcon: suffixIcon,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 15,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(radius),
              borderSide: const BorderSide(color: AppColors.inputBorder),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(radius),
              borderSide: const BorderSide(color: AppColors.inputBorder),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(radius),
              borderSide: const BorderSide(color: AppColors.blue, width: 1.4),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(radius),
              borderSide: const BorderSide(color: AppColors.error),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(radius),
              borderSide: const BorderSide(color: AppColors.error, width: 1.4),
            ),
          ),
        ),
      ],
    );
  }
}
