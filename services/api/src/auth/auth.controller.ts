import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from '@f5/schemas';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    // Validate with Zod
    const input = loginSchema.parse(body);
    return this.authService.login(input);
  }

  @Post('register')
  async register(@Body() body: any) {
    // Validate with Zod
    const input = registerSchema.parse(body);
    return this.authService.register(input);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
