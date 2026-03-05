import styles from './page.module.css';
import ListaProdutos from '@/components/ListaProdutos';
import MenuInferior from '@/components/MenuInferior';

export default function Home() {
  // Mock de produtos (depois vou puxar do banco)
  const produtos = [
    { id: 1, nome: "Catuaba Selvagem 1L", preco: 18.00, img: "https://via.placeholder.com/150" },
    { id: 2, nome: "Catuaba Açaí 1L", preco: 18.00, img: "https://via.placeholder.com/150" },
    { id: 3, nome: "Cigarro de Palha", preco: 12.00, img: "https://via.placeholder.com/150" },
  ];

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Agiliza</h1> {/*Nome do meu sistema*/}
        <p>Minha Loja</p> {/* Nome do cliente exemplo */}
      </header>

      <ListaProdutos produtos={produtos} />
      <MenuInferior/>

      <footer className={styles.menuInferior}>
        <button>Cardápio</button>
        <button>Pedidos</button>
        <button>Perfil</button>
      </footer>
    </main>
  );
}