"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Produto } from "@/types/produto";

type ItemCarrinho = {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  peso: number;
};

type ResultadoFrete = {
  subtotal: number;
  frete: number;
  total: number;
  prazo: string;
};

type Endereco = {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export default function LojaPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [resultado, setResultado] = useState<ResultadoFrete | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [erro, setErro] = useState("");
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  useEffect(() => {
    async function carregarProdutos() {
      const res = await fetch("https://fakestoreapi.com/products");
      const data = await res.json();
      setProdutos(data);
    }

    carregarProdutos();
  }, []);

  const subtotalCarrinho = useMemo(() => {
    return carrinho.reduce(
      (total, item) => total + item.preco * item.quantidade,
      0
    );
  }, [carrinho]);

  const quantidadeCarrinho = useMemo(() => {
    return carrinho.reduce((total, item) => total + item.quantidade, 0);
  }, [carrinho]);

  function limparResultado() {
    setResultado(null);
    setErro("");
  }

  function adicionarAoCarrinho(produto: Produto) {
    limparResultado();

    setCarrinho((atual) => {
      const produtoExiste = atual.find((item) => item.id === produto.id);

      if (produtoExiste) {
        return atual.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [
        ...atual,
        {
          id: produto.id,
          nome: produto.title,
          preco: produto.price,
          quantidade: 1,
          peso: 1,
        },
      ];
    });
  }

  function aumentarQuantidade(id: number) {
    limparResultado();

    setCarrinho((atual) =>
      atual.map((item) =>
        item.id === id ? { ...item, quantidade: item.quantidade + 1 } : item
      )
    );
  }

  function diminuirQuantidade(id: number) {
    limparResultado();

    setCarrinho((atual) =>
      atual
        .map((item) =>
          item.id === id ? { ...item, quantidade: item.quantidade - 1 } : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  function removerItem(id: number) {
    limparResultado();
    setCarrinho((atual) => atual.filter((item) => item.id !== id));
  }

async function buscarCep() {
 const cepLimpo = cep.replace(/\D/g,"");

 setEndereco(null);
 setResultado(null);

 if(cepLimpo.length !== 8){
   setErro("Digite um CEP válido.");
   return;
 }

 try{
   setLoadingCep(true);
   setErro("");

   const res = await fetch("/api/cep",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        cep:cepLimpo
      })
   });

   const data = await res.json();

   if(!res.ok){
      setErro(data.erro);
      return;
   }

   setEndereco({
      rua:data.rua,
      bairro:data.bairro,
      cidade:data.cidade,
      estado:data.estado
   });

 } catch {
   setErro("Erro ao buscar endereço.");
 } finally{
   setLoadingCep(false);
 }
}
  async function calcularFrete() {
    try {
      setLoading(true);
      setErro("");
      setResultado(null);

      const res = await fetch("/api/frete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cep,
          itens: carrinho,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao calcular frete.");
        return;
      }

      setResultado(data);
    } catch {
      setErro("Erro ao conectar com a API de frete.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="products-page">
      <button
        className="floating-cart-button"
        onClick={() => setCarrinhoAberto(true)}
      >
        <span className="cart-icon">🛒</span>

        <div>
          <strong>{quantidadeCarrinho} item(ns)</strong>
          <small>R$ {subtotalCarrinho.toFixed(2)}</small>
        </div>
      </button>

      {carrinhoAberto && (
        <>
          <div
            className="cart-overlay"
            onClick={() => setCarrinhoAberto(false)}
          />

          <aside className="cart-drawer">
            <div className="cart-drawer-header">
              <div>
                <h2>Carrinho</h2>
                <p>{quantidadeCarrinho} item(ns)</p>
              </div>

              <button onClick={() => setCarrinhoAberto(false)}>×</button>
            </div>

            {carrinho.length === 0 ? (
              <p className="cart-empty">Nenhum produto adicionado ainda.</p>
            ) : (
              <div className="cart-items">
                {carrinho.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-info">
                      <strong>{item.nome}</strong>
                      <span>R$ {item.preco.toFixed(2)}</span>
                    </div>

                    <div className="cart-controls">
                      <button onClick={() => diminuirQuantidade(item.id)}>
                        -
                      </button>

                      <span>{item.quantidade}</span>

                      <button onClick={() => aumentarQuantidade(item.id)}>
                        +
                      </button>
                    </div>

                    <button
                      className="cart-remove"
                      onClick={() => removerItem(item.id)}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>R$ {subtotalCarrinho.toFixed(2)}</strong>
              </div>
            </div>

            <div className="frete-area">
              <input
                className="input"
                placeholder="Digite seu CEP"
                value={cep}
                onChange={(e) => {
                  setCep(e.target.value);
                  setEndereco(null);
                  setResultado(null);
                  setErro("");
                }}
                onBlur={buscarCep}
                maxLength={9}
              />

              {loadingCep && (
                <p className="cart-empty">Buscando endereço...</p>
              )}

              {endereco && (
                <div className="address-preview">
                  <strong>
                    {endereco.cidade} - {endereco.estado}
                  </strong>
                  <span>
                    {endereco.rua}, {endereco.bairro}
                  </span>
                </div>
              )}

              <button
                className="product-button"
                onClick={calcularFrete}
                disabled={loading || carrinho.length === 0}
              >
                {loading ? "Calculando..." : "Calcular frete"}
              </button>
            </div>

            {erro && <p className="cart-error">{erro}</p>}

            {resultado && (
              <div className="result-box">
                <p>Subtotal: R$ {resultado.subtotal.toFixed(2)}</p>
                <p>Frete: R$ {resultado.frete.toFixed(2)}</p>
                <p>Prazo: {resultado.prazo}</p>
                <strong>Total: R$ {resultado.total.toFixed(2)}</strong>
              </div>
            )}
          </aside>
        </>
      )}

      <section className="products-hero">
        <span>🛒 Fake Store API + ViaCEP</span>
        <h1>Loja Demo</h1>
        <p>
          Produtos de API externa com carrinho flutuante, busca de endereço por
          CEP e cálculo de frete no back-end.
        </p>
      </section>

      <section className="products-grid">
        {produtos.map((produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
            onAdicionar={adicionarAoCarrinho}
          />
        ))}
      </section>
    </main>
  );
}