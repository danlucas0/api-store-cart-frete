import { Produto } from "@/types/produto";

type Props = {
  produto: Produto;
  onAdicionar: (produto: Produto) => void;
};

export default function ProductCard({ produto, onAdicionar }: Props) {
  return (
    <article className="product-card">
      <div className="product-image-box">
        <img src={produto.image} alt={produto.title} className="product-image" />
      </div>

      <div className="product-info">
        <span className="product-category">{produto.category}</span>

        <h2>{produto.title}</h2>

        <p>{produto.description}</p>

        <div className="product-footer">
          <strong>R$ {produto.price.toFixed(2)}</strong>
          <span>⭐ {produto.rating?.rate ?? 0}</span>
        </div>

        <button className="product-button" onClick={() => onAdicionar(produto)}>
          Adicionar ao carrinho
        </button>
      </div>
    </article>
  );
}