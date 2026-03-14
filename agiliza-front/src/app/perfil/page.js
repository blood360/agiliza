'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/config/api';
import MenuInferior from '@/components/MenuInferior';
import styles from './perfil.module.css';
import { useNotify } from '@/context/ToastContext';

export default function PerfilPage() {
  // 📍 Estado atualizado com o endereço "fatiado"
  const [usuario, setUsuario] = useState({ 
    nome: '', 
    email: '', 
    telefone: '', 
    rua: '', 
    numero: '', 
    bairro: '', 
    referencia: '' 
  });
  
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
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
          // Garante que campos nulos não quebrem o formulário
          setUsuario({
            ...data,
            rua: data.rua || '',
            numero: data.numero || '',
            bairro: data.bairro || '',
            referencia: data.referencia || ''
          });
        }
      } catch (err) {
        notify("Erro ao carregar seus dados.", "error");
      } finally {
        setCarregando(false);
      }
    };
    carregarPerfil();
  }, [router, notify]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    const token = localStorage.getItem('agiliza_token');

    try {
      const res = await fetch(`${API_URL}/api/usuarios/perfil`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            nome: usuario.nome,
            telefone: usuario.telefone,
            rua: usuario.rua,
            numero: usuario.numero,
            bairro: usuario.bairro,
            referencia: usuario.referencia
        })
      });

      if (res.ok) {
        const dadosAtualizados = await res.json();
        setUsuario(dadosAtualizados); 
        localStorage.setItem('@Agiliza:Perfil', JSON.stringify(dadosAtualizados));
        notify("Perfil atualizado! Agora o motoboy te acha até no escuro! 🚀", "success");
        setEditando(false);
      } else {
        notify("Vixe! Não consegui salvar no servidor.", "error");
      }
    } catch (err) {
      notify("Erro de conexão com a AS Automações.", "error");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinnerWrapper}>
          <img src="/motoagiliza.png" alt="Moto Agiliza" className={styles.loaderImage} />
          <div className={styles.spinnerCircle}></div>
        </div>
        <p className={styles.loaderText}>Consultando seus dados...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Meu Perfil</h1>
      </header>

      <main className={styles.perfilContent}>
        <form onSubmit={handleSalvar} className={styles.infoCards}>
          <div className={styles.card}>
            <label>👤 Nome</label>
            {editando ? (
              <input type="text" className={styles.inputEdit} value={usuario.nome} onChange={e => setUsuario({...usuario, nome: e.target.value})} required />
            ) : <p>{usuario.nome}</p>}
          </div>

          <div className={styles.card}>
            <label>📧 E-mail (Não editável)</label>
            <p>{usuario.email}</p>
          </div>

          <div className={styles.card}>
            <label>📱 WhatsApp</label>
            {editando ? (
              <input type="text" className={styles.inputEdit} value={usuario.telefone} onChange={e => setUsuario({...usuario, telefone: e.target.value})} />
            ) : <p>{usuario.telefone || "Não cadastrado"}</p>}
          </div>

          {/* 🏠 SEÇÃO DE ENDEREÇO FATIADO */}
          <div className={styles.card}>
            <label>📍 Rua / Logradouro</label>
            {editando ? (
              <input type="text" className={styles.inputEdit} value={usuario.rua} onChange={e => setUsuario({...usuario, rua: e.target.value})} placeholder="Nome da rua..." />
            ) : <p>{usuario.rua || "Não informado"}</p>}
          </div>

          <div className={styles.row}>
            <div className={styles.card} style={{ flex: 1 }}>
              <label>🔢 Número</label>
              {editando ? (
                <input type="text" className={styles.inputEdit} value={usuario.numero} onChange={e => setUsuario({...usuario, numero: e.target.value})} placeholder="Ex: 123" />
              ) : <p>{usuario.numero || "S/N"}</p>}
            </div>

            <div className={styles.card} style={{ flex: 2 }}>
              <label>🏘️ Bairro</label>
              {editando ? (
                <input type="text" className={styles.inputEdit} value={usuario.bairro} onChange={e => setUsuario({...usuario, bairro: e.target.value})} placeholder="Nome do bairro..." />
              ) : <p>{usuario.bairro || "Não informado"}</p>}
            </div>
          </div>

          <div className={styles.card}>
            <label>🏷️ Referência</label>
            {editando ? (
              <input type="text" className={styles.inputEdit} value={usuario.referencia} onChange={e => setUsuario({...usuario, referencia: e.target.value})} placeholder="Perto de onde?" />
            ) : <p>{usuario.referencia || "Não informado"}</p>}
          </div>

          {editando ? (
            <div className={styles.botoes}>
              <button type="submit" className={styles.btnSalvar} disabled={salvando}>
                {salvando ? "Salvando..." : "Gravar Alterações"}
              </button>
              <button type="button" className={styles.btnCancelar} onClick={() => setEditando(false)}>Cancelar</button>
            </div>
          ) : (
            <button type="button" className={styles.btnAcao} onClick={() => setEditando(true)}>Editar Meus Dados</button>
          )}
        </form>
      </main>
      <MenuInferior />
    </div>
  );
}