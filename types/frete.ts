export type ItemCarrinho = {
  id:number;
  nome:string;
  preco:number;
  quantidade:number;
  peso:number;
};

export type FreteRequest = {
  cep:string;
  itens: ItemCarrinho[];
};

export type FreteResponse = {
  subtotal:number;
  frete:number;
  total:number;
  prazo:string;
};