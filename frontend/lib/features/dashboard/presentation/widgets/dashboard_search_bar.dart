import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/theme/design_tokens.dart';
import '../../../../core/theme/mizan_theme_extension.dart';
import '../../../../core/utils/debouncer.dart';

/// Compact search field — debounces [onChanged] to avoid per-keystroke API calls.
class DashboardSearchBar extends StatefulWidget {
  const DashboardSearchBar({
    super.key,
    this.controller,
    this.onChanged,
    this.hintText = AppStrings.searchPlaceholder,
    this.debounce = DesignTokens.searchDebounce,
  });

  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final String hintText;
  final Duration debounce;

  @override
  State<DashboardSearchBar> createState() => _DashboardSearchBarState();
}

class _DashboardSearchBarState extends State<DashboardSearchBar> {
  late final Debouncer _debouncer;

  @override
  void initState() {
    super.initState();
    _debouncer = Debouncer(delay: widget.debounce);
  }

  @override
  void dispose() {
    _debouncer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final theme = Theme.of(context);
    final mizan = context.mizanTheme;
    final width = AppDimensions.searchBarWidth(size);
    final height = AppDimensions.appBarHeight(size) * 0.58;
    final radius = height * 0.35;

    return SizedBox(
      width: width,
      height: height,
      child: TextField(
        controller: widget.controller,
        onChanged: (value) {
          if (widget.onChanged == null) return;
          _debouncer.run(() => widget.onChanged!(value));
        },
        style: GoogleFonts.plusJakartaSans(
          fontSize: height * 0.36,
          fontWeight: FontWeight.w500,
          color: theme.colorScheme.onSurface,
        ),
        decoration: InputDecoration(
          isDense: true,
          hintText: widget.hintText,
          hintStyle: GoogleFonts.plusJakartaSans(
            fontSize: height * 0.36,
            fontWeight: FontWeight.w400,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.45),
          ),
          prefixIcon: Icon(
            Icons.search_rounded,
            size: height * 0.48,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.45),
          ),
          filled: true,
          fillColor: mizan.contentBackground,
          contentPadding: EdgeInsets.symmetric(vertical: height * 0.2),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(radius),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(radius),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(radius),
            borderSide: BorderSide(
              color: mizan.accent.withValues(alpha: 0.55),
              width: 1.2,
            ),
          ),
        ),
      ),
    );
  }
}
