import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { usePdfExport } from "@/hooks/usePdfExport";
import MinimalFileUpload from "@/components/MinimalFileUpload";
import { Plus, Edit, Trash2, Upload, Star, FileText, Image, X, FolderPlus, Settings } from "lucide-react";

interface MenuItem {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  foto_url: string;
  ativo: boolean;
  categoria_id: string;
  categorias?: {
    nome: string;
  };
}

interface Category {
  id: string;
  nome: string;
  ativo: boolean;
  ordem?: number;
}

interface Adicional {
  id: string;
  nome: string;
  preco_extra: number;
  item_id?: string;
  multi_selecao?: boolean;
  obrigatorio?: boolean;
}

export default function ExpandedMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isAdicionaisDialogOpen, setIsAdicionaisDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAdicional, setSelectedAdicional] = useState<Adicional | null>(null);
  const [restaurantConfig, setRestaurantConfig] = useState({
    nome_restaurante: "Veneza's Lanches",
    telefone: "(31) 99999-0000",
    endereco: "Rua das Palmeiras, 456 - Centro",
    logo_url: ""
  });
  const [formData, setFormData] = useState({
    nome: "",
    preco: 0,
    descricao: "",
    foto_url: "",
    categoria_id: "",
    ativo: true
  });
  const [categoryFormData, setCategoryFormData] = useState({
    nome: "",
    ativo: true,
    ordem: 0
  });
  const [adicionalFormData, setAdicionalFormData] = useState({
    nome: "",
    preco_extra: 0,
    multi_selecao: false,
    obrigatorio: false,
    item_id: ""
  });
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAdicionais, setBulkAdicionais] = useState("");
  const [selectedCategoryForBulk, setSelectedCategoryForBulk] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { exportMenuToPdf, isExporting } = usePdfExport();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setError(null);
        await Promise.all([
          fetchMenuItems(),
          fetchCategories(),
          fetchRestaurantConfig()
        ]);
      } catch (err) {
        console.error('Erro ao inicializar componente:', err);
        setError('Erro ao carregar dados do cardápio');
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do cardápio",
          variant: "destructive",
        });
      }
    };
    
    initializeComponent();
  }, []);

  // Carregar adicionais quando o modal abrir
  useEffect(() => {
    if (isAdicionaisDialogOpen) {
      fetchAdicionais();
    }
  }, [isAdicionaisDialogOpen]);

  // Forçar carregamento dos adicionais padrão na primeira vez
  useEffect(() => {
    const hasAdicionais = localStorage.getItem('venezas_adicionais');
    if (!hasAdicionais) {
      const defaultAdicionais = getLocalAdicionais();
      setAdicionais(defaultAdicionais);
      saveLocalAdicionais(defaultAdicionais);
    }
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('itens_cardapio')
        .select(`
          *,
          categorias (nome)
        `)
        .order('nome');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens do cardápio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('ordem', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    }
  };

  const fetchRestaurantConfig = async () => {
    try {
      const { data } = await supabase
        .from('restaurant_config')
        .select('*')
        .single();

      if (data) setRestaurantConfig(data);
    } catch (error) {
      console.error('Error fetching restaurant config:', error);
    }
  };

  const fetchAdicionais = async () => {
    try {
      // Primeiro, tentar usar dados locais para evitar erros
      const localAdicionais = getLocalAdicionais();
      setAdicionais(localAdicionais);
      
      // Depois, tentar buscar da tabela opcionais (opcional)
      try {
        const { data, error } = await supabase
          .from('opcionais')
          .select('*')
          .order('nome');

        if (!error && data) {
          setAdicionais(data);
        }
      } catch (dbError) {
        console.log('Banco de dados não disponível, usando dados locais');
      }
    } catch (error) {
      console.error('Error fetching adicionais:', error);
      // Em caso de erro, usar dados locais
      const localAdicionais = getLocalAdicionais();
      setAdicionais(localAdicionais);
    }
  };

  const getLocalAdicionais = (): Adicional[] => {
    // Verificar se localStorage está disponível (evitar erro no SSR)
    if (typeof window === 'undefined' || !window.localStorage) {
      return getDefaultAdicionais();
    }
    
    const stored = localStorage.getItem('venezas_adicionais');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Erro ao fazer parse dos adicionais locais:', error);
        return getDefaultAdicionais();
      }
    }
    
    return getDefaultAdicionais();
  };

  const getDefaultAdicionais = (): Adicional[] => {
    // Dados padrão com todos os adicionais solicitados
    return [
      // Molhos e condimentos
      { id: '1', nome: 'Molho verde adicional', preco_extra: 1.50, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '2', nome: 'Molho Barbecue', preco_extra: 1.50, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '3', nome: 'Ketchup e Maionese adicional', preco_extra: 2.00, multi_selecao: false, obrigatorio: false, item_id: null },
      
      // Ingredientes básicos
      { id: '4', nome: 'Ovo adicional', preco_extra: 3.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '5', nome: 'Abacaxi adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '6', nome: 'Banana adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '7', nome: 'Bife de Hambúrguer adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '8', nome: 'Cebola Caramelizada adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '9', nome: 'Presunto adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '10', nome: 'Cebola adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      
      // Ingredientes premium
      { id: '11', nome: 'Frango adicional', preco_extra: 5.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '12', nome: 'Muçarela adicional', preco_extra: 5.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '13', nome: 'Bacon adicional', preco_extra: 6.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '14', nome: 'Linguiça adicional', preco_extra: 6.00, multi_selecao: false, obrigatorio: false, item_id: null },
      
      // Ingredientes artesanais
      { id: '15', nome: 'Bife artesanal adicional', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '16', nome: 'Catupiry adicional', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '17', nome: 'Cheddar adicional no lanche', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '18', nome: 'Costela ao molho barbecue', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      
      // Adicionais especiais
      { id: '19', nome: 'Cheddar adicional na batata frita', preco_extra: 10.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '20', nome: 'Requeijão cremoso adicional', preco_extra: 12.00, multi_selecao: false, obrigatorio: false, item_id: null },
      
      // Opções de remoção (sem custo)
      { id: '21', nome: 'Sem Pão', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '22', nome: 'Sem Presunto', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '23', nome: 'Sem Mussarela', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '24', nome: 'Sem maionese', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '25', nome: 'Sem ketchup', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '26', nome: 'Sem molho verde', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null }
    ];
  };

  const saveLocalAdicionais = (adicionais: Adicional[]) => {
    // Verificar se localStorage está disponível (evitar erro no SSR)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('venezas_adicionais', JSON.stringify(adicionais));
      } catch (error) {
        console.error('Erro ao salvar adicionais no localStorage:', error);
      }
    }
  };

  const handleBulkAdd = async () => {
    try {
      const lines = bulkAdicionais.split('\n').filter(line => line.trim());
      const adicionaisParaInserir = [];
      let addedCount = 0;

      lines.forEach(line => {
        const [nome, precoStr] = line.split('|').map(s => s.trim());
        const preco = parseFloat(precoStr) || 0;
        
        if (nome) {
          adicionaisParaInserir.push({
            nome: nome,
            preco_extra: preco,
            multi_selecao: false,
            obrigatorio: false,
            item_id: selectedCategoryForBulk || null
          });
          addedCount++;
        }
      });

      if (adicionaisParaInserir.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum adicional válido encontrado",
          variant: "destructive",
        });
        return;
      }

      // Tentar inserir no banco de dados primeiro
      try {
        const { error } = await supabase
          .from('opcionais')
          .insert(adicionaisParaInserir);

        if (error) throw error;

        // Se inseriu no banco com sucesso, recarregar
        await fetchAdicionais();
        setBulkAdicionais("");
        setShowBulkAdd(false);
        
        toast({
          title: "Sucesso",
          description: `${addedCount} adicionais criados com sucesso`,
        });
      } catch (dbError) {
        console.log('Erro no banco, salvando localmente:', dbError);
        
        // Se der erro no banco, salvar localmente
        const novosAdicionais = [...adicionais];
        adicionaisParaInserir.forEach(adicional => {
          const novoAdicional = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...adicional
          };
          novosAdicionais.push(novoAdicional);
        });

        setAdicionais(novosAdicionais);
        saveLocalAdicionais(novosAdicionais);
        setBulkAdicionais("");
        setShowBulkAdd(false);
        
        toast({
          title: "Sucesso",
          description: `${addedCount} adicionais criados com sucesso`,
        });
      }
    } catch (error) {
      console.error('Error in bulk add:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar adicionais em massa",
        variant: "destructive",
      });
    }
  };

  const handleAddByCategory = (categoryId: string) => {
    const categoryItems = items.filter(item => item.categoria_id === categoryId);
    const novosAdicionais = [...adicionais];
    let addedCount = 0;

    categoryItems.forEach(item => {
      const adicional = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        nome: `Adicional para ${item.nome}`,
        preco_extra: 2.00,
        multi_selecao: false,
        obrigatorio: false,
        item_id: item.id
      };
      novosAdicionais.push(adicional);
      addedCount++;
    });

    setAdicionais(novosAdicionais);
    saveLocalAdicionais(novosAdicionais);
    
    toast({
      title: "Sucesso",
      description: `${addedCount} adicionais criados para a categoria`,
    });
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      preco: 0,
      descricao: "",
      foto_url: "",
      categoria_id: "",
      ativo: true
    });
    setSelectedItem(null);
    setIsDialogOpen(false);
    setPreviewImage(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      nome: "",
      ativo: true,
      ordem: 0
    });
    setSelectedCategory(null);
    setIsCategoryDialogOpen(false);
  };

  const resetAdicionalForm = () => {
    setAdicionalFormData({
      nome: "",
      preco_extra: 0,
      multi_selecao: false,
      obrigatorio: false,
      item_id: ""
    });
    setSelectedAdicional(null);
  };

  const handleOpenAdicionaisDialog = () => {
    try {
      console.log('Abrindo modal de adicionais...');
      setIsAdicionaisDialogOpen(true);
      
      // Carregar adicionais quando abrir o modal
      fetchAdicionais();
      
      console.log('Modal de adicionais aberto com sucesso');
    } catch (error) {
      console.error('Error opening adicionais dialog:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir gerenciador de adicionais",
        variant: "destructive",
      });
    }
  };

  const editCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryFormData({
      nome: category.nome,
      ativo: category.ativo,
      ordem: category.ordem || 0
    });

    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (!categoryFormData.nome.trim()) {
        toast({
          title: "Erro",
          description: "Nome da categoria é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (selectedCategory) {
        // Atualizar categoria existente
        const { error } = await supabase
          .from('categorias')
          .update({
            nome: categoryFormData.nome.trim(),
            ativo: categoryFormData.ativo,
            ordem: categoryFormData.ordem
          })
          .eq('id', selectedCategory.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso",
        });
      } else {
        // Criar nova categoria - definir ordem automaticamente se não especificada
        const ordem = categoryFormData.ordem || (categories.length + 1);
        
        const { error } = await supabase
          .from('categorias')
          .insert({
            nome: categoryFormData.nome.trim(),
            ativo: categoryFormData.ativo,
            ordem: ordem
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso",
        });
      }

      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar categoria",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Verificar se há itens nesta categoria
      const { data: itemsInCategory } = await supabase
        .from('cardapio')
        .select('id')
        .eq('categoria_id', categoryId)
        .limit(1);

      if (itemsInCategory && itemsInCategory.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível excluir uma categoria que possui itens. Remova todos os itens primeiro.",
          variant: "destructive",
        });
        return;
      }

      if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
        return;
      }

      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });

      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria",
        variant: "destructive",
      });
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .update({ ativo: !currentStatus })
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Categoria ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`,
      });

      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da categoria",
        variant: "destructive",
      });
    }
  };

  const editItem = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData({
      nome: item.nome,
      preco: item.preco,
      descricao: item.descricao || "",
      foto_url: item.foto_url || "",
      categoria_id: item.categoria_id,
      ativo: item.ativo
    });
    setPreviewImage(item.foto_url || null);
    setIsDialogOpen(true);
  };

  const editAdicional = (adicional: Adicional) => {
    setSelectedAdicional(adicional);
    setAdicionalFormData({
      nome: adicional.nome,
      preco_extra: adicional.preco_extra,
      multi_selecao: adicional.multi_selecao || false,
      obrigatorio: adicional.obrigatorio || false,
      item_id: adicional.item_id || ""
    });
  };

  const handleSaveAdicional = async () => {
    try {
      if (!adicionalFormData.nome.trim()) {
        toast({
          title: "Erro",
          description: "Nome do adicional é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (adicionalFormData.preco_extra < 0) {
        toast({
          title: "Erro",
          description: "Preço deve ser maior ou igual a zero",
          variant: "destructive",
        });
        return;
      }

      const novoAdicional = {
        id: selectedAdicional ? selectedAdicional.id : Date.now().toString(),
        nome: adicionalFormData.nome.trim(),
        preco_extra: adicionalFormData.preco_extra,
        multi_selecao: adicionalFormData.multi_selecao,
        obrigatorio: adicionalFormData.obrigatorio,
        item_id: adicionalFormData.item_id || null
      };

      // Tentar salvar no banco de dados primeiro
      try {
        if (selectedAdicional) {
          // Atualizar no banco
          const { error } = await supabase
            .from('opcionais')
            .update({
              nome: novoAdicional.nome,
              preco_extra: novoAdicional.preco_extra,
              multi_selecao: novoAdicional.multi_selecao,
              obrigatorio: novoAdicional.obrigatorio,
              item_id: novoAdicional.item_id
            })
            .eq('id', selectedAdicional.id);

          if (error) throw error;
        } else {
          // Inserir no banco
          const { error } = await supabase
            .from('opcionais')
            .insert([{
              nome: novoAdicional.nome,
              preco_extra: novoAdicional.preco_extra,
              multi_selecao: novoAdicional.multi_selecao,
              obrigatorio: novoAdicional.obrigatorio,
              item_id: novoAdicional.item_id
            }]);

          if (error) throw error;
        }

        // Se salvou no banco com sucesso, recarregar
        await fetchAdicionais();
        resetAdicionalForm();
        
        toast({
          title: "Sucesso",
          description: selectedAdicional ? "Adicional atualizado com sucesso" : "Adicional criado com sucesso",
        });
      } catch (dbError) {
        console.log('Erro no banco, salvando localmente:', dbError);
        
        // Se der erro no banco, salvar localmente
        let novosAdicionais = [...adicionais];

        if (selectedAdicional) {
          // Atualizar adicional existente
          novosAdicionais = novosAdicionais.map(adicional => 
            adicional.id === selectedAdicional.id ? novoAdicional : adicional
          );
        } else {
          // Criar novo adicional
          novosAdicionais.push(novoAdicional);
        }

        setAdicionais(novosAdicionais);
        saveLocalAdicionais(novosAdicionais);
        resetAdicionalForm();
        
        toast({
          title: "Sucesso",
          description: selectedAdicional ? "Adicional atualizado com sucesso" : "Adicional criado com sucesso",
        });
      }
    } catch (error) {
      console.error('Error saving adicional:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar adicional",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdicional = async (adicional: Adicional) => {
    try {
      // Tentar deletar do banco de dados primeiro
      try {
        const { error } = await supabase
          .from('opcionais')
          .delete()
          .eq('id', adicional.id);

        if (error) throw error;

        // Se deletou do banco com sucesso, recarregar
        await fetchAdicionais();
        
        toast({
          title: "Sucesso",
          description: "Adicional removido com sucesso",
        });
      } catch (dbError) {
        console.log('Erro no banco, removendo localmente:', dbError);
        
        // Se der erro no banco, remover localmente
        const novosAdicionais = adicionais.filter(adic => adic.id !== adicional.id);
        setAdicionais(novosAdicionais);
        saveLocalAdicionais(novosAdicionais);

        toast({
          title: "Sucesso",
          description: "Adicional removido com sucesso",
        });
      }
    } catch (error) {
      console.error('Error deleting adicional:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover adicional",
        variant: "destructive",
      });
    }
  };

  const handleLoadDefaultAdicionais = async () => {
    try {
      const defaultAdicionais = getLocalAdicionais();
      
      // Tentar inserir no banco de dados primeiro
      try {
        const { error } = await supabase
          .from('opcionais')
          .insert(defaultAdicionais.map(adicional => ({
            nome: adicional.nome,
            preco_extra: adicional.preco_extra,
            multi_selecao: adicional.multi_selecao || false,
            obrigatorio: adicional.obrigatorio || false,
            item_id: adicional.item_id || null
          })));

        if (error) {
          console.log('Erro ao inserir no banco, usando dados locais:', error);
          // Se der erro, usar dados locais
          setAdicionais(defaultAdicionais);
          saveLocalAdicionais(defaultAdicionais);
        } else {
          // Se inseriu com sucesso, recarregar do banco
          await fetchAdicionais();
        }
      } catch (dbError) {
        console.log('Banco não disponível, usando dados locais:', dbError);
        // Se o banco não estiver disponível, usar dados locais
        setAdicionais(defaultAdicionais);
        saveLocalAdicionais(defaultAdicionais);
      }

      toast({
        title: "Sucesso",
        description: "Adicionais padrão carregados com sucesso",
      });
    } catch (error) {
      console.error('Error loading default adicionais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar adicionais padrão",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSaveItem = async () => {
    try {
      // Validações básicas
      if (!formData.nome.trim()) {
        toast({
          title: "Erro",
          description: "Nome do item é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!formData.categoria_id) {
        toast({
          title: "Erro",
          description: "Selecione uma categoria",
          variant: "destructive",
        });
        return;
      }

      if (formData.preco <= 0) {
        toast({
          title: "Erro",
          description: "Preço deve ser maior que zero",
          variant: "destructive",
        });
        return;
      }

      const itemData = {
        nome: formData.nome.trim(),
        preco: formData.preco,
        descricao: formData.descricao.trim(),
        foto_url: formData.foto_url,
        categoria_id: formData.categoria_id,
        ativo: formData.ativo
      };

      console.log('=== SALVANDO ITEM ===');
      console.log('Dados:', itemData);
      console.log('Modo:', selectedItem ? 'Atualizar' : 'Criar');

      if (selectedItem) {
        // Atualizar item existente
        const { error } = await supabase
          .from('itens_cardapio')
          .update(itemData)
          .eq('id', selectedItem.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Item atualizado com sucesso!",
        });
      } else {
        // Criar novo item
        const { error } = await supabase
          .from('itens_cardapio')
          .insert([itemData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Item criado com sucesso!",
        });
      }

      // Recarregar lista de itens
      await fetchMenuItems();
      
      // Fechar modal e limpar formulário
      resetForm();

    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExportPdf = async () => {
    const menuItemsForPdf = items
      .filter(item => item.ativo)
      .map(item => ({
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        descricao: item.descricao || "",
        categoria: item.categorias?.nome || "Sem categoria",
        ativo: item.ativo,
        imagem_url: item.foto_url
      }));

    await exportMenuToPdf(menuItemsForPdf, restaurantConfig);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Gerenciar Cardápio</h2>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Gerenciar Cardápio</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <X className="w-5 h-5" />
              <span className="font-medium">Erro ao carregar dados</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-3"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Gerenciar Cardápio Completo
          </h2>
          <p className="text-muted-foreground">
            Adicione, edite e organize todos os itens do cardápio
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleExportPdf} 
            disabled={isExporting || items.length === 0}
            variant="outline"
            className="border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar PDF'}
          </Button>

          <Button 
            onClick={() => {
              try {
                console.log('Abrindo modal de adicionais...');
                setIsAdicionaisDialogOpen(true);
              } catch (error) {
                console.error('Erro ao abrir modal:', error);
              }
            }} 
            variant="outline" 
            className="border-green-200 text-green-600 hover:bg-green-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Adicionais
          </Button>

          <Dialog open={isAdicionaisDialogOpen} onOpenChange={setIsAdicionaisDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Gerenciar Adicionais
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Ações básicas */}
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={() => {
                      try {
                        console.log('Clicou em Adicionar em Massa, showBulkAdd:', showBulkAdd);
                        setShowBulkAdd(!showBulkAdd);
                      } catch (error) {
                        console.error('Erro ao alternar adicionar em massa:', error);
                      }
                    }} 
                    variant="outline" 
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar em Massa
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      try {
                        console.log('Clicou em Novo Adicional');
                        resetAdicionalForm();
                        setShowBulkAdd(false);
                      } catch (error) {
                        console.error('Erro ao criar novo adicional:', error);
                      }
                    }} 
                    variant="outline" 
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Adicional
                  </Button>

                  <Button 
                    onClick={() => {
                      try {
                        console.log('Clicou em Carregar Padrão');
                        const defaultAdicionais = getDefaultAdicionais();
                        setAdicionais(defaultAdicionais);
                        saveLocalAdicionais(defaultAdicionais);
                        toast({
                          title: "Sucesso",
                          description: "Adicionais padrão carregados com sucesso",
                        });
                      } catch (error) {
                        console.error('Erro ao carregar padrão:', error);
                        toast({
                          title: "Erro",
                          description: "Erro ao carregar adicionais padrão",
                          variant: "destructive",
                        });
                      }
                    }} 
                    variant="outline" 
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Carregar Padrão
                  </Button>
                </div>

                {/* Seção de Adicionar em Massa */}
                {showBulkAdd && (
                  <div className="space-y-4 p-4 border rounded-lg bg-purple-50">
                    <h3 className="font-semibold text-purple-800">Adicionar em Massa</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Formato: Nome do Adicional | Preço</Label>
                        <Textarea
                          value={bulkAdicionais}
                          onChange={(e) => {
                            try {
                              setBulkAdicionais(e.target.value);
                            } catch (error) {
                              console.error('Erro ao atualizar textarea:', error);
                            }
                          }}
                          placeholder="Exemplo:&#10;Bacon adicional | 6.00&#10;Queijo adicional | 4.00&#10;Tomate adicional | 2.00"
                          rows={6}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            try {
                              handleBulkAdd();
                            } catch (error) {
                              console.error('Erro ao adicionar em massa:', error);
                            }
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={!bulkAdicionais.trim()}
                        >
                          Adicionar {bulkAdicionais.split('\n').filter(line => line.trim()).length} Adicionais
                        </Button>
                        <Button 
                          onClick={() => {
                            try {
                              setShowBulkAdd(false);
                              setBulkAdicionais("");
                            } catch (error) {
                              console.error('Erro ao cancelar:', error);
                            }
                          }}
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Formulário de Novo/Editar Adicional */}
                {!showBulkAdd && (
                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-semibold text-blue-800">
                      {selectedAdicional ? "Editar Adicional" : "Novo Adicional"}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Adicional</Label>
                        <Input
                          value={adicionalFormData.nome}
                          onChange={(e) => {
                            try {
                              setAdicionalFormData({...adicionalFormData, nome: e.target.value});
                            } catch (error) {
                              console.error('Erro ao atualizar nome:', error);
                            }
                          }}
                          placeholder="Ex: Bacon adicional"
                        />
                      </div>
                      
                      <div>
                        <Label>Preço Extra (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={adicionalFormData.preco_extra}
                          onChange={(e) => {
                            try {
                              setAdicionalFormData({...adicionalFormData, preco_extra: parseFloat(e.target.value) || 0});
                            } catch (error) {
                              console.error('Erro ao atualizar preço:', error);
                            }
                          }}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          try {
                            resetAdicionalForm();
                          } catch (error) {
                            console.error('Erro ao resetar formulário:', error);
                          }
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={() => {
                          try {
                            handleSaveAdicional();
                          } catch (error) {
                            console.error('Erro ao salvar adicional:', error);
                          }
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={!adicionalFormData.nome.trim()}
                      >
                        {selectedAdicional ? "Atualizar" : "Criar"} Adicional
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lista simples de adicionais */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Adicionais Disponíveis ({adicionais?.length || 0})</h3>
                  
                  {adicionais && adicionais.length > 0 ? (
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {adicionais.map((adicional) => (
                        <div key={adicional.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{adicional.nome}</span>
                            <div className="text-sm text-gray-600">
                              {formatCurrency(adicional.preco_extra)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => {
                                try {
                                  editAdicional(adicional);
                                } catch (error) {
                                  console.error('Erro ao editar adicional:', error);
                                }
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                try {
                                  handleDeleteAdicional(adicional);
                                } catch (error) {
                                  console.error('Erro ao deletar adicional:', error);
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum adicional encontrado</p>
                    </div>
                  )}
                </div>

              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetCategoryForm} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <FolderPlus className="h-4 w-4 mr-2" />
                Gerenciar Categorias
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5" />
                  Gerenciar Categorias
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Formulário de Categoria */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold">
                    {selectedCategory ? "Editar Categoria" : "Nova Categoria"}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Nome da Categoria</Label>
                      <Input
                        value={categoryFormData.nome}
                        onChange={(e) => setCategoryFormData({...categoryFormData, nome: e.target.value})}
                        placeholder="Ex: Lanches, Bebidas, Sobremesas"
                      />
                    </div>
                    
                    <div>
                      <Label>Ordem de Exibição</Label>
                      <Input
                        type="number"
                        min="1"
                        value={categoryFormData.ordem}
                        onChange={(e) => setCategoryFormData({...categoryFormData, ordem: parseInt(e.target.value) || 0})}
                        placeholder="1, 2, 3..."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="categoria-ativo"
                        checked={categoryFormData.ativo}
                        onChange={(e) => setCategoryFormData({...categoryFormData, ativo: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="categoria-ativo">Categoria ativa</Label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={resetCategoryForm}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 gradient-primary"
                      onClick={handleSaveCategory}
                    >
                      {selectedCategory ? "Atualizar" : "Criar"} Categoria
                    </Button>
                  </div>
                </div>

                {/* Lista de Categorias */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Categorias Existentes</h3>
                  {categories.length > 0 ? (
                    <div className="grid gap-3">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={category.ativo ? "default" : "secondary"}
                              className="cursor-pointer hover:opacity-80"
                              onClick={() => handleToggleCategoryStatus(category.id, category.ativo)}
                            >
                              {category.ativo ? "Ativa" : "Inativa"}
                            </Badge>
                            <span className="font-medium">{category.nome}</span>
                            <span className="text-sm text-gray-500">(Ordem: {category.ordem || 0})</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => editCategory(category)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma categoria encontrada</p>
                      <p className="text-sm">Crie sua primeira categoria acima</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedItem ? "Editar Item" : "Novo Item do Cardápio"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Nome do Item</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: X-Burger Especial"
                  />
                </div>
                
                <div>
                  <Label>Categoria</Label>
                  <Select 
                    value={formData.categoria_id} 
                    onValueChange={(value) => setFormData({...formData, categoria_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descreva o item..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <MinimalFileUpload
                    label="Foto do Item"
                    value={formData.foto_url}
                    onChange={(url) => setFormData({...formData, foto_url: url})}
                    maxSize={5}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="item-ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="item-ativo">Item ativo</Label>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveItem}
                  className="flex-1 gradient-primary"
                >
                  {selectedItem ? "Atualizar Item" : "Criar Item"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryItems = items.filter(item => item.categoria_id === category.id);
          
          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-orange-500" />
                  {category.nome}
                  <Badge variant={category.ativo ? "default" : "secondary"}>
                    {categoryItems.length} itens
                  </Badge>
                </h3>
                <Button
                  onClick={() => {
                    setFormData({...formData, categoria_id: category.id});
                    setIsDialogOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
              
              {categoryItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-video bg-gray-100 relative">
                        {item.foto_url ? (
                          <img 
                            src={item.foto_url} 
                            alt={item.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Image className="h-12 w-12" />
                          </div>
                        )}
                        <Badge 
                          className={`absolute top-2 right-2 ${
                            item.ativo ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        >
                          {item.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{item.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.descricao}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-orange-600">
                            {formatCurrency(item.preco)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => editItem(item)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <CardContent>
                    <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum item nesta categoria</h3>
                    <p className="text-muted-foreground mb-4">
                      Adicione o primeiro item desta categoria
                    </p>
                    <Button
                      onClick={() => {
                        setFormData({...formData, categoria_id: category.id});
                        setIsDialogOpen(true);
                      }}
                      className="gradient-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Item
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <Card className="p-8 text-center">
          <CardContent>
            <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando itens ao seu cardápio
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Item
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
