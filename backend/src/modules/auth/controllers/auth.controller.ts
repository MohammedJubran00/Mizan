import type { Request, Response } from 'express';

import { asyncHandler } from '../../../shared/utils/asyncHandler';
import type { LoginDto } from '../dto/login.dto';
import type { RegisterDto } from '../dto/register.dto';
import type { AuthService } from '../services/auth.service';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body as RegisterDto);
    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body as LoginDto);

    res.status(200).json({
      success: result.success,
      accessToken: result.accessToken,
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
      },
      workspace: result.workspace,
    });
  });
}
