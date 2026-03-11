'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';
import { useNotify } from '@/context/ToastContext';
import API_URL from '@/config/api'; 

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
      const response = await fetch(`${API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          senha: senha 
        })
      });

      // 🛡️ 1. Pegamos o JSON apenas UMA VEZ aqui
      const data = await response.json();

      if (response.ok) {
        // 🛡️ 2. Salvando tudo o que é preciso (Token e Dados do Usuário)
        if (data.token) {
           localStorage.setItem('agiliza_token', data.token);
        }
        
        if (data.usuario) {
           localStorage.setItem('@Agiliza:Usuario', JSON.stringify(data.usuario));
        }
        
        notify("Seja bem-vindo ao Agiliza - Sua venda na velocidade da luz! 🚀", "success");

        setTimeout(() => {
          // 🚀 3. Lógica de Redirecionamento (Dashboard Master vs Dashboard Lojista)
          const tipo = data.usuario?.tipo;
          
          if (tipo === 'admin') {
            router.push('/as-admin'); // Painel seu (Master)
          } else if (tipo === 'lojista') {
            router.push('/admin');    // Painel do cliente (Depósito da Baixinha)
          } else {
            router.push('/explorar'); // Cliente comum
          }
        }, 1500); 

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
          Não tem cadastro? <Link href="/admin/registrar">Crie sua conta de Lojista</Link>
        </p>
      </form>
    </div>
  );
}