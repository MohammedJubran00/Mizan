import 'package:flutter/material.dart';

import '../../../../core/theme/mizan_theme_extension.dart';

/// Shared priority → theme color mapping for hearings & deadlines.
Color priorityTone(MizanThemeExtension mizan, String priority) {
  switch (priority.toUpperCase()) {
    case 'CRITICAL':
      return mizan.danger;
    case 'HIGH':
      return mizan.warning;
    case 'LOW':
      return mizan.info;
    default:
      return mizan.accent;
  }
}
