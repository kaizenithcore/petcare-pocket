import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LegalFooter from '@/components/LegalFooter';

const TERMS_VERSION = '1.0';
const PRIVACY_VERSION = '1.0';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const { signIn, signUp, signInWithGoogle, setGuestMode, resetPassword } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const storeLegalAcceptance = async (userId: string) => {
    await supabase.from('legal_acceptance').insert({
      user_id: userId,
      terms_version: TERMS_VERSION,
      privacy_version: PRIVACY_VERSION,
    } as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'forgot') {
      const result = await resetPassword(email);
      if (result.error) {
        toast({ title: result.error, variant: 'destructive' });
      } else {
        toast({ title: t('auth.passwordResetSent') });
        setMode('signin');
      }
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      if (!acceptTerms || !acceptPrivacy) {
        toast({ title: t('auth.mustAcceptLegal'), variant: 'destructive' });
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: t('auth.passwordMismatch'), variant: 'destructive' });
        setLoading(false);
        return;
      }
    }

    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
    } else if (mode === 'signup') {
      // Store legal acceptance - user ID from session might not be available yet
      // so we'll store it via the auth state change listener
      toast({ title: t('auth.checkEmail') });
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleGuest = () => {
    setGuestMode();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3 animate-float">🐾</div>
            <h1 className="text-2xl font-extrabold text-foreground">{t('app.name')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('auth.tagline')}</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            {mode === 'forgot' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">{t('auth.resetPassword')}</h2>
                <div>
                  <Label>{t('auth.email')}</Label>
                  <div className="relative mt-1">
                    <Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="pl-9 rounded-xl" required />
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                  {t('auth.resetPassword')}
                </Button>
                <button type="button" onClick={() => setMode('signin')} className="text-xs text-primary w-full text-center">
                  {t('auth.hasAccount')} {t('auth.signIn')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">
                  {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
                </h2>

                <div>
                  <Label>{t('auth.email')}</Label>
                  <div className="relative mt-1">
                    <Mail size={16} className="absolute left-3 top-3 text-muted-foreground" />
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="pl-9 rounded-xl" required />
                  </div>
                </div>

                <div>
                  <Label>{t('auth.password')}</Label>
                  <div className="relative mt-1">
                    <Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} className="pl-9 pr-9 rounded-xl" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <>
                    <div>
                      <Label>{t('auth.confirmPassword')}</Label>
                      <div className="relative mt-1">
                        <Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
                        <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="pl-9 rounded-xl" required />
                      </div>
                    </div>

                    {/* Legal acceptance checkboxes */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="accept-terms"
                          checked={acceptTerms}
                          onCheckedChange={(v) => setAcceptTerms(!!v)}
                          className="mt-0.5"
                        />
                        <label htmlFor="accept-terms" className="text-xs text-muted-foreground leading-tight">
                          {t('auth.acceptTerms')}{' '}
                          <Link to="/terms" target="_blank" className="text-primary underline">{t('legal.termsAndConditions')}</Link>
                        </label>
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="accept-privacy"
                          checked={acceptPrivacy}
                          onCheckedChange={(v) => setAcceptPrivacy(!!v)}
                          className="mt-0.5"
                        />
                        <label htmlFor="accept-privacy" className="text-xs text-muted-foreground leading-tight">
                          {t('auth.acceptPrivacy')}{' '}
                          <Link to="/privacy" target="_blank" className="text-primary underline">{t('legal.privacyPolicy')}</Link>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {mode === 'signin' && (
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary">
                    {t('auth.forgotPassword')}
                  </button>
                )}

                <Button type="submit" className="w-full rounded-xl" disabled={loading || (mode === 'signup' && (!acceptTerms || !acceptPrivacy))}>
                  {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">{t('auth.orContinueWith')}</span>
                  </div>
                </div>

                <Button type="button" variant="outline" onClick={handleGoogle} className="w-full rounded-xl gap-2" disabled={loading}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {t('auth.continueWithGoogle')}
                </Button>

                <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setAcceptTerms(false); setAcceptPrivacy(false); }} className="text-xs text-primary w-full text-center">
                  {mode === 'signin' ? t('auth.noAccount') : t('auth.hasAccount')}
                  {' '}{mode === 'signin' ? t('auth.signUp') : t('auth.signIn')}
                </button>
              </form>
            )}
          </div>

          {/* Guest mode */}
          <button onClick={handleGuest} className="mt-4 text-sm text-muted-foreground w-full text-center hover:text-foreground transition-colors">
            {t('auth.continueAsGuest')}
          </button>
        </motion.div>
      </div>
      <LegalFooter />
    </div>
  );
};

export default Auth;