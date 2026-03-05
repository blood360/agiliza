'use client'
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import styles from '@/app/page.module.css';

export default function MenuInferior() {
    const pathname = usePathname();

    return (
        <footer className={styles.menuInferior}>
            <Link href="/" className={pathname === '/' ? styles.itemAtivo : styles.itemMenu}>
                <span>🏠</span>
                <small>Cardápio</small>
            </Link>

            <Link href="/pedidos" className={pathname === '/pedidos' ? styles.itemAtivo : styles.itemMenu}>
                <span>📋</span>
                <small>Pedidos</small>
            </Link>

            <Link href="/perfil" className={pathname === '/perfil' ? styles.itemAtivo : styles.itemMenu}>
                <span>👤</span>
                <small>Perfil</small>
            </Link>
        </footer>
    );
}