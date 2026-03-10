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
    const carregarPerfil = async () => {
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
          notify(data.erro || "Não consegui ver seus dados.", "error");
        }
      } catch (err) {
        notify("Erro de conexão com a AS Automações.", "error");
      } finally {
        setCarregando(false);
      }
    };
    carregarPerfil();
  }, [router, notify]);

  // TELA DE LOADING COM A MOTINHA (IGUAL AO LOGIN)
  if (carregando) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinnerWrapper}>
          <img src="/motoagiliza.png" alt="Moto Agiliza" className={styles.loaderImage} />
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loaderText}>aguarde, estou consultando seus dados...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Meu Perfil</h1>
      </header>

      <main className={styles.perfilContent}>
        {usuario ? (
          <div className={styles.infoCards}>
            <div className={styles.card}>
              <label>Nome</label>
              <p>{usuario.nome}</p>
            </div>
            <div className={styles.card}>
              <label>WhatsApp</label>
              <p>{usuario.telefone || "Não cadastrado"}</p>
            </div>
            <div className={styles.card}>
              <label>Endereço de Entrega</label>
              <p>{usuario.endereco || "Nenhum endereço salvo"}</p>
            </div>
            <button className={styles.btnAcao}>Editar Meus Dados</button>
          </div>
        ) : (
          <p className={styles.erroMsg}>Desculpe não achei seus dados. Tente logar de novo.</p>
        )}
      </main>
      <MenuInferior />
    </div>
  );
}