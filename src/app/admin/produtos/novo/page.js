'use client'
import { useState } from 'react';
import styles from './novo-produto.module.css';
import Link from 'next/link';

export default function NovoProduto() {
    const [produto, setProduto] = useState({
        nome: '',
        preco: '',
        descricao: '',
        categoria: 'Bebidas'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const produtosSalvos = JSON.parse(localStorage.getItem('agiliza_produtos') || '[]');
        const novo = {...produto, id: Date.now()};
        localStorage.setItem('agiliza_produtos', JSON.stringify([...produtosSalvos, novo]));
        alert("Produto salvo no sistema!");
        window.location.href = '/admin/produtos';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.voltar}>← Sair do Painel</Link>
                <h1>Cadastrar Novo Produto</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.campo}>
                    <label>Nome do Produto</label>
                    <input
                        type='text'
                        placeholder='Ex: Cerveja Heineken'
                        value={produto.nome}
                        onChange={(e) => setProduto({...produto, nome: e.target.value})}
                        required
                    />
                </div>

                <div className={styles.campo}>
                    <label>Preço (R$)</label>
                    <input
                        type='number'
                        step='0.01'
                        placeholder='0,00'
                        value={produto.preco}
                        onChange={(e) => setProduto({...produto, preco: e.target.value})}
                        required
                    />
                </div>

                <div className={styles.campo}>
                    <label>Categorias</label>
                    <select
                        value={produto.categoria}
                        onChange={(e) => setProduto({...produto, categoria: e.target.value})}
                    >
                        <option>Bebidas</option>
                        <option>Comida</option>
                        <option>Tabacaria</option>
                        <option>Outros</option>
                    </select>
                </div>

                <div className={styles.campo}>
                    <label>Descrição (Opcional)</label>
                    <textarea
                        placeholder='Diga para o cliente por que esse produto é melhor...'
                        value={produto.descricao}
                        onChange={(e) => setProduto({...produto, descricao: e.target.value})}
                    />
                </div>

                <button type='submit' className={styles.btnSalvar}>
                    Salvar Produto
                </button>
            </form>
        </div>
    );
}