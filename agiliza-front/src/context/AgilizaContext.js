'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import API_URL from '@/config/api';

const AgilizaContext = createContext();

export function AgilizaProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loja, setLoja] = useState(null); 
  
  // 🛡️ 1. DADOS DE QUEM ESTÁ COMPRANDO (Perfil de Checkout)
  const [perfilCliente, setPerfilCliente] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    referencia: '',
    pagamento: 'Pix'
  });

  // 🛡️ 2. DADOS DE QUEM ESTÁ LOGADO (O Dono da Loja / Admin)
  const [usuarioLogado, setUsuarioLogado] = useState(null);

 // SINCRONIZAÇÃO DO USUÁRIO LOGADO (Pelo Token)
  useEffect(() => {
    const carregarUsuarioLogado = async () => {
      const token = localStorage.getItem('agiliza_token');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/usuarios/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const dados = await res.json();
            setUsuarioLogado(dados);

            // 🔥 O PULO DO GATO ESTÁ AQUI: 
            // Se o Adriano tá logado, o perfil do comprador já recebe os dados dele!
            setPerfilCliente(prev => ({
              ...prev,
              nome: dados.nome || prev.nome,
              telefone: dados.telefone || prev.telefone,
              endereco: dados.endereco || prev.endereco,
              referencia: dados.referencia || prev.referencia
            }));
          }
        } catch (err) {
          console.log("Contexto: Erro ao buscar dados do logado.");
        }
      }
    };

    const perfilSalvo = localStorage.getItem('@Agiliza:PerfilCliente');
    if (perfilSalvo) {
      setPerfilCliente(JSON.parse(perfilSalvo));
    }

    carregarUsuarioLogado();
  }, []);

  // FUNÇÃO PARA CARREGAR A LOJA
  const carregarLoja = async (slug) => {
    try {
      const res = await fetch(`${API_URL}/api/assinantes/loja/${slug}`);
      if (res.ok) {
        const dadosLoja = await res.json();
        setLoja(dadosLoja); 
      }
    } catch (err) {
      console.error("Erro ao carregar dados da loja:", err);
    }
  };

  const atualizarPerfilCliente = (novosDados) => {
    setPerfilCliente(novosDados);
    localStorage.setItem('@Agiliza:PerfilCliente', JSON.stringify(novosDados));
  };

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
      perfilCliente,      //  Para o Checkout
      setPerfilCliente,
      atualizarPerfilCliente,
      usuarioLogado,      //  Para saber quem está logado (Admin/Lojista)
      setUsuarioLogado,
      loja,
      setLoja,
      carregarLoja
    }}>
      {children}
    </AgilizaContext.Provider>
  );
}

export const useAgiliza = () => useContext(AgilizaContext);