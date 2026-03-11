'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import API_URL from '@/config/api';

const AgilizaContext = createContext();

export function AgilizaProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loja, setLoja] = useState(null); // 🏢 A LOJA ATUAL (DNA da loja!)
  const [usuario, setUsuario] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    referencia: '',
    pagamento: 'Pix'
  });

  // 1. SINCRONIZAÇÃO DO USUÁRIO (O que você já tinha)
  useEffect(() => {
    const carregarDadosReais = async () => {
      const token = localStorage.getItem('agiliza_token');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/usuarios/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const dadosDoBanco = await res.json();
            setUsuario(prev => ({ ...dadosDoBanco, pagamento: prev.pagamento || 'Pix' }));
          }
        } catch (err) {
          console.log("Contexto: Erro ao sincronizar com o banco.");
        }
      }
    };
    carregarDadosReais();
  }, []);

  // 2. FUNÇÃO PARA CARREGAR OS DADOS DA LOJA (Busca frete, valor mínimo, etc)
  const carregarLoja = async (slug) => {
    try {
      const res = await fetch(`${API_URL}/api/assinantes/loja/${slug}`);
      if (res.ok) {
        const dadosLoja = await res.json();
        setLoja(dadosLoja); // Agora o contexto sabe quem é a loja!
      }
    } catch (err) {
      console.error("Erro ao carregar dados da loja:", err);
    }
  };

  const atualizarPerfil = (novosDados) => {
    setUsuario(novosDados);
    localStorage.setItem('@Agiliza:Perfil', JSON.stringify(novosDados));
  };

  const salvarPedido = (novoPedido) => {
    const novoHistorico = [novoPedido, ...pedidos];
    setPedidos(novoHistorico);
    setCarrinho([]); 
  }

  const adicionarAoCarrinho = (produto) => {
    setCarrinho(prev => [...prev, { ...produto, idUnico: Date.now() }]);
  };

  const removerDoCarrinho = (idUnico) => {
    setCarrinho(prev => prev.filter(item => item.idUnico !== idUnico));
  };
  return (
    <AgilizaContext.Provider value={{ 
      carrinho, 
      setCarrinho, 
      adicionarAoCarrinho, 
      removerDoCarrinho, 
      usuario,
      setUsuario,
      atualizarPerfil,
      pedidos,
      salvarPedido,
      loja,       // 👈 Disponível para o Checkout!
      setLoja,
      carregarLoja
    }}>
      {children}
    </AgilizaContext.Provider>
  );
}

export const useAgiliza = () => useContext(AgilizaContext);