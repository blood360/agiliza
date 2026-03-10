'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/config/api';
import MenuInferior from '@/components/MenuInferior';
import styles from './perfil.module.css';
import { useNotify } from '@/context/ToastContext';

export default function PerfilPage() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();
  const notify = useNotify();

  useEffect(() => {
    const carregar = async () => {
      const token = localStorage.getItem('agiliza_token');
      if (!token) return router.push('/login');

      try {
        const res = await fetch(`${API_URL}/api/usuarios/perfil`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setUsuario(data);
        } else {
          notify(data.erro || "Sessão expirada. Logue novamente.", "error");
          router.push('/login');
        }
      } catch (err) {
        notify("Não consegui conectar com o servidor da AS.", "error");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [router, notify]);

  if (carregando) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinnerWrapper}>
          <img src="/motoagiliza.png" alt="Moto Agiliza" className={styles.loaderImage} />
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loaderText}>Aguarde, estou consultando seus dados...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Meu Perfil</h1>
        <p className={styles.sub}>Dados da sua conta na AS Automações</p>
      </header>

      <main className={styles.perfilContent}>
        {usuario ? (
          <div className={styles.infoCards}>
            <div className={styles.card}><label>👤 Nome Completo</label><p>{usuario.nome}</p></div>
            <div className={styles.card}><label>📧 E-mail de Acesso</label><p>{usuario.email}</p></div>
            <div className={styles.card}><label>📱 WhatsApp</label><p>{usuario.telefone || "Não cadastrado"}</p></div>
            <div className={styles.card}><label>📍 Endereço de Entrega</label><p>{usuario.endereco || "Nenhum endereço salvo"}</p></div>
            <div className={styles.card}><label>🏷️ Ponto de Referência</label><p>{usuario.referencia || "Não informado"}</p></div>
            
            <button className={styles.btnAcao} onClick={() => notify("Função de edição em breve!", "info")}>
              Editar Meus Dados
            </button>
          </div>
        ) : (
          <div className={styles.erroBox}>
            <p>Vixe! Não achei seus dados. Tente logar de novo.</p>
            <button onClick={() => router.push('/login')} className={styles.btnAcao}>Ir para Login</button>
          </div>
        )}
      </main>
      <MenuInferior />
    </div>
  );
}