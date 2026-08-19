/*
  O que precisa estar em memoria antes da primeira tela valer a pena.

  HOJE A LISTA E VAZIA, e isso e uma constatacao e nao um esqueceu.

  Ela existia para as tres camadas do pack composto, que nunca foram
  produzidas — ver docs/arquivo/README.md. Com a composicao fora da arvore em
  18/08/2026, nao sobrou nenhum asset que valha segurar a primeira tela: os
  packshots do heroi ja carregam com prioridade alta pelo proprio markup, que
  e mais rapido que esperar um preload terminar.

  Enquanto voltar vazia, o loader nao monta. Loader sem carga e uma tela a
  mais entre a pessoa e o site, em nome de nada.
*/
export function criticalAssets(): string[] {
  return []
}
