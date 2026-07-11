import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/theme/app_colors.dart';
import '../auth_dependencies.dart';
import '../widgets/auth_card.dart';
import '../widgets/auth_header.dart';
import '../widgets/auth_switch_prompt.dart';
import '../widgets/auth_text_field.dart';
import '../widgets/password_field.dart';
import '../widgets/primary_button.dart';
import '../widgets/terms_checkbox.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  CancelToken? _cancelToken;
  bool _isLoading = false;
  bool _agreedToTerms = false;
  String? _errorMessage;
  String? _termsError;

  @override
  void dispose() {
    _cancelToken?.cancel();
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_isLoading) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _errorMessage = null;
      _termsError = null;
    });

    final isValid = _formKey.currentState?.validate() ?? false;
    if (!_agreedToTerms) {
      setState(() => _termsError = AppStrings.termsRequired);
    }
    if (!isValid || !_agreedToTerms) return;

    _cancelToken?.cancel();
    _cancelToken = CancelToken();

    setState(() => _isLoading = true);

    try {
      final deps = AuthDependencyContainer.instance;
      final result = await deps.registerUseCase(
        fullName: _fullNameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        cancelToken: _cancelToken,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.message)),
      );
      context.go('/login');
    } on ApiException catch (e) {
      if (e.message == 'Request cancelled.') return;
      if (!mounted) return;
      setState(() => _errorMessage = e.message);
    } catch (_) {
      if (!mounted) return;
      setState(
        () => _errorMessage = 'Something went wrong. Please try again.',
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final padding = AppDimensions.authPagePadding(size);
    final fieldGap = AppDimensions.authFieldGap(size);
    final sectionGap = AppDimensions.authSectionGap(size);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: padding,
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - padding.vertical,
                ),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(
                      maxWidth: AppDimensions.maxAuthCardWidth,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const AuthHeader(
                          title: AppStrings.createAccountTitle,
                          subtitle: AppStrings.createAccountSubtitle,
                        ),
                        SizedBox(height: sectionGap),
                        AuthCard(
                          child: Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                AuthTextField(
                                  label: AppStrings.fullName,
                                  controller: _fullNameController,
                                  hintText: AppStrings.fullNameHint,
                                  prefixIcon: Icons.person_outline_rounded,
                                  textInputAction: TextInputAction.next,
                                  enabled: !_isLoading,
                                  autofillHints: const [AutofillHints.name],
                                  validator: _validateFullName,
                                ),
                                SizedBox(height: fieldGap),
                                AuthTextField(
                                  label: AppStrings.emailAddress,
                                  controller: _emailController,
                                  hintText: AppStrings.emailHint,
                                  prefixIcon: Icons.mail_outline_rounded,
                                  keyboardType: TextInputType.emailAddress,
                                  textInputAction: TextInputAction.next,
                                  enabled: !_isLoading,
                                  autofillHints: const [AutofillHints.email],
                                  validator: _validateEmail,
                                ),
                                SizedBox(height: fieldGap),
                                PasswordField(
                                  label: AppStrings.password,
                                  controller: _passwordController,
                                  textInputAction: TextInputAction.next,
                                  enabled: !_isLoading,
                                  autofillHints: const [
                                    AutofillHints.newPassword,
                                  ],
                                  validator: _validatePassword,
                                ),
                                SizedBox(height: fieldGap),
                                PasswordField(
                                  label: AppStrings.confirmPassword,
                                  controller: _confirmPasswordController,
                                  textInputAction: TextInputAction.done,
                                  enabled: !_isLoading,
                                  autofillHints: const [
                                    AutofillHints.newPassword,
                                  ],
                                  validator: _validateConfirmPassword,
                                  onFieldSubmitted: (_) => _submit(),
                                ),
                                SizedBox(height: fieldGap),
                                TermsCheckbox(
                                  value: _agreedToTerms,
                                  enabled: !_isLoading,
                                  onChanged: (value) {
                                    setState(() {
                                      _agreedToTerms = value ?? false;
                                      if (_agreedToTerms) _termsError = null;
                                    });
                                  },
                                ),
                                if (_termsError != null) ...[
                                  const SizedBox(height: 6),
                                  Text(
                                    _termsError!,
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 12.5,
                                      color: AppColors.error,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                                if (_errorMessage != null) ...[
                                  SizedBox(height: fieldGap * 0.85),
                                  Text(
                                    _errorMessage!,
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 13.5,
                                      color: AppColors.error,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                                SizedBox(height: sectionGap * 0.85),
                                PrimaryButton(
                                  label: AppStrings.createAccount,
                                  isLoading: _isLoading,
                                  onPressed: _isLoading ? null : _submit,
                                ),
                              ],
                            ),
                          ),
                        ),
                        SizedBox(height: sectionGap * 0.9),
                        AuthSwitchPrompt(
                          prompt: AppStrings.haveAccount,
                          actionLabel: AppStrings.logIn,
                          onAction:
                              _isLoading ? () {} : () => context.go('/login'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  String? _validateFullName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return AppStrings.fullNameRequired;
    }
    return null;
  }

  String? _validateEmail(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) return AppStrings.emailRequired;
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
      return AppStrings.emailInvalid;
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) return AppStrings.passwordRequired;
    if (value.length < 8) return AppStrings.passwordMinLength;
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) return AppStrings.passwordRequired;
    if (value != _passwordController.text) {
      return AppStrings.passwordsDoNotMatch;
    }
    return null;
  }
}
