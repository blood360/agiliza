'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';
import { useNotify } from '@/context/ToastContext';
import API_URL from '@/config/api'; // Importando a configuração certa

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const notify = useNotify();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      // MUDANÇA AQUI: Trocamos o localhost pela variável API_URL
      const response = await fetch(`${API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        // Frase de efeito que você pediu!
        notify("Seja bem-vindo ao Agiliza - Sua venda na velocidade da luz! 🚀", "success");
        
        // Salvando o token e dados se necessário (opcional, mas recomendado)
        if (data.token) {
           localStorage.setItem('agiliza_token', data.token);
        }

        setTimeout(() => {
          if (data.usuario.tipo === 'lojista') {
            router.push('/as-admin');
          } else {
            router.push('/explorar');
          }
        }, 1500); // Um tempinho pro cabra ler a mensagem de sucesso
      } else {
        setCarregando(false);
        notify(data.erro || "E-mail ou senha incorretos.", "error");
      }
    } catch (err) {
      setCarregando(false);
      console.error("Erro no login:", err);
      notify("Erro ao conectar com o servidor. Verifique sua internet.", "error");
    }
  };

  if (carregando) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinnerWrapper}>
          <img src="/motoagiliza.png" alt="Moto Agiliza" className={styles.loaderImage} />
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loaderText}>aguarde, verificando seus dados de acesso...</p>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleLogin} className={styles.loginForm} autoComplete="off">
        <h1>Entrar no Agiliza</h1>
        
        <div className={styles.inputGroup}>
          <input 
            type="email" 
            name="email_agiliza" 
            placeholder="exemplo@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.passwordWrapper}>
            <input 
              type={verSenha ? "text" : "password"} 
              name="senha_agiliza" 
              placeholder="sua senha aqui" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              required 
            />
            <button 
              type="button" 
              className={styles.toggleBtn}
              onClick={() => setVerSenha(!verSenha)}
            >
              {verSenha ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>
        </div>

        <button type="submit" className={styles.btnEntrar}>Acessar Conta</button>
        
        <p className={styles.linkRegister}>
          Não tem cadastro? <Link href="/register">Registre-se aqui</Link>
        </p>
      </form>
    </div>
  );
}