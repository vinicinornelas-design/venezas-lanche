export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          cliente_nome: string
          cliente_telefone: string | null
          comentario: string | null
          created_at: string
          id: string
          item_cardapio_id: string | null
          nota: number
          pedido_id: string | null
          updated_at: string
        }
        Insert: {
          cliente_nome: string
          cliente_telefone?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          item_cardapio_id?: string | null
          nota: number
          pedido_id?: string | null
          updated_at?: string
        }
        Update: {
          cliente_nome?: string
          cliente_telefone?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          item_cardapio_id?: string | null
          nota?: number
          pedido_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_item_cardapio_id_fkey"
            columns: ["item_cardapio_id"]
            isOneToOne: false
            referencedRelation: "itens_cardapio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      bairros: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
          taxa_entrega: number
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          taxa_entrega?: number
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          taxa_entrega?: number
        }
        Relationships: []
      }
      categorias: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          id: string
          updated_at: string | null
          valor: Json
        }
        Insert: {
          chave: string
          id?: string
          updated_at?: string | null
          valor: Json
        }
        Update: {
          chave?: string
          id?: string
          updated_at?: string | null
          valor?: Json
        }
        Relationships: []
      }
      customer_remarketing: {
        Row: {
          campaign_type: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string
          id: string
          last_contact_date: string | null
          priority: string | null
          remarketing_message: string | null
          response_received: boolean | null
          scheduled_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_type?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone: string
          id?: string
          last_contact_date?: string | null
          priority?: string | null
          remarketing_message?: string | null
          response_received?: boolean | null
          scheduled_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_type?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string
          id?: string
          last_contact_date?: string | null
          priority?: string | null
          remarketing_message?: string | null
          response_received?: boolean | null
          scheduled_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          last_order_at: string | null
          loyalty_points: number | null
          name: string
          phone: string
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
          whatsapp_opt_in: boolean | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_order_at?: string | null
          loyalty_points?: number | null
          name: string
          phone: string
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          whatsapp_opt_in?: boolean | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_order_at?: string | null
          loyalty_points?: number | null
          name?: string
          phone?: string
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          whatsapp_opt_in?: boolean | null
        }
        Relationships: []
      }
      daily_revenue: {
        Row: {
          average_ticket: number | null
          created_at: string | null
          date: string
          id: string
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          average_ticket?: number | null
          created_at?: string | null
          date: string
          id?: string
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          average_ticket?: number | null
          created_at?: string | null
          date?: string
          id?: string
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      eventos_pedido: {
        Row: {
          created_at: string | null
          detalhes_json: Json | null
          id: string
          pedido_id: string | null
          tipo_evento: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          detalhes_json?: Json | null
          id?: string
          pedido_id?: string | null
          tipo_evento: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          detalhes_json?: Json | null
          id?: string
          pedido_id?: string | null
          tipo_evento?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          ativo: boolean | null
          cargo: string
          created_at: string | null
          email: string
          id: string
          last_activity: string | null
          nivel_acesso: string
          nome: string
          profile_id: string | null
          telefone: string | null
          total_mesas_atendidas: number | null
          total_pedidos_processados: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo: string
          created_at?: string | null
          email: string
          id?: string
          last_activity?: string | null
          nivel_acesso?: string
          nome: string
          profile_id?: string | null
          telefone?: string | null
          total_mesas_atendidas?: number | null
          total_pedidos_processados?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string
          created_at?: string | null
          email?: string
          id?: string
          last_activity?: string | null
          nivel_acesso?: string
          nome?: string
          profile_id?: string | null
          telefone?: string | null
          total_mesas_atendidas?: number | null
          total_pedidos_processados?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_cardapio: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          created_at: string | null
          descricao: string | null
          foto_url: string | null
          id: string
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string | null
          descricao?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          preco: number
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string | null
          descricao?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_cardapio_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      mesas: {
        Row: {
          closed_at: string | null
          created_at: string | null
          etiqueta: string | null
          id: string
          numero: number
          observacoes: string | null
          opened_at: string | null
          responsavel_funcionario_id: string | null
          status: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          etiqueta?: string | null
          id?: string
          numero: number
          observacoes?: string | null
          opened_at?: string | null
          responsavel_funcionario_id?: string | null
          status?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          etiqueta?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          opened_at?: string | null
          responsavel_funcionario_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mesas_responsavel_funcionario_id_fkey"
            columns: ["responsavel_funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      mesas_atividade: {
        Row: {
          acao: string
          created_at: string | null
          funcionario_id: string | null
          id: string
          mesa_id: string | null
          observacoes: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          funcionario_id?: string | null
          id?: string
          mesa_id?: string | null
          observacoes?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          funcionario_id?: string | null
          id?: string
          mesa_id?: string | null
          observacoes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mesas_atividade_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesas_atividade_mesa_id_fkey"
            columns: ["mesa_id"]
            isOneToOne: false
            referencedRelation: "mesas"
            referencedColumns: ["id"]
          },
        ]
      }
      opcionais: {
        Row: {
          id: string
          item_id: string | null
          multi_selecao: boolean | null
          nome: string
          obrigatorio: boolean | null
          preco_extra: number | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          multi_selecao?: boolean | null
          nome: string
          obrigatorio?: boolean | null
          preco_extra?: number | null
        }
        Update: {
          id?: string
          item_id?: string | null
          multi_selecao?: boolean | null
          nome?: string
          obrigatorio?: boolean | null
          preco_extra?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opcionais_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_cardapio"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          observacoes: string | null
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          observacoes?: string | null
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          observacoes?: string | null
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          id: string
          notes: string | null
          order_number: string
          order_type: string | null
          status: string | null
          total_amount: number
          updated_at: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          id?: string
          notes?: string | null
          order_number: string
          order_type?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          order_type?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          fee_type: string
          fee_value: number
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          fee_type: string
          fee_value?: number
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          fee_type?: string
          fee_value?: number
          id?: string
          nome?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          cliente_nome: string | null
          cliente_telefone: string | null
          created_at: string | null
          endereco_json: Json | null
          funcionario_id: string | null
          funcionario_nome: string | null
          id: string
          mesa_id: string | null
          metodo_pagamento: string | null
          observacoes: string | null
          observacoes_cliente: string | null
          origem: string
          pago: boolean | null
          status: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          cliente_nome?: string | null
          cliente_telefone?: string | null
          created_at?: string | null
          endereco_json?: Json | null
          funcionario_id?: string | null
          funcionario_nome?: string | null
          id?: string
          mesa_id?: string | null
          metodo_pagamento?: string | null
          observacoes?: string | null
          observacoes_cliente?: string | null
          origem: string
          pago?: boolean | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          cliente_nome?: string | null
          cliente_telefone?: string | null
          created_at?: string | null
          endereco_json?: Json | null
          funcionario_id?: string | null
          funcionario_nome?: string | null
          id?: string
          mesa_id?: string | null
          metodo_pagamento?: string | null
          observacoes?: string | null
          observacoes_cliente?: string | null
          origem?: string
          pago?: boolean | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_mesa_id_fkey"
            columns: ["mesa_id"]
            isOneToOne: false
            referencedRelation: "mesas"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_itens: {
        Row: {
          id: string
          item_cardapio_id: string | null
          observacoes: string | null
          observacoes_item: string | null
          pedido_id: string | null
          preco_unitario: number
          quantidade: number
        }
        Insert: {
          id?: string
          item_cardapio_id?: string | null
          observacoes?: string | null
          observacoes_item?: string | null
          pedido_id?: string | null
          preco_unitario: number
          quantidade?: number
        }
        Update: {
          id?: string
          item_cardapio_id?: string | null
          observacoes?: string | null
          observacoes_item?: string | null
          pedido_id?: string | null
          preco_unitario?: number
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_itens_item_cardapio_id_fkey"
            columns: ["item_cardapio_id"]
            isOneToOne: false
            referencedRelation: "itens_cardapio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_itens_opcionais: {
        Row: {
          id: string
          opcional_id: string | null
          pedido_item_id: string | null
          preco_extra: number | null
        }
        Insert: {
          id?: string
          opcional_id?: string | null
          pedido_item_id?: string | null
          preco_extra?: number | null
        }
        Update: {
          id?: string
          opcional_id?: string | null
          pedido_item_id?: string | null
          preco_extra?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_itens_opcionais_opcional_id_fkey"
            columns: ["opcional_id"]
            isOneToOne: false
            referencedRelation: "opcionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_itens_opcionais_pedido_item_id_fkey"
            columns: ["pedido_item_id"]
            isOneToOne: false
            referencedRelation: "pedidos_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          rating: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          rating?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          rating?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
          papel: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          papel?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          papel?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      restaurant_config: {
        Row: {
          banner_url: string | null
          created_at: string | null
          endereco: string | null
          horario_funcionamento: Json | null
          id: string
          logo_url: string | null
          nome_restaurante: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          endereco?: string | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome_restaurante?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          endereco?: string | null
          horario_funcionamento?: Json | null
          id?: string
          logo_url?: string | null
          nome_restaurante?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_notifications: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          read_by: string[] | null
          target_role: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          read_by?: string[] | null
          target_role?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          read_by?: string[] | null
          target_role?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          customer_phone: string
          id: string
          message_content: string
          message_type: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          customer_phone: string
          id?: string
          message_content: string
          message_type: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          customer_phone?: string
          id?: string
          message_content?: string
          message_type?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
