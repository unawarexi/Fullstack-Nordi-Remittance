// ============================================================================
// LOGIN PAGE - Authentication login with react-hook-form and Zod
// ============================================================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

// Components
import { Button, Input, Spinner } from '@components/ui';
import GetLocation from '@utils/GetLocation';

// Auth hooks and store
import { useLogin } from '@hooks/queries/useAuth';
import { useAuthStore } from '@store/auth.store';

// Validation
import { loginSchema, type LoginFormData } from '@utils/validators/auth.validators';

// Assets
import Images from '@utils/constants/Image_strings';

// ============================================================================
// COMPONENT
// ============================================================================

const Login = () => {
  const navigate = useNavigate();
  
  // Auth store and mutation
  const { setAuthenticated } = useAuthStore();
  const loginMutation = useLogin();

  // Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      
      // If 2FA is required, handle it
      if (response.requiresTwoFactor) {
        // Store temp data and redirect to 2FA page
        navigate('/auth/verify-2fa', { 
          state: { 
            email: data.email,
            tempToken: response.tempToken,
            method: response.twoFactorMethod 
          } 
        });
        return;
      }

      // Set authenticated state
      if (response.user) {
        setAuthenticated({
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          avatar: response.user.avatar,
          role: response.user.role,
          kycStatus: response.user.kycStatus || 'pending',
          isEmailVerified: response.user.emailVerified || false,
          isPhoneVerified: response.user.phoneVerified || false,
        });
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Login failed:', error);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full">
      {/* LEFT SECTION - Login Form */}
      <div className="flex w-full flex-col justify-center bg-slate-50/30 p-6 backdrop-blur-lg md:w-1/2 md:p-10 lg:p-16">
        {/* Header */}
        <div className="mb-8 flex w-full items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={Images.headerLogo} alt="Nordea" className="h-10 w-auto" />
          </Link>
          <GetLocation />
        </div>

        {/* Welcome Text */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">
            Welcome to Nordea Internet Banking
          </h1>
          <p className="mt-4 text-gray-600">
            Sign in with your Internet Banking details or Nordea More login details.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Not registered?{' '}
            <Link to="/auth/signup" className="text-primary-600 hover:underline">
              Open savings account
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="mx-auto w-full max-w-md space-y-5"
        >
          {/* Email Input */}
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            leftIcon={<Mail className="h-5 w-5" />}
            error={errors.email?.message}
            isRequired
            {...register('email')}
          />

          {/* Password Input */}
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            leftIcon={<Lock className="h-5 w-5" />}
            showPasswordToggle
            error={errors.password?.message}
            isRequired
            {...register('password')}
          />

          {/* API Error Display */}
          {loginMutation.error && (
            <div className="rounded-lg bg-error-50 p-3 text-sm text-error-600">
              {loginMutation.error.message || 'Login failed. Please check your credentials.'}
            </div>
          )}

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link 
              to="/auth/forgot-password" 
              className="text-sm text-primary-600 hover:underline"
            >
              Forgot Username or Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting || loginMutation.isPending}
          >
            {isSubmitting || loginMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" variant="white" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Register Button */}
          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate('/auth/signup')}
          >
            Register on Nordea Banking
          </Button>
        </form>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Have any problem?{' '}
            <Link to="/contact" className="text-primary-600 hover:underline">
              Chat with us
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center text-xs text-gray-500">
          <p>© 2024 Nordea Bank PLC. (Licensed by the International Monetary Fund)</p>
        </div>
      </div>

      {/* RIGHT SECTION - Image */}
      <div className="hidden md:block md:w-1/2">
        <img
          src={Images.authCard1}
          alt="Nordea Banking"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
};

export default Login;
