'use client'
import styles from './suspenso.module.css';
import Image from 'next/image';

export default function PaginaSuspenso() {
  return (
    <div className={styles.containerSuspenso}>
      <div className={styles.cardAviso}>
        <Image 
            src="/logoAS.png" 
            alt="AS Automações" 
            width={160}    // Aumentamos a largura base
            height={60}    // Altura base maior pra não achatar
            className={styles.logoSuspenso} // Classe específica pra essa página
            priority 
        />
        
        <div className={styles.iconErro}>⚠️</div>
        
        <h1>Acesso Suspenso</h1>
        <p>Prezado parceiro, identificamos uma pendência técnica ou financeira em sua assinatura.</p>
        
        <div className={styles.infoSuporte}>
          <span>Para regularizar e voltar a vender agora, fale com nosso suporte:</span>
          <a href="https://wa.me/5521980867488" target="_blank" className={styles.btnSuporte}>
            📱 Chamar no WhatsApp da AS
          </a>
        </div>
        
        <small>Equipe AS Automações - Tecnologia que Agiliza.</small>
      </div>
    </div>
  );
}