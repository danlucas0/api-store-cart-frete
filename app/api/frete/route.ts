import { NextResponse } from "next/server";
import { FreteRequest } from "@/types/frete";

export async function POST(req: Request) {
  try {
    const body: FreteRequest = await req.json();
    const { cep, itens } = body;

    if (!cep || !itens?.length) {
      return NextResponse.json(
        { erro: "Informe o CEP e adicione produtos ao carrinho." },
        { status: 400 }
      );
    }

    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return NextResponse.json({ erro: "CEP inválido." }, { status: 400 });
    }

    let subtotal = 0;
    let pesoTotal = 0;
    let quantidadeTotal = 0;

    itens.forEach((item) => {
      subtotal += item.preco * item.quantidade;
      pesoTotal += item.peso * item.quantidade;
      quantidadeTotal += item.quantidade;
    });

    const primeiroDigito = Number(cepLimpo[0]);

    let freteBase = 18;
    let prazo = "5 a 8 dias úteis";

    if (primeiroDigito >= 0 && primeiroDigito <= 3) {
      freteBase = 14;
      prazo = "3 a 5 dias úteis";
    } else if (primeiroDigito >= 4 && primeiroDigito <= 6) {
      freteBase = 20;
      prazo = "5 a 8 dias úteis";
    } else {
      freteBase = 26;
      prazo = "7 a 12 dias úteis";
    }

    let frete = freteBase;

    frete += pesoTotal * 2;

    if (quantidadeTotal >= 4) {
      frete += 6;
    }

    if (subtotal >= 300) {
      frete = 0;
      prazo = "Frete grátis - até 5 dias úteis";
    }

    return NextResponse.json({
      subtotal,
      frete,
      total: subtotal + frete,
      prazo,
    });
  } catch {
    return NextResponse.json(
      { erro: "Erro ao calcular frete." },
      { status: 500 }
    );
  }
}