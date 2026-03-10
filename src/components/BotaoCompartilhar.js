'use client'
import { useParams } from 'next/navigation';

export default function BotaoCompartilhar() {
    const params = useParams();
    const slug = params?.slug;

    const compartilhar = async () => {
        // Monta o link bonitão da loja
        const urlLoja = `${window.location.origin}/${slug}`;
        
        const dadosCompartilhamento = {
            title: `Agiliza - ${slug.replace(/-/g, ' ')}`,
            text: `Ei, macho! Dá uma olhada no meu catálogo digital aqui no Agiliza:`,
            url: urlLoja,
        };

        try {
            // Verifica se o celular do cabra suporta o compartilhamento nativo
            if (navigator.share) {
                await navigator.share(dadosCompartilhamento);
            } else {
                // Se for no PC, a gente só copia o link pro teclado
                await navigator.clipboard.writeText(urlLoja);
                alert("Link copiado! Agora é só colar lá no Zap.");
            }
        } catch (err) {
            console.error("Vixe, deu erro ao compartilhar:", err);
        }
    };

    return (
        <button 
            onClick={compartilhar}
            style={{
                background: '#e63946',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
        >
            <span>🔗</span> Compartilhar Loja
        </button>
    );
}