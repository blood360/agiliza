'use client'
import { useState } from 'react';
import styles from '../../admin.module.css'; // Usando o mesmo estilo harmonioso
import Link from 'next/link';

export default function NovoProduto() {
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImagem = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setPreview(URL.createObjectURL(file)); // Cria uma "foto" temporária pro lojista ver
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
          <div className={styles.welcomeText}>
            <h1>Novo Produto 🍔</h1>
            <p>Cadastre os itens do seu cardápio com elegância.</p>
          </div>
          <Link href="/admin" className={styles.btnVoltar}>← Voltar</Link>
        </header>

        <section className={styles.formContainer}>
          <form className={styles.formAgiliza}>
            <div className={styles.row}>
              {/* NOME DO PRODUTO */}
              <div className={styles.campoForm}>
                <label>Nome do Produto</label>
                <input type="text" placeholder="Ex: Açaí 700ml" />
              </div>

              {/* UPLOAD DISCRETO (O Pulo do Gato) */}
              <div className={styles.uploadDiscreto}>
                <label className={styles.labelUpload}>
                  {preview ? (
                    <img src={preview} alt="Preview" className={styles.previewMini} />
                  ) : (
                    <div className={styles.placeholderFoto}>
                      <span>📸</span>
                      <small>Foto</small>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImagem} hidden />
                </label>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.campoForm}>
                <label>Preço (R$)</label>
                <input type="number" step="0.01" placeholder="10" />
              </div>
              <div className={styles.campoForm}>
                <label>Categoria</label>
                <select>
                  <option>Combos</option>
                  <option>Bebidas</option>
                  <option>Sobremesas</option>
                </select>
              </div>
            </div>

            <div className={styles.campoForm}>
              <label>Descrição Curta</label>
              <textarea placeholder="Descreva o produto" rows="3"></textarea>
            </div>

            <button type="submit" className={styles.btnConfirmarForm}>
              Salvar Produto
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}