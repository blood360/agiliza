'use client'
import { useAgiliza } from "@/context/AgilizaContext";
import { useRouter } from "next/navigation";
import MenuInferior from "@/components/MenuInferior";
import styles from '@/app/page.module.css';

export default function Perfil() {
    const { usuario, atualizarPerfil } = useAgiliza();
    const router = useRouter();

    const salvar = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const dados = Object.fromEntries(formData);
        
        // 1. Atualiza o estado global (Contexto)
        atualizarPerfil(dados);
        
        // 2. O PULO DO GATO: Garante que o localStorage tenha a chave que a loja busca
        localStorage.setItem('agiliza_cliente_perfil', JSON.stringify(dados));
        
        alert("Dados salvos com sucesso, meu patrão! Agora o Agiliza tá tinindo.");
        router.push('/'); 
    };

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1>Meu Perfil</h1>
                <p>Preencha para agilizar seu pedido!</p>
            </header>

            <div className={styles.containerForm}>
                <form onSubmit={salvar} className={styles.formPerfil}>
                    <div className={styles.campo}>
                        <label>Nome Completo</label>
                        <input name="nome" placeholder="Como quer ser chamado?" defaultValue={usuario?.nome} required className={styles.inputPerfil} />
                    </div>

                    <div className={styles.campo}>
                        <label>WhatsApp</label>
                        <input name="telefone" placeholder="(21) 99999-9999" defaultValue={usuario?.telefone} required className={styles.inputPerfil} />
                    </div>

                    <div className={styles.campo}>
                        <label>Endereço de Entrega</label>
                        <input name="endereco" placeholder="Rua, número, bairro..." defaultValue={usuario?.endereco} required className={styles.inputPerfil} />
                    </div>

                    <div className={styles.campo}>
                        <label>Ponto de Referência</label>
                        <input name="referencia" placeholder="Perto de onde?" defaultValue={usuario?.referencia} className={styles.inputPerfil} />
                    </div>

                    <button type="submit" className={styles.btnFinalizar}>Salvar dados</button>
                </form>
            </div>

            <MenuInferior />
        </main>
    );
}