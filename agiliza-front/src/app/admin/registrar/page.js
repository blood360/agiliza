'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotify } from '@/context/ToastContext';
import styles from './registrar.module.css'; // Já já a gente cria o estilo
import API_URL from '@/config/api';
import Link from 'next/link';

export default function RegistrarLojista() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    lojaId: '' // Esse é o "Código da Loja" que tu vai passar pra ele
  });

  const [carregando, setCarregando] = useState(false);
  const notify = useNotify();
  const router = useRouter();

  const handleRegistro = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const res = await fetch(`${API_URL}/api/usuarios/registrar-lojista-self`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const dados = await res.json();

      if (res.ok) {
        notify("Conta criada com sucesso! Agora é só logar. 🚀", "success");
        router.push('/login'); // Manda ele pro login pra ele estrear a senha nova
      } else {
        notify(dados.erro || "Vixe, deu erro ao registrar!", "error");
      }
    } catch (err) {
      notify("Macho, erro na conexão com o servidor!", "error");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Seja bem-vindo à AS Automações! 🚀</h1>
        <p>Crie seu acesso administrativo para gerenciar sua loja.</p>

        <form onSubmit={handleRegistro} className={styles.form}>
          <div className={styles.campo}>
            <label>Seu Nome</label>
            <input 
              type="text" 
              placeholder="Ex: Adriano Marins"
              required 
              onChange={(e) => setForm({...form, nome: e.target.value})}
            />
          </div>

          <div className={styles.campo}>
            <label>E-mail (Será seu login)</label>
            <input 
              type="email" 
              placeholder="exemplo@email.com"
              required 
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
          </div>

          <div className={styles.campo}>
            <label>WhatsApp (com DDD)</label>
            <input 
              type="text" 
              placeholder="Ex: 5521999999999"
              required 
              onChange={(e) => setForm({...form, telefone: e.target.value})}
            />
          </div>

          <div className={styles.campo}>
            <label>Crie uma Senha</label>
            <input 
              type="password" 
              placeholder="No mínimo 6 caracteres"
              required 
              onChange={(e) => setForm({...form, senha: e.target.value})}
            />
          </div>

          <div className={`${styles.campo} ${styles.destaque}`}>
            <label>Código da sua Loja (ID fornecido pela AS)</label>
            <input 
              type="text" 
              placeholder="Cole aqui o código da sua loja"
              required 
              onChange={(e) => setForm({...form, lojaId: e.target.value})}
            />
            <small>Sem esse código, você não consegue vincular sua conta à loja.</small>
          </div>

          <button type="submit" className={styles.btnRegistrar} disabled={carregando}>
            {carregando ? "Criando conta..." : "Finalizar Cadastro 💾"}
          </button>
        </form>

        <div className={styles.footer}>
          <span>Já tem conta? <Link href="/login">Faça Login</Link></span>
        </div>
      </div>
    </div>
  );
}