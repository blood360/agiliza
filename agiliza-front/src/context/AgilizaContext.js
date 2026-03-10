'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import API_URL from '@/config/api';

const AgilizaContext = createContext();

export function AgilizaProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [usuario, setUsuario] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    referencia: '',
    pagamento: 'Pix'
  });

  // 🛡️ SINCRONIZAÇÃO COM O BANCO DE DADOS
  // Quando o app abre, ele busca o Perfil Real do Banco de Dados
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
            // Mantém o pagamento que já estava selecionado ou usa o padrão
            setUsuario(prev => ({ ...dadosDoBanco, pagamento: prev.pagamento || 'Pix' }));
          }
        } catch (err) {
          console.log("Contexto: Erro ao sincronizar com o banco.");
        }
      } else {
        // Se não tiver logado, tenta o localStorage como plano B
        const dadosSalvos = localStorage.getItem('@Agiliza:Perfil');
        if (dadosSalvos) setUsuario(JSON.parse(dadosSalvos));
      }
    };

    carregarDadosReais();
  }, []);

  const atualizarPerfil = (novosDados) => {
    setUsuario(novosDados);
    localStorage.setItem('@Agiliza:Perfil', JSON.stringify(novosDados));
  };

  const salvarPedido = (novoPedido) => {
    const novoHistorico = [novoPedido, ...pedidos];
    setPedidos(novoHistorico);
    localStorage.setItem('@Agiliza:Pedidos', JSON.stringify(novoHistorico));
    setCarrinho([]); // Limpa o carrinho após a venda!
  }

  const adicionarAoCarrinho = (produto) => {
    // Adiciona o produto com um ID único para evitar confusão no Checkout
    setCarrinho(prev => [...prev, { ...produto, idUnico: Date.now() }]);
  };

  const removerDoCarrinho = (idUnico) => {
    setCarrinho(prev => prev.filter(item => item.idUnico !== idUnico));
  };

  const atualizarPagamento = (metodo) => {
    setUsuario(prev => ({ ...prev, pagamento: metodo }));
  }

  return (
    <AgilizaContext.Provider value={{ 
      carrinho, 
      setCarrinho, 
      adicionarAoCarrinho, 
      removerDoCarrinho, 
      usuario,
      setUsuario, // Adicionado para dar mais flexibilidade
      atualizarPerfil,
      atualizarPagamento,
      pedidos,
      salvarPedido
    }}>
      {children}
    </AgilizaContext.Provider>
  );
}

export const useAgiliza = () => useContext(AgilizaContext);