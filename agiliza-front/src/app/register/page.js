'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '', tipo: 'cliente' });
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const response = await fetch('http://localhost:5000/api/usuarios/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setTimeout(() => {
          alert("Cadastro realizado com sucesso! Bem-vindo ao Agiliza.");
          router.push('/login');
        }, 2000);
      } else {
        setCarregando(false);
        const data = await response.json();
        alert(data.erro || "Erro ao realizar cadastro.");
      }
    } catch (err) {
      setCarregando(false);
      console.error("Erro de conexão.");
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
          onChange={(e) => setForm({...form, nome: e.target.value})} 
          required 
        />
        <input 
          type="email" 
          placeholder="Seu melhor e-mail" 
          onChange={(e) => setForm({...form, email: e.target.value})} 
          required 
        />
        <input 
          type="tel" 
          placeholder="WhatsApp (com DDD)" 
          onChange={(e) => setForm({...form, telefone: e.target.value})} 
          required 
        />
        <input 
          type="password" 
          placeholder="Crie uma senha" 
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