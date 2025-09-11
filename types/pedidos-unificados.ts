// Tipos específicos para a tabela unificada de pedidos

export interface PedidoItemAdicional {
  nome: string;
  preco: number;
  quantidade: number;
}

export interface PedidoItem {
  nome: string;
  preco_unitario: number;
  quantidade: number;
  observacoes?: string;
  categoria: string;
  adicionais: PedidoItemAdicional[];
}

export interface PedidoUnificado {
  // Identificação
  id: string;
  numero_pedido: number;
  created_at: string;
  updated_at: string;

  // Cliente/Mesa
  cliente_nome?: string;
  cliente_telefone?: string;
  cliente_endereco?: string;
  cliente_bairro?: string;
  mesa_numero?: number;
  mesa_etiqueta?: string;

  // Origem e funcionário
  origem: 'BALCAO' | 'MESA' | 'DELIVERY' | 'IFOOD' | 'WHATSAPP';
  funcionario_id?: string;
  funcionario_nome?: string;

  // Itens do pedido
  itens: PedidoItem[];

  // Valores
  subtotal: number;
  taxa_entrega: number;
  desconto: number;
  total: number;

  // Status e pagamento
  status: 'PENDENTE' | 'PREPARANDO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';
  metodo_pagamento?: string;
  pago: boolean;
  troco_para?: number;
  valor_pago?: number;

  // Observações
  observacoes?: string;
  observacoes_cozinha?: string;
  observacoes_entrega?: string;

  // Controle de tempo
  tempo_preparo_estimado?: number;
  tempo_entrega_estimado?: number;
  iniciado_preparo_em?: string;
  finalizado_preparo_em?: string;
  entregue_em?: string;

  // Avaliação
  avaliacao_nota?: number;
  avaliacao_comentario?: string;
  avaliacao_em?: string;
}

export interface CriarPedidoUnificado {
  cliente_nome?: string;
  cliente_telefone?: string;
  cliente_endereco?: string;
  cliente_bairro?: string;
  mesa_numero?: number;
  mesa_etiqueta?: string;
  origem: 'BALCAO' | 'MESA' | 'DELIVERY' | 'IFOOD' | 'WHATSAPP';
  funcionario_id?: string;
  funcionario_nome?: string;
  itens: PedidoItem[];
  taxa_entrega?: number;
  desconto?: number;
  metodo_pagamento?: string;
  observacoes?: string;
  observacoes_cozinha?: string;
  observacoes_entrega?: string;
  tempo_preparo_estimado?: number;
  tempo_entrega_estimado?: number;
  troco_para?: number;
}

export interface AtualizarPedidoUnificado {
  status?: 'PENDENTE' | 'PREPARANDO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';
  metodo_pagamento?: string;
  pago?: boolean;
  valor_pago?: number;
  observacoes?: string;
  observacoes_cozinha?: string;
  observacoes_entrega?: string;
  iniciado_preparo_em?: string;
  finalizado_preparo_em?: string;
  entregue_em?: string;
  avaliacao_nota?: number;
  avaliacao_comentario?: string;
  avaliacao_em?: string;
}

// Funções utilitárias para trabalhar com pedidos unificados
export const calcularSubtotalItem = (item: PedidoItem): number => {
  const subtotalPrincipal = item.preco_unitario * item.quantidade;
  const subtotalAdicionais = item.adicionais.reduce(
    (total, adicional) => total + (adicional.preco * adicional.quantidade),
    0
  );
  return subtotalPrincipal + subtotalAdicionais;
};

export const calcularTotalPedido = (itens: PedidoItem[], taxaEntrega = 0, desconto = 0): number => {
  const subtotal = itens.reduce((total, item) => total + calcularSubtotalItem(item), 0);
  return subtotal + taxaEntrega - desconto;
};

export const formatarStatusPedido = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDENTE: 'Pendente',
    PREPARANDO: 'Preparando',
    PRONTO: 'Pronto',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado'
  };
  return statusMap[status] || status;
};

export const formatarOrigemPedido = (origem: string): string => {
  const origemMap: Record<string, string> = {
    BALCAO: 'Balcão',
    MESA: 'Mesa',
    DELIVERY: 'Delivery',
    IFOOD: 'iFood',
    WHATSAPP: 'WhatsApp'
  };
  return origemMap[origem] || origem;
};

export const criarItemPedido = (
  nome: string,
  precoUnitario: number,
  quantidade: number,
  categoria: string,
  observacoes?: string,
  adicionais: PedidoItemAdicional[] = []
): PedidoItem => ({
  nome,
  preco_unitario: precoUnitario,
  quantidade,
  categoria,
  observacoes,
  adicionais
});

export const adicionarItemAoPedido = (
  pedido: CriarPedidoUnificado,
  item: PedidoItem
): CriarPedidoUnificado => ({
  ...pedido,
  itens: [...pedido.itens, item]
});

export const removerItemDoPedido = (
  pedido: CriarPedidoUnificado,
  index: number
): CriarPedidoUnificado => ({
  ...pedido,
  itens: pedido.itens.filter((_, i) => i !== index)
});

export const atualizarQuantidadeItem = (
  pedido: CriarPedidoUnificado,
  index: number,
  novaQuantidade: number
): CriarPedidoUnificado => ({
  ...pedido,
  itens: pedido.itens.map((item, i) => 
    i === index ? { ...item, quantidade: novaQuantidade } : item
  )
});

// Hook para gerenciar estado de pedido unificado
export const usePedidoUnificado = () => {
  // Este hook pode ser implementado posteriormente para gerenciar
  // o estado do pedido no frontend
  return {
    // Métodos para gerenciar o pedido
  };
};
