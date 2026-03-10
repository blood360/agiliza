'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';
import { useNotify } from '@/context/ToastContext'; // Importando seu sistema de avisos
import API_URL from '@/config/api'; // Importando o GPS do backend

export default function RegisterPage() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '', tipo: 'cliente' });
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const notify = useNotify(); // Inicializando o notify

  const handleRegister = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      // MUDANÇA AQUI: Trocamos o localhost pela variável API_URL
      const response = await fetch(`${API_URL}/api/usuarios/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        // Trocamos o alert pelo seu notify profissional
        notify("Cadastro realizado com sucesso! Bem-vindo ao Agiliza. 🚀", "success");
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setCarregando(false);
        notify(data.erro || "Vixe! Erro ao realizar cadastro.", "error");
      }
    } catch (err) {
      setCarregando(false);
      console.error("Erro de conexão:", err);
      notify("Erro ao conectar com o servidor. Verifique o backend no Render.", "error");
    }
  };

  if (carregando) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinnerWrapper}>
          <img src="/motoagiliza.png" alt="Moto Agiliza" className={styles.loaderImage} />
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loaderText}>aguarde, criptografando seus dados em nossa base...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleRegister} className={styles.form}>
        <h1>Criar Conta Agiliza</h1>
        
        <input 
          type="text" 
          placeholder="Nome completo" 
          value={form.nome}
          onChange={(e) => setForm({...form, nome: e.target.value})} 
          required 
        />
        <input 
          type="email" 
          placeholder="Seu melhor e-mail" 
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})} 
          required 
        />
        <input 
          type="tel" 
          placeholder="WhatsApp (com DDD)" 
          value={form.telefone}
          onChange={(e) => setForm({...form, telefone: e.target.value})} 
          required 
        />
        <input 
          type="password" 
          placeholder="Crie uma senha" 
          value={form.senha}
          onChange={(e) => setForm({...form, senha: e.target.value})} 
          required 
        />

        <button type="submit" className={styles.btn}>Finalizar Cadastro</button>
        
        <p className={styles.link}>
          Já tem conta? <Link href="/login">Entre aqui</Link>
        </p>
      </form>
    </div>
  );
}