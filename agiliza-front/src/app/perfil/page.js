'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API_URL from '@/config/api';
import MenuInferior from '@/components/MenuInferior';
import styles from './perfil.module.css';

export default function Perfil() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('agiliza_token');
        if (!token) return router.push('/login');

        fetch(`${API_URL}/api/usuarios/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => console.log("Erro ao carregar perfil"));
    }, []);

    return (
        <div className={styles.container}>
            <h1>Meu Perfil</h1>
            {user ? (
                <div className={styles.dados}>
                    <p><strong>Nome:</strong> {user.nome}</p>
                    <p><strong>WhatsApp:</strong> {user.telefone}</p>
                    <p><strong>Endereço:</strong> {user.endereco || 'Não cadastrado'}</p>
                </div>
            ) : <p>Carregando seus dados...</p>}
            <MenuInferior />
        </div>
    );
}