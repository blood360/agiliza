'use client'
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import styles from '@/app/page.module.css';

export default function MenuInferior() {
    const pathname = usePathname();
    const params = useParams();
    const slug = params.slug;

    // Se estivermos dentro de uma loja, o 'Home' volta para a vitrine da loja
    // Caso contrário, volta para o explorar.
    const linkHome = slug ? `/${slug}` : '/explorar';

    // Pedidos e Perfil agora são GLOBAIS. 
    // Não importa em qual loja o cabra esteja, ele quer ver os SEUS dados.
    const linkPedidos = '/pedidos';
    const linkPerfil = '/perfil'; 

    return (
        <footer className={styles.menuInferior}>
            {/* EXPLORAR / HOME */}
            <Link 
                href={linkHome} 
                className={pathname === linkHome || pathname === '/explorar' ? styles.itemAtivo : styles.itemMenu}
            >
                <span>🏠</span>
                <small>{slug ? 'Loja' : 'Explorar'}</small>
            </Link>

            {/* PEDIDOS - Histórico de compras do cliente */}
            <Link 
                href={linkPedidos} 
                className={pathname === linkPedidos ? styles.itemAtivo : styles.itemMenu}
            >
                <span>📋</span>
                <small>Pedidos</small>
            </Link>

            <Link 
                href={linkPerfil} 
                className={pathname === linkPerfil ? styles.itemAtivo : styles.itemMenu}
            >
                <span>👤</span>
                <small>Perfil</small>
            </Link>
        </footer>
    );
}