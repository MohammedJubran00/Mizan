import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_strings.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../auth_dependencies.dart';
import '../widgets/auth_card.dart';
import '../widgets/auth_header.dart';
import '../widgets/auth_switch_prompt.dart';
import '../widgets/auth_text_field.dart';
import '../widgets/footer_links.dart';
import '../widgets/password_field.dart';
import '../widgets/primary_button.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  CancelToken? _cancelToken;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _cancelToken?.cancel();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_isLoading) return;

    FocusScope.of(context).unfocus();
    setState(() => _errorMessage = null);

    final isValid = _formKey.currentState?.validate() ?? false;
    if (!isValid) return;

    _cancelToken?.cancel();
    _cancelToken = CancelToken();

    setState(() => _isLoading = true);

    try {
      final deps = AuthDependencyContainer.instance;
      await deps.loginUseCase(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        cancelToken: _cancelToken,
      );

      if (!mounted) return;
      context.go(AppRoutes.dashboard);
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
                          title: AppStrings.welcomeBack,
                          subtitle: AppStrings.loginSubtitle,
                        ),
                        SizedBox(height: sectionGap),
                        AuthCard(
                          child: Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
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
                                  textInputAction: TextInputAction.done,
                                  enabled: !_isLoading,
                                  autofillHints: const [
                                    AutofillHints.password,
                                  ],
                                  validator: _validatePassword,
                                  onFieldSubmitted: (_) => _submit(),
                                ),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: TextButton(
                                    onPressed: _isLoading
                                        ? null
                                        : () {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(
                                              const SnackBar(
                                                content: Text(
                                                  'Password recovery coming soon.',
                                                ),
                                              ),
                                            );
                                          },
                                    style: TextButton.styleFrom(
                                      foregroundColor: AppColors.blue,
                                      padding: const EdgeInsets.only(top: 8),
                                      minimumSize: Size.zero,
                                      tapTargetSize:
                                          MaterialTapTargetSize.shrinkWrap,
                                    ),
                                    child: Text(
                                      AppStrings.forgotPassword,
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 12.5,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ),
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
                                  label: AppStrings.login,
                                  isLoading: _isLoading,
                                  onPressed: _isLoading ? null : _submit,
                                ),
                              ],
                            ),
                          ),
                        ),
                        SizedBox(height: sectionGap * 0.9),
                        AuthSwitchPrompt(
                          prompt: AppStrings.noAccount,
                          actionLabel: AppStrings.signUp,
                          onAction: _isLoading
                              ? () {}
                              : () => context.go('/signup'),
                        ),
                        SizedBox(height: sectionGap),
                        const FooterLinks(),
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
    return null;
  }
}
