'use client'
import styles from '@/app/page.module.css';
import ListaProdutos from '@/components/ListaProdutos';
import MenuInferior from '@/components/MenuInferior';
import { useParams } from 'next/navigation';
// ESSA LINHA AQUI É A QUE TAVA FALTANDO, MACHO:
import BotaoCompartilhar from '@/components/BotaoCompartilhar'; 

export default function Home() {
  const params = useParams();
  const slug = params?.slug;

  if (!slug) return <main className={styles.main}><p>Carregando...</p></main>;

  const nomeDaLoja = slug.replace(/-/g, ' ').toUpperCase();

  const produtos = [
    { id: 1, nome: "Catuaba Selvagem 1L", preco: 18.00, img: "/catuaba-selvagem.jpg" },
    { id: 2, nome: "Catuaba Açaí 1L", preco: 18.00, img: "/catuaba-acai.jpg" },
    { id: 3, nome: "Cigarro de Lucky Striky", preco: 13.00, img: "/cigarro.jpg" },
  ];

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.logoAgiliza}>Agiliza</h1>
        <p className={styles.nomeAssinante}>{nomeDaLoja}</p>
        
        {/* Agora o componente vai funcionar porque a gente importou ele! */}
        <BotaoCompartilhar /> 
      </header>

      <ListaProdutos produtos={produtos} />
      <MenuInferior />
    </main>
  );
}