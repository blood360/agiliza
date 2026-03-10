'use client'
import styles from '@/app/page.module.css';
import ListaProdutos from '@/components/ListaProdutos';
import MenuInferior from '@/components/MenuInferior';

export default function ExemploLoja() {
  // Dados de uma loja fictícia pra o cliente testar
  const nomeDaLoja = "Tabacaria Arretada (DEMO)";
  
  const produtosExemplo = [
    { id: 1, nome: "Cigarro de Palha Tradicional", preco: 10.00, img: "/cigarro.jpg" },
    { id: 2, nome: "Isqueiro Vintage", preco: 15.00, img: "/isqueiro.jpg" },
    { id: 3, nome: "Catuaba Selvagem 1L", preco: 18.00, img: "/catuaba-selvagem.jpg" },
    { id: 4, nome: "Energético 2L", preco: 12.50, img: "/energetico.jpg" },
  ];

  return (
    <main className={styles.main}>
      {/* Banner de Aviso de que é uma versão de demonstração */}
      <div style={{
        background: '#ffcc00', 
        color: '#000', 
        textAlign: 'center', 
        padding: '5px', 
        fontSize: '0.8rem',
        fontWeight: 'bold'
      }}>
        MODO DEMONSTRAÇÃO - Teste as funcionalidades à vontade!
      </div>

      <header className={styles.header}>
        <h1 className={styles.logoAgiliza}>Agiliza</h1>
        <p className={styles.nomeAssinante}>{nomeDaLoja}</p>
      </header>

      {/* Passamos os produtos de exemplo pro componente que já criamos */}
      <ListaProdutos produtos={produtosExemplo} />
      
      <MenuInferior />
    </main>
  );
}