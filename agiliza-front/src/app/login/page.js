'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';
import { useNotify } from '@/context/ToastContext'; // Usando seu sistema de avisos

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
      const response = await fetch('http://localhost:5000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        setTimeout(() => {
          // Frase de efeito que você pediu!
          notify("Seja bem-vindo ao Agiliza - Sua venda na velocidade da luz! 🚀", "success");
          
          if (data.usuario.tipo === 'lojista') {
            router.push('/as-admin');
          } else {
            router.push('/explorar'); // Agora essa página vai existir!
          }
        }, 1200);
      } else {
        setCarregando(false);
        notify(data.erro || "E-mail ou senha incorretos.", "error");
      }
    } catch (err) {
      setCarregando(false);
      notify("Erro ao conectar com o servidor.", "error");
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
            name="email_agiliza" // Nome único para evitar autofill antigo
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