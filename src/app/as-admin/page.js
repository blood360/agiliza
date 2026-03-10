'use client'
import { useState, useEffect } from 'react';
import styles from './master.module.css';
import Image from 'next/image';

export default function MasterDashboard() {
  const [abaAtiva, setAbaAtiva] = useState('assinantes');
  const [isModalNovo, setIsModalNovo] = useState(false);
  const [novoAssinante, setNovoAssinante] = useState({ loja: '', dono: '', plano: 'Iniciante' });

  const [assinantes, setAssinantes] = useState([
    { id: 1, loja: "Pizzaria Magé", dono: "João Silva", plano: "Pro", status: "Ativo", valor: 89.90, vencimento: "2026-04-10" },
    { id: 2, loja: "Burguer do Igor", dono: "Igor Antonio", plano: "Iniciante", status: "Inadimplente", valor: 49.90, vencimento: "2026-03-01" },
    { id: 3, loja: "Sushi da Vila", dono: "Ana Oliveira", plano: "Iniciante", status: "Ativo", valor: 49.90, vencimento: "2026-03-20" }
  ]);

  useEffect(() => {
    localStorage.setItem('agiliza_lista_assinantes', JSON.stringify(assinantes));
  }, [assinantes]);

  const custosAS = {
    salarioIgor: 3400.00,
    vercel: 115.00,
    mongodb: 55.00,
    dominio: 3.33
  };

  // 🚀 Funções de Ação (Agora no lugar certo!)
  const alternarInadimplencia = (id) => {
    const atualizados = assinantes.map(a => {
      if (a.id === id) {
        const novoStatus = a.status === 'Inadimplente' ? 'Ativo' : 'Inadimplente';
        return { ...a, status: novoStatus };
      }
      return a;
    });
    setAssinantes(atualizados);
    alert("Status de pagamento atualizado, macho!");
  };

  const handleCriarAcesso = (e) => {
    e.preventDefault();
    const novoItem = {
      id: Date.now(),
      loja: novoAssinante.loja,
      dono: novoAssinante.dono,
      plano: novoAssinante.plano,
      status: "Ativo",
      valor: novoAssinante.plano === 'Pro' ? 89.90 : 49.90,
      vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setAssinantes([...assinantes, novoItem]);
    setIsModalNovo(false);
    setNovoAssinante({ loja: '', dono: '', plano: 'Iniciante' });
    alert("Vixe! Novo parceiro cadastrado com sucesso!");
  };

  const alternarAcesso = (id) => {
    setAssinantes(assinantes.map(a => a.id === id ? { ...a, status: a.status === 'Ativo' ? 'Bloqueado' : 'Ativo' } : a));
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
                  <tr key={a.id}>
                    <td><strong>{a.loja}</strong></td>
                    <td>{a.dono}</td>
                    <td><span className={styles.tagPlano}>{a.plano}</span></td>
                    <td>{new Date(a.vencimento).toLocaleDateString()}</td>
                    <td><span className={`${styles.status} ${styles[a.status.toLowerCase()]}`}>{a.status}</span></td>
                    <td>
                      <div className={styles.acoesBtn}>
                        <button onClick={() => alternarAcesso(a.id)} className={styles.btnBloquear}>
                          {a.status === 'Bloqueado' ? '✅ Liberar' : '🚫 Bloquear'}
                        </button>
                        <button 
                          onClick={() => alternarInadimplencia(a.id)} 
                          className={a.status === 'Inadimplente' ? styles.btnPago : styles.btnCobrar}
                        >
                          {a.status === 'Inadimplente' ? '💰 Marcar Pago' : '⚠️ Inadimplente'}
                        </button>
                        <button className={styles.btnEditar}>📝</button>
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