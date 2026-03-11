'use client'
import { useState, useEffect } from 'react';
import {useNotify} from '@/context/ToastContext'
import styles from './master.module.css';
import Image from 'next/image';
import API_URL from '@/config/api';

export default function MasterDashboard() {
  const [assinantes, setAssinantes] = useState([]);
  const notify = useNotify();
  const [abaAtiva, setAbaAtiva] = useState('assinantes');
  const [isModalNovo, setIsModalNovo] = useState(false);
  const [novoAssinante, setNovoAssinante] = useState({ loja: '', dono: '', plano: 'Iniciante', vencimento: '' });


  useEffect(() => {
    const buscarAssinantes = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/assinantes`);
        
        if (!resposta.ok) {
            const erroTxt = await resposta.json();
            console.error("Erro do Servidor:", erroTxt);
            setAssinantes([]); 
            return;
        }

        const dados = await resposta.json();

        if (Array.isArray(dados)) {
          setAssinantes(dados);
        } else {
          setAssinantes([]); 
        }
      } catch (err) {
        console.error("Erro de conexão:", err);
        setAssinantes([]);
      }
    };
    buscarAssinantes();
}, []);

  const custosAS = {
    salarioIgor: 3400.00,
    vercel: 115.00,
    mongodb: 55.00,
    dominio: 3.33
  };

  const alternarInadimplencia = async (id) => {
    const assinante = assinantes.find(a => a._id === id);
    const novoStatus = assinante.status === 'Inadimplente' ? 'Ativo' : 'Inadimplente';

    try {
      const resposta = await fetch(`${API_URL}/api/assinantes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      if (resposta.ok) {
        const atualizado = await resposta.json();
        setAssinantes(assinantes.map(a => a._id === id ? atualizado : a));
        notify("Status de pagamento atualizado no banco!", "success");
      }
    } catch (err) {
      notify("Desculpe, banco não respondeu!", "error");
    }
  };

  const handleCriarAcesso = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch(`${API_URL}/api/assinantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoAssinante)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setAssinantes([...assinantes, dados]);
        setIsModalNovo(false);
        setNovoAssinante({ loja: '', dono: '', plano: 'Iniciante', vencimento: '' });
        notify("Assinante cadastrado com sucesso! 🚀", 'success');
      } else {
        notify(dados.erro || "Vixe! O servidor barrou o cadastro.", "error");
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      notify("Macho, o servidor da AS tá fora do ar!", "error");
    }
};

  const alternarAcesso = async (id) => {
    const assinante = assinantes.find(a => a._id === id);
    const novoStatus = (assinante.status === 'Ativo' || assinante.status === 'Inadimplente') ? 'Bloqueado' : 'Ativo';

    try {
      const resposta = await fetch(`${API_URL}/api/assinantes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      if (resposta.ok) {
        const atualizado = await resposta.json();
        setAssinantes(assinantes.map(a => a._id === id ? atualizado : a));
        const msg = novoStatus === 'Bloqueado' ? "🚫 Loja suspensa!" : "✅ Loja liberada!";
        notify(msg, novoStatus === 'Bloqueado' ? "warning" : "success");
      }
    } catch (err) {
      notify("Erro na comunicação com o servidor.", "error");
    }
  };

  const handleExcluir = async (id, nomeLoja) => {
  const confirmou = window.confirm(`Patrão tem certeza que quer apagar a loja "${nomeLoja}"?`);
  if (!confirmou) return;

  try {
    const resposta = await fetch(`${API_URL}/api/assinantes/${id}`, {
      method: 'DELETE',
    });

    if (resposta.ok) {
      setAssinantes(assinantes.filter(a => a._id !== id));
      notify(`Vixe! A loja ${nomeLoja} foi pro beleléu com sucesso! 🗑️`, "success");
    }
  } catch (err) {
    notify("Erro ao tentar apagar no banco. Tente de novo!", "error");
  }
};

  const calc = () => {
    const totalAssinantes = assinantes.length;
    const inadimplentes = assinantes.filter(a => a.status === 'Inadimplente').length;
    const iniciantes = assinantes.filter(a => a.plano === 'Iniciante');
    const pros = assinantes.filter(a => a.plano === 'Pro');
    const faturamentoBruto = (iniciantes.length * 49.90) + (pros.length * 89.90);
    const totalDespesas = Object.values(custosAS).reduce((a, b) => a + b, 0);

    return { 
      totalAssinantes, 
      inadimplentes, 
      receitaBruta: faturamentoBruto,
      receitaIniciante: iniciantes.length * 49.90,
      receitaPro: pros.length * 89.90,
      qtdIniciante: iniciantes.length,
      qtdPro: pros.length,
      totalDespesas,
      lucroLiquido: faturamentoBruto - totalDespesas
    };
  };

  const d = calc();

  const copiarID = (id) => {
    navigator.clipboard.writeText(id);
    notify("ID da loja copiado, envie para o cliente para concluir o acesso", "success");
  };

  const copiarConvite = (id, nomeLoja) => {
  const mensagem = `Olá! Sua plataforma de vendas (${nomeLoja}) já foi criada com sucesso. 🚀

🔗 *Link de Registro:* https://agiliza-swart.vercel.app/admin/registrar
🔑 *Código de Vínculo:* ${id}

⚠️ *Atenção:* Sem o código acima, você não consegue conectar sua conta à sua loja. Copie e cole exatamente como está.

Boas vendas! Atenciosamente, *AS Automações*.`;

  navigator.clipboard.writeText(mensagem);
  notify("Convite prontinho para o Zap! Só colar pro cliente. 📲", "success");
};

  return (
    <div className={styles.masterWrapper}>
      <aside className={styles.sidebarMaster}>
        <Image src="/logoAS.png" alt="AS Logo" width={100} height={35} className={styles.logoMaster} priority />
        <nav className={styles.navMaster}>
          <button onClick={() => setAbaAtiva('assinantes')} className={abaAtiva === 'assinantes' ? styles.active : ''}>👥 Assinantes</button>
          <button onClick={() => setAbaAtiva('financeiro')} className={abaAtiva === 'financeiro' ? styles.active : ''}>💰 Financeiro</button>
          <button onClick={() => setAbaAtiva('relatorios')} className={abaAtiva === 'relatorios' ? styles.active : ''}>📈 Relatórios AS</button>
          <button onClick={() => setAbaAtiva('sistema')} className={abaAtiva === 'sistema' ? styles.active : ''}>⚙️ Sistema</button>
        </nav>
      </aside>

      <main className={styles.mainMaster}>
        <header className={styles.headerMaster}>
          <div>
            <h1>Painel de Controle AS 🚀</h1>
            <p>Gestão centralizada da AS Automações.</p>
          </div>
          <button onClick={() => setIsModalNovo(true)} className={styles.btnNovoAcesso}>+ Criar Novo Acesso</button>
        </header>

        <section className={styles.cardsMaster}>
          <div className={styles.cardM}>
            <span>Total de Assinantes</span>
            <h2>{d.totalAssinantes} / 100</h2>
          </div>
          <div className={styles.cardM}>
            <span>Inadimplentes</span>
            <h2 className={styles.txtAlerta}>{d.inadimplentes}</h2>
          </div>
          <div className={styles.cardM}>
            <span>Faturamento Bruto</span>
            <h2>R$ {d.receitaBruta.toFixed(2)}</h2>
          </div>
        </section>

        {abaAtiva === 'assinantes' && (
          <section className={styles.tabelaContainer}>
            <table className={styles.tabelaMaster}>
              <thead>
                <tr><th>Loja</th><th>Dono</th><th>Plano</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {assinantes.map(a => (
                  <tr key={a._id}>
                    <td><strong>{a.loja}</strong></td>
                    <td>{a.dono}</td>
                    <td><span className={styles.tagPlano}>{a.plano}</span></td>
                    <td>{a.vencimento ? new Date(a.vencimento).toLocaleDateString() : '---'}</td>
                    <td><span className={`${styles.status} ${styles[a.status?.toLowerCase() || 'ativo']}`}>{a.status}</span></td>
                    <td>
                      <div className={styles.acoesBtn}>
                        <button onClick={() => alternarAcesso(a._id)} className={styles.btnBloquear}>
                          {a.status === 'Bloqueado' ? '✅ Liberar' : '🚫 Bloquear'}
                        </button>

                        <button 
                          onClick={() => alternarInadimplencia(a._id)} 
                          className={a.status === 'Inadimplente' ? styles.btnPago : styles.btnCobrar}
                        >
                          {a.status === 'Inadimplente' ? '💰 Marcar Pago' : '⚠️ Inadimplente'}
                        </button>

                        <button className={styles.btnEditar}>📝</button>

                        {/* CORREÇÃO AQUI: Trocado 'item' por 'a' */}
                        <button 
                          title='Copiar ID'
                          className={styles.btnAcaoSimples}
                          onClick={() => copiarID(a._id)}
                        >
                          🆔 ID
                        </button>

                        {/* CORREÇÃO AQUI: Trocado 'item' por 'a' */}
                        <button
                          title="Copiar Convite para o WhatsApp"
                          className={styles.btnConvite} 
                          onClick={() => copiarConvite(a._id, a.loja)}
                        >
                          💬 Convite
                        </button>

                        <button onClick={() => handleExcluir(a._id, a.loja)} className={styles.btnExcluir}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {abaAtiva === 'financeiro' && (
          <div className={styles.gridFinanceira}>
            <div className={styles.cardFin}>
              <h3>Entradas (Faturamento)</h3>
              <p>Planos Iniciante ({d.qtdIniciante}): <strong>R$ {d.receitaIniciante.toFixed(2)}</strong></p>
              <p>Planos Pro ({d.qtdPro}): <strong>R$ {d.receitaPro.toFixed(2)}</strong></p>
              <hr />
              <h4>Total Bruto: R$ {d.receitaBruta.toFixed(2)}</h4>
            </div>
            <div className={styles.cardFin}>
              <h3>Saídas (Custos Operacionais)</h3>
              <p>Salário Igor Antonio: <strong>R$ {custosAS.salarioIgor.toFixed(2)}</strong></p>
              <p>Infra (Vercel/Mongo): <strong>R$ {(custosAS.vercel + custosAS.mongodb).toFixed(2)}</strong></p>
              <p>Domínios: <strong>R$ {custosAS.dominio.toFixed(2)}</strong></p>
              <hr />
              <h4 className={styles.txtAlerta}>Total Despesas: R$ {d.totalDespesas.toFixed(2)}</h4>
            </div>
            <div className={`${styles.cardFin} ${d.lucroLiquido >= 0 ? styles.lucro : styles.prejuizo}`}>
              <h3>Resultado Líquido</h3>
              <h2>R$ {d.lucroLiquido.toFixed(2)}</h2>
              <small>{d.lucroLiquido >= 0 ? "O lucro tá garantido! 🚀" : "Vamo vender mais!"}</small>
            </div>
          </div>
        )}
      </main>

      {isModalNovo && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalMaster}>
            <h2>Novo Parceiro AS 🔑</h2>
            <form onSubmit={handleCriarAcesso}>
              <input type="text" placeholder="Nome da Loja" value={novoAssinante.loja} onChange={(e) => setNovoAssinante({...novoAssinante, loja: e.target.value})} required />
              <input type="text" placeholder="Nome do Dono" value={novoAssinante.dono} onChange={(e) => setNovoAssinante({...novoAssinante, dono: e.target.value})} required />
              
              <div className={styles.campoData}>
                <label style={{display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666'}}>
                  Data de Vencimento:
                </label>
                <input 
                  type="date" 
                  value={novoAssinante.vencimento} 
                  onChange={(e) => setNovoAssinante({...novoAssinante, vencimento: e.target.value})} 
                  required 
                  style={{width: '100%', padding: '10px', marginBottom: '15px'}}
                />
              </div>

              <select value={novoAssinante.plano} onChange={(e) => setNovoAssinante({...novoAssinante, plano: e.target.value})}>
                <option value="Iniciante">Iniciante (R$ 49,90)</option>
                <option value="Pro">Pro (R$ 89,90)</option>
              </select>

              <div className={styles.modalBotoes}>
                <button type="submit" className={styles.btnConfirmar}>Criar e Liberar</button>
                <button type="button" onClick={() => setIsModalNovo(false)} className={styles.btnCancelar}>Fechar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}