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
        atualizarPerfil(dados);
        
        // Dá um aviso pro cabra saber que salvou
        alert("Dados salvos com sucesso, meu patrão!");
        router.push('/'); 
    };

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1>Meu Perfil</h1>
                <p>Preencha para agilizar seu pedido!</p>
            </header>

            {/* Container do form com um padding pra não colar na tela */}
            <div className={styles.containerForm}>
                <form onSubmit={salvar} className={styles.formPerfil}>
                    <div className={styles.campo}>
                        <label>Nome Completo</label>
                        <input name="nome" placeholder="Como quer ser chamado?" defaultValue={usuario.nome} required className={styles.inputPerfil} />
                    </div>

                    <div className={styles.campo}>
                        <label>WhatsApp</label>
                        <input name="telefone" placeholder="(21) 99999-9999" defaultValue={usuario.telefone} required className={styles.inputPerfil} />
                    </div>

                    <div className={styles.campo}>
                        <label>Endereço de Entrega</label>
                        <input name="endereco" placeholder="Rua, número, bairro..." defaultValue={usuario.endereco} required className={styles.inputPerfil} />
                    </div>

                    <div className={styles.campo}>
                        <label>Ponto de Referência</label>
                        <input name="referencia" placeholder="Perto de onde?" defaultValue={usuario.referencia} className={styles.inputPerfil} />
                    </div>

                    <button type="submit" className={styles.btnFinalizar}>Salvar dados</button>
                </form>
            </div>

            {/* AQUI ESTAVA O FURO: O Menu tem que estar aqui! */}
            <MenuInferior />
        </main>
    );
}