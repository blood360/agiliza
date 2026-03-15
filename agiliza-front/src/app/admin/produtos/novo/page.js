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
    imagem: '',
    sugestaoId: '', // 👈 Novo campo
    sugestaoMensagem: 'Macho, esse lanche combina com...' // 👈 Frase matadora
  });

  const [produtosExistentes, setProdutosExistentes] = useState([]); // Para o Select de sugestão
  const [preview, setPreview] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const notify = useNotify();
  const router = useRouter();
  const [lojaId, setLojaId] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('@Agiliza:Usuario');
    if (userJson) {
      const usuario = JSON.parse(userJson);
      setLojaId(usuario.lojaId);
      carregarProdutos(usuario.lojaId); // Busca produtos para o dropdown
    } else {
      router.push('/login');
    }
  }, [router]);

  // Busca produtos da loja para sugerir um como "upsell"
  const carregarProdutos = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/produtos?lojaId=${id}`);
      if (res.ok) {
        const dados = await res.json();
        setProdutosExistentes(dados);
      }
    } catch (err) {
      console.error("Erro ao carregar lista de produtos para sugestão");
    }
  };

  const handleImagem = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPreview(dataUrl);
          setForm({ ...form, imagem: dataUrl });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let idParaSalvar = lojaId;
    if (!idParaSalvar) {
      const userJson = localStorage.getItem('@Agiliza:Usuario');
      if (userJson) {
        const usuario = JSON.parse(userJson);
        idParaSalvar = usuario.lojaId;
      }
    }

    if (!idParaSalvar || idParaSalvar === "null") {
      return notify("Macho, não achei o ID da sua loja!", "error");
    }

    setCarregando(true);

    try {
      const res = await fetch(`${API_URL}/api/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          preco: parseFloat(form.preco),
          lojaId: idParaSalvar,
          sugestaoId: form.sugestaoId || null // Envia null se não escolher nada
        })
      });

      if (res.ok) {
        notify("Produto cadastrado com prestígio! 🍟✨", "success");
        router.push('/admin/produtos');
      } else {
        notify("Vixe, erro ao salvar!", "error");
      }
    } catch (err) {
      notify("Erro de conexão!", "error");
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
            <p>Cadastre os itens e configure a **Venda Sugerida**.</p>
          </div>
          <Link href="/admin/produtos" className={styles.btnVoltar}>← Voltar</Link>
        </header>

        <section className={styles.formContainer}>
          <form className={styles.formAgiliza} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.campoForm}>
                <label>Nome do Produto</label>
                <input type="text" placeholder="Ex: X-Tudo Piauí" required value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} />
              </div>
              <div className={styles.uploadDiscreto}>
                <label className={styles.labelUpload}>
                  {preview ? <img src={preview} alt="Preview" className={styles.previewMini} /> : <div className={styles.placeholderFoto}><span>📸</span><small>Foto</small></div>}
                  <input type="file" accept="image/*" onChange={handleImagem} hidden />
                </label>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.campoForm}>
                <label>Preço (R$)</label>
                <input type="number" step="0.01" placeholder="10.50" required value={form.preco} onChange={(e) => setForm({...form, preco: e.target.value})} />
              </div>
              <div className={styles.campoForm}>
                <label>Categoria</label>
                <select value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})}>
                  <option value="Combos">Combos</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Sobremesas">Sobremesas</option>
                  <option value="Cervejas">Cervejas</option>
                </select>
              </div>
            </div>

            <div className={styles.campoForm}>
              <label>Descrição Curta</label>
              <textarea placeholder="Ingredientes, tamanho..." rows="2" value={form.descricao} onChange={(e) => setForm({...form, descricao: e.target.value})}></textarea>
            </div>

            {/* 🔥 SEÇÃO DE VENDA SUGERIDA (O PRESTÍGIO!) */}
            <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #eee'}} />
            <h3 style={{marginBottom: '10px', fontSize: '16px'}}>Induzir Venda (Upselling) 🚀</h3>
            
            <div className={styles.row}>
              <div className={styles.campoForm}>
                <label>Sugerir qual produto?</label>
                <select value={form.sugestaoId} onChange={(e) => setForm({...form, sugestaoId: e.target.value})}>
                  <option value="">Nenhuma sugestão</option>
                  {produtosExistentes.map(p => (
                    <option key={p._id} value={p._id}>{p.nome} - R$ {p.preco.toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div className={styles.campoForm}>
                <label>Frase da Sugestão</label>
                <input type="text" value={form.sugestaoMensagem} onChange={(e) => setForm({...form, sugestaoMensagem: e.target.value})} placeholder="Ex: Combina com uma batata..." />
              </div>
            </div>

            <button type="submit" className={styles.btnConfirmarForm} disabled={carregando}>
              {carregando ? "Arrochando o nó..." : "Salvar Produto ✅"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}