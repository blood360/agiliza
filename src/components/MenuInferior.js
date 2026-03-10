'use client'
import Link from 'next/link';
import {usePathname, useParams} from 'next/navigation';
import styles from '@/app/page.module.css';

export default function MenuInferior() {
    const pathname = usePathname();
    const params = useParams();
    const slug = params.slug;
    const linkHome = slug ? `/${slug}` : '/';
    const linkPedidos = slug ? `/${slug}/pedidos` : '/pedidos';
    const linkPerfil = slug ? `/${slug}/perfil` : '/perfil';

    return (
        <footer className={styles.menuInferior}>
            <Link href={linkHome} className={pathname === linkHome ? styles.itemAtivo : styles.itemMenu}>
                <span>🏠</span>
                <small>Cardápio</small>
            </Link>

            <Link href={linkPedidos} className={pathname === linkPedidos ? styles.itemAtivo : styles.itemMenu}>
                <span>📋</span>
                <small>Pedidos</small>
            </Link>

            <Link href={linkPerfil} className={pathname === linkPerfil ? styles.itemAtivo : styles.itemMenu}>
                <span>👤</span>
                <small>Perfil</small>
            </Link>
        </footer>
    );
}