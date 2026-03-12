'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css'; 
import Link from 'next/link';
import API_URL from '@/config/api';
import { useNotify } from '@/context/ToastContext';

export default function NovoProduto() {
  const [form, setForm] = useState({
    nome: '',
    preco: '',
    categoria: 'Combos',
    descricao: '',
    imagem: '' // Vamos salvar como string/URL ou Base64
  });

  const [preview, setPreview] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const notify = useNotify();
  const router = useRouter();

  // 1. Pega o lojaId de quem está logado
  const [lojaId, setLojaId] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('@Agiliza:Usuario');
    if (userJson) {
      const usuario = JSON.parse(userJson);
      setLojaId(usuario.lojaId);
    } else {
      router.push('/login');
    }
  }, [router]);

  // 2. Lógica para converter imagem em Base64 (pra salvar fácil no banco)
  const handleImagem = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Largura máxima de 800px (já tá ótimo pra web)
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Transforma em Base64 mas com qualidade 0.7 (comprime 30%)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPreview(dataUrl);
          setForm({ ...form, imagem: dataUrl });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Enviar para o Banco de Dados
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lojaId) return notify("Vixe, erro de identificação da loja!", "error");

    setCarregando(true);

    try {
      const res = await fetch(`${API_URL}/api/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          preco: parseFloat(form.preco),
          lojaId: lojaId // 👈 VINCULA O PRODUTO À LOJA REAL
        })
      });

      if (res.ok) {
        notify("Produto cadastrado com sucesso! 🍔🔥", "success");
        router.push('/admin/produtos'); // Volta para a listagem
      } else {
        notify("Erro ao salvar produto no banco.", "error");
      }
    } catch (err) {
      notify("Erro de conexão com o servidor!", "error");
    } finally {
      setCarregando(false);
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
          <Link href="/admin/produtos" className={styles.btnVoltar}>← Voltar</Link>
        </header>

        <section className={styles.formContainer}>
          <form className={styles.formAgiliza} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.campoForm}>
                <label>Nome do Produto</label>
                <input 
                  type="text" 
                  placeholder="Ex: Açaí 700ml" 
                  required
                  value={form.nome}
                  onChange={(e) => setForm({...form, nome: e.target.value})}
                />
              </div>

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
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="10.50" 
                  required
                  value={form.preco}
                  onChange={(e) => setForm({...form, preco: e.target.value})}
                />
              </div>
              <div className={styles.campoForm}>
                <label>Categoria</label>
                <select 
                  value={form.categoria}
                  onChange={(e) => setForm({...form, categoria: e.target.value})}
                >
                  <option value="Combos">Combos</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Sobremesas">Sobremesas</option>
                  <option value="Cervejas">Cervejas</option>
                </select>
              </div>
            </div>

            <div className={styles.campoForm}>
              <label>Descrição Curta</label>
              <textarea 
                placeholder="Descreva o produto (ingredientes, tamanho...)" 
                rows="3"
                value={form.descricao}
                onChange={(e) => setForm({...form, descricao: e.target.value})}
              ></textarea>
            </div>

            <button type="submit" className={styles.btnConfirmarForm} disabled={carregando}>
              {carregando ? "Salvando..." : "Salvar Produto ✅"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
