'use client'
import { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('@Agiliza:Perfil');
    if (dadosSalvos) setUsuario(JSON.parse(dadosSalvos));
  }, []);

  const atualizarPerfil = (novosDados) => {
    setUsuario(novosDados);
    localStorage.setItem('@Agiliza:Perfil', JSON.stringify(novosDados));
  };

  const salvarPedido = (novoPedido) => {
    const novoHistorico = [novoPedido, ...pedidos];
    setPedidos(novoHistorico);
    localStorage.setItem('@Agiliza:Pedidos', JSON.stringify(novoHistorico));
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
      atualizarPerfil,
      pedidos,
      salvarPedido
    }}>
      {children}
    </AgilizaContext.Provider>
  );
}

export const useAgiliza = () => useContext(AgilizaContext);