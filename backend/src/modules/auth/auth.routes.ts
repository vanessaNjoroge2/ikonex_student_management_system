import { Router } from 'express';
import { 
  AuthController, 
  loginSchema, 
  registerSchema, 
  refreshSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  sendVerificationSchema,
  verifyEmailSchema,
  sendLoginCodeSchema,
  verifyLoginCodeSchema
} from './auth.controller';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/admin/login', validate(loginSchema), AuthController.adminLogin);
router.post('/send-verification', validate(sendVerificationSchema), AuthController.sendVerification);
router.post('/verify-email', validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/send-login-code', validate(sendLoginCodeSchema), AuthController.sendLoginCode);
router.post('/verify-login-code', validate(verifyLoginCodeSchema), AuthController.verifyLoginCode);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.post('/logout', requireAuth(), AuthController.logout);

export default router;

