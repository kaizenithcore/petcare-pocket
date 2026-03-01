import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: t('auth.passwordMismatch'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    const result = await updatePassword(password);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
    } else {
      toast({ title: t('auth.passwordUpdated') });
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-extrabold text-foreground">{t('auth.resetPassword')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card space-y-4">
          <div>
            <Label>{t('auth.newPassword')}</Label>
            <div className="relative mt-1">
              <Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="pl-9 rounded-xl" required minLength={6} />
            </div>
          </div>
          <div>
            <Label>{t('auth.confirmPassword')}</Label>
            <div className="relative mt-1">
              <Lock size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" className="pl-9 rounded-xl" required minLength={6} />
            </div>
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {t('auth.updatePassword')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
