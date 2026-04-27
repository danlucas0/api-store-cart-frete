import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cep = String(body.cep || "").replace(/\D/g,"");

    if(cep.length !== 8){
      return NextResponse.json(
        { erro: "CEP inválido" },
        { status:400 }
      );
    }

    const res = await fetch(
      `https://viacep.com.br/ws/${cep}/json/`,
      {
        cache:"no-store"
      }
    );

    const data = await res.json();

    if(data.erro){
      return NextResponse.json(
        { erro:"CEP não encontrado" },
        { status:404 }
      );
    }

    return NextResponse.json({
      rua:data.logradouro,
      bairro:data.bairro,
      cidade:data.localidade,
      estado:data.uf
    });

  } catch {
    return NextResponse.json(
      { erro:"Erro ao consultar CEP" },
      { status:500 }
    );
  }
}