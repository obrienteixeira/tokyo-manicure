
import React, { useState } from 'react';
import Button from '../common/Button';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Handles the form submission for login.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 2. Simulate an API call for authentication.
    setTimeout(() => {
      if (email === 'admin@tokyo.com' && password === 'password') {
        onLogin();
      } else {
        setError('E-mail ou senha inválidos. Tente novamente.');
      }
      setIsLoading(false);
    }, 1000);
  };

  // 3. The main login view structure.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-jp bg-gradient-to-br from-pink-50 via-background to-purple-50">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-xl p-8 text-center">
            {/* 4. Login Header */}
            <div className="mb-8">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.3 2.2 22 4l-2.8 2.8-1.2-1.2Z"/><path d="m2.2 20.3 1.8-1.8L1 15.7l-1.2 1.2a2 2 0 0 0 0 2.8l1.6 1.6Zm.4-11.9-1.2 1.2a2 2 0 0 0 0 2.8l8.5 8.5 1.2-1.2-8.5-8.5Z"/><path d="M10.4 2.2 12 4l-1.4 1.4-1.2-1.2Z"/><path d="m11.8 12.8 5.6-5.6 1.2 1.2-5.6 5.6Z"/><path d="m18.9 8.8 1.2 1.2-2.8 2.8-1.2-1.2Z"/></svg>
                <h1 className="text-3xl font-bold text-secondary mt-4">Tokyo Nails</h1>
                <p className="text-text-secondary mt-1">Bem-vindo(a) de volta!</p>
            </div>
            {/* 5. Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
                {error && <p className="text-red-500 text-sm text-left">{error}</p>}
                <Button type="submit" isLoading={isLoading} className="w-full !py-3">
                    Entrar
                </Button>
            </form>
             {/* 6. Form footer with help text. */}
            <p className="text-xs text-gray-400 mt-6">Use <span className="font-semibold">admin@tokyo.com</span> e <span className="font-semibold">password</span> para testar.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
