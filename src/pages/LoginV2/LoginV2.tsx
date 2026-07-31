import { useState, useEffect } from "react";
import { signIn, resetPassword } from "../../services/auth.service";
import { useToast } from "../../components/ui/Toast";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import styles from "./LoginV2.module.css";

type Mode = 'signin' | 'reset';

export const Login = () => {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await resetPassword(email);
        showToast('Email de redefinição enviado!', 'success');
        setMode('signin');
      }
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/invalid-credential': 'Email ou senha incorretos.',
        'auth/invalid-email': 'Email inválido.',
        'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde.',
      };
      showToast(messages[err.code] ?? 'Ocorreu um erro. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.loginRoot} ${mounted ? styles.mounted : ""}`}>
      {/* Background grid + glow */}
      <div className={styles.bgGrid} />
      <div className={styles.bgGlow} />

      {/* Theme toggle — canto superior direito */}
      <div className={styles.themeToggleWrapper}>
        <ThemeToggle />
      </div>

      <div className={styles.loginCard}>
        {/* Logo */}
        <div className={styles.logoBlock}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="20" width="6" height="14" rx="1" fill="currentColor" opacity="0.4"/>
              <rect x="13" y="12" width="6" height="22" rx="1" fill="currentColor" opacity="0.65"/>
              <rect x="22" y="6" width="6" height="28" rx="1" fill="currentColor"/>
              <path d="M8 18 L16 10 L24 14 L34 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="34" cy="4" r="2.5" fill="currentColor"/>
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>Finance App</span>
            <span className={styles.logoTagline}>Controle Financeiro</span>
          </div>
        </div>

        {/* Header */}
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>
            {mode === 'signin' ? 'Bem-vindo de volta' : 'Redefinir senha'}
          </h1>
          <p className={styles.cardSubtitle}>
            {mode === 'signin'
              ? 'Acesse sua conta e acompanhe suas finanças'
              : 'Informe seu email para receber o link de redefinição'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="email">E-mail</label>
            <div className={styles.fieldWrapper}>
              <span className={styles.fieldIcon}>
                <svg viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                id="email"
                type="email"
                className={styles.fieldInput}
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {mode === 'signin' && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="password">Senha</label>
              <div className={styles.fieldWrapper}>
                <span className={styles.fieldIcon}>
                  <svg viewBox="0 0 20 20" fill="none">
                    <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={styles.fieldInput}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/><line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {mode === 'signin' && (
            <div className={styles.formOptions}>
              <span />
              <button type="button" className={styles.forgotLink} onClick={() => setMode('reset')}>
                Esqueci a senha
              </button>
            </div>
          )}

          <button
            type="submit"
            className={`${styles.submitBtn} ${isLoading ? styles.loading : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Entrar' : 'Enviar email'}</span>
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {mode === 'reset' && (
          <p className={styles.registerText}>
            <button className={styles.registerLink} onClick={() => setMode('signin')}>
              ← Voltar para o login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
