-- Create avaliacoes (ratings) table
CREATE TABLE public.avaliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_cardapio_id UUID REFERENCES public.itens_cardapio(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Create policies for ratings
CREATE POLICY "Public can create ratings" 
ON public.avaliacoes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can view ratings" 
ON public.avaliacoes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage ratings" 
ON public.avaliacoes 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_avaliacoes_updated_at
BEFORE UPDATE ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Activate more menu items for a better experience
UPDATE public.itens_cardapio SET ativo = true 
WHERE nome IN (
  'X-Bacon', 
  'X-Salada', 
  'Batata Frita Simples', 
  'Batata Frita com Bacon',
  'Coca-Cola 350ml',
  'Suco Natural 500ml',
  'Açaí 300ml'
);

-- Add some ratings to existing popular items for demonstration
INSERT INTO public.avaliacoes (item_cardapio_id, cliente_nome, nota, comentario) 
SELECT 
  i.id,
  CASE 
    WHEN random() < 0.3 THEN 'Maria Silva'
    WHEN random() < 0.6 THEN 'João Santos'
    ELSE 'Ana Costa'
  END,
  CASE 
    WHEN random() < 0.7 THEN 5
    WHEN random() < 0.9 THEN 4
    ELSE 3
  END,
  CASE 
    WHEN random() < 0.5 THEN 'Muito bom!'
    WHEN random() < 0.8 THEN 'Delicioso, recomendo!'
    ELSE 'Excelente qualidade!'
  END
FROM public.itens_cardapio i 
WHERE i.ativo = true 
LIMIT 8;