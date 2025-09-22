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
    ativo: true
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
        .order('nome');

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
      // Tentar buscar da tabela opcionais
      const { data, error } = await supabase
        .from('opcionais')
        .select('*')
        .order('nome');

      if (error) {
        console.log('Tabela opcionais não existe, usando dados locais');
        // Se a tabela não existe, usar dados locais
        const localAdicionais = getLocalAdicionais();
        setAdicionais(localAdicionais);
        return;
      }

      setAdicionais(data || []);
    } catch (error) {
      console.error('Error fetching adicionais:', error);
      // Em caso de erro, usar dados locais
      const localAdicionais = getLocalAdicionais();
      setAdicionais(localAdicionais);
    }
  };

  const getLocalAdicionais = (): Adicional[] => {
    const stored = localStorage.getItem('venezas_adicionais');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Dados padrão se não houver dados salvos
    return [
      { id: '1', nome: 'Molho verde adicional', preco_extra: 1.50, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '2', nome: 'Molho Barbecue', preco_extra: 1.50, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '3', nome: 'Ketchup e Maionese adicional', preco_extra: 2.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '4', nome: 'Ovo adicional', preco_extra: 3.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '5', nome: 'Abacaxi adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '6', nome: 'Banana adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '7', nome: 'Bife de Hambúrguer adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '8', nome: 'Cebola Caramelizada adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '9', nome: 'Presunto adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '10', nome: 'Cebola adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '11', nome: 'Frango adicional', preco_extra: 5.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '12', nome: 'Muçarela adicional', preco_extra: 5.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '13', nome: 'Bacon adicional', preco_extra: 6.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '14', nome: 'Linguiça adicional', preco_extra: 6.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '15', nome: 'Bife artesanal adicional', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '16', nome: 'Catupiry adicional', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '17', nome: 'Cheddar adicional no lanche', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '18', nome: 'Costela ao molho barbecue', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '19', nome: 'Cheddar adicional na batata frita', preco_extra: 10.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '20', nome: 'Requeijão cremoso adicional', preco_extra: 12.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '21', nome: 'Sem Pão', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '22', nome: 'Sem Presunto', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '23', nome: 'Sem Mussarela', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '24', nome: 'Sem maionese', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '25', nome: 'Sem ketchup', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '26', nome: 'Sem molho verde', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null }
    ];
  };

  const saveLocalAdicionais = (adicionais: Adicional[]) => {
    localStorage.setItem('venezas_adicionais', JSON.stringify(adicionais));
  };

  const handleBulkAdd = () => {
    try {
      const lines = bulkAdicionais.split('\n').filter(line => line.trim());
      const novosAdicionais = [...adicionais];
      let addedCount = 0;

      lines.forEach(line => {
        const [nome, precoStr] = line.split('|').map(s => s.trim());
        const preco = parseFloat(precoStr) || 0;
        
        if (nome) {
          const novoAdicional = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            nome: nome,
            preco_extra: preco,
            multi_selecao: false,
            obrigatorio: false,
            item_id: selectedCategoryForBulk || null
          };
          novosAdicionais.push(novoAdicional);
          addedCount++;
        }
      });

      setAdicionais(novosAdicionais);
      saveLocalAdicionais(novosAdicionais);
      setBulkAdicionais("");
      setShowBulkAdd(false);
      
      toast({
        title: "Sucesso",
        description: `${addedCount} adicionais criados com sucesso`,
      });
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
      ativo: true
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
    setIsAdicionaisDialogOpen(false);
  };

  const handleOpenAdicionaisDialog = () => {
    try {
      console.log('Abrindo modal de adicionais...');
      setIsAdicionaisDialogOpen(true);
      
      // Carregar adicionais quando abrir o modal
      setTimeout(() => {
        fetchAdicionais();
      }, 100);
      
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
      ativo: category.ativo
    });

    setIsCategoryDialogOpen(true);
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
    setIsAdicionaisDialogOpen(true);
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

      let novosAdicionais = [...adicionais];

      if (selectedAdicional) {
        // Atualizar adicional existente
        novosAdicionais = novosAdicionais.map(adicional => 
          adicional.id === selectedAdicional.id ? novoAdicional : adicional
        );
        toast({
          title: "Sucesso",
          description: "Adicional atualizado com sucesso",
        });
      } else {
        // Criar novo adicional
        novosAdicionais.push(novoAdicional);
        toast({
          title: "Sucesso",
          description: "Adicional criado com sucesso",
        });
      }

      setAdicionais(novosAdicionais);
      saveLocalAdicionais(novosAdicionais);
      resetAdicionalForm();
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
      const novosAdicionais = adicionais.filter(adic => adic.id !== adicional.id);
      setAdicionais(novosAdicionais);
      saveLocalAdicionais(novosAdicionais);

      toast({
        title: "Sucesso",
        description: "Adicional removido com sucesso",
      });
    } catch (error) {
      console.error('Error deleting adicional:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover adicional",
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
              console.log('Botão clicado!');
              setIsAdicionaisDialogOpen(true);
            }} 
            variant="outline" 
            className="border-green-200 text-green-600 hover:bg-green-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Adicionais
          </Button>

          <Dialog open={isAdicionaisDialogOpen} onOpenChange={setIsAdicionaisDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Gerenciar Adicionais
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Ações em massa */}
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={() => setShowBulkAdd(!showBulkAdd)} 
                    variant="outline" 
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar em Massa
                  </Button>
                  
                  <Select value={selectedCategoryForBulk} onValueChange={setSelectedCategoryForBulk}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Adicionar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedCategoryForBulk && (
                    <Button 
                      onClick={() => handleAddByCategory(selectedCategoryForBulk)} 
                      variant="outline" 
                      className="border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar para Categoria
                    </Button>
                  )}
                </div>

                {/* Formulário de adição em massa */}
                {showBulkAdd && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-3">Adicionar Adicionais em Massa</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Digite um adicional por linha no formato: <code>Nome do Adicional|Preço</code>
                      <br />
                      Exemplo: <code>Molho especial|3.50</code>
                    </p>
                    <Textarea
                      value={bulkAdicionais}
                      onChange={(e) => setBulkAdicionais(e.target.value)}
                      placeholder="Molho especial|3.50&#10;Queijo extra|2.00&#10;Bacon crocante|4.00"
                      rows={6}
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleBulkAdd} className="gradient-primary">
                        Adicionar Todos
                      </Button>
                      <Button onClick={() => setShowBulkAdd(false)} variant="outline">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Formulário de Adicional */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold">
                    {selectedAdicional ? "Editar Adicional" : "Novo Adicional"}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Adicional</Label>
                      <Input
                        value={adicionalFormData.nome}
                        onChange={(e) => setAdicionalFormData({...adicionalFormData, nome: e.target.value})}
                        placeholder="Ex: Molho verde adicional"
                      />
                    </div>
                    
                    <div>
                      <Label>Preço Extra (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={adicionalFormData.preco_extra}
                        onChange={(e) => setAdicionalFormData({...adicionalFormData, preco_extra: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label>Item Específico (Opcional)</Label>
                      <Select 
                        value={adicionalFormData.item_id} 
                        onValueChange={(value) => setAdicionalFormData({...adicionalFormData, item_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um item específico" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os itens</SelectItem>
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="multi-selecao"
                          checked={adicionalFormData.multi_selecao}
                          onChange={(e) => setAdicionalFormData({...adicionalFormData, multi_selecao: e.target.checked})}
                          className="rounded"
                        />
                        <Label htmlFor="multi-selecao">Permitir múltipla seleção</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="obrigatorio"
                          checked={adicionalFormData.obrigatorio}
                          onChange={(e) => setAdicionalFormData({...adicionalFormData, obrigatorio: e.target.checked})}
                          className="rounded"
                        />
                        <Label htmlFor="obrigatorio">Obrigatório</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={resetAdicionalForm}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveAdicional}
                      className="flex-1 gradient-primary"
                    >
                      {selectedAdicional ? "Atualizar" : "Criar"} Adicional
                    </Button>
                  </div>
                </div>

                {/* Lista de Adicionais */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Adicionais Existentes</h3>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <span>Total: {adicionais?.length || 0}</span>
                      <span>•</span>
                      <span>Pagos: {adicionais?.filter(a => a.preco_extra > 0).length || 0}</span>
                      <span>•</span>
                      <span>Remoções: {adicionais?.filter(a => a.preco_extra === 0).length || 0}</span>
                    </div>
                  </div>
                  
                  {adicionais && adicionais.length > 0 ? (
                    <div className="grid gap-3">
                      {adicionais.map((adicional) => (
                        <div key={adicional.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="font-medium">{adicional.nome}</span>
                              <div className="text-sm text-muted-foreground">
                                {formatCurrency(adicional.preco_extra)}
                                {adicional.item_id && (
                                  <span className="ml-2 text-blue-600">
                                    • Item específico
                                  </span>
                                )}
                                {adicional.multi_selecao && (
                                  <Badge variant="secondary" className="ml-2">Múltipla seleção</Badge>
                                )}
                                {adicional.obrigatorio && (
                                  <Badge variant="destructive" className="ml-2">Obrigatório</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => editAdicional(adicional)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteAdicional(adicional)}
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
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum adicional encontrado</p>
                      <p className="text-sm">Crie seu primeiro adicional acima</p>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome da Categoria</Label>
                      <Input
                        value={categoryFormData.nome}
                        onChange={(e) => setCategoryFormData({...categoryFormData, nome: e.target.value})}
                        placeholder="Ex: Lanches, Bebidas, Sobremesas"
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
                            <Badge variant={category.ativo ? "default" : "secondary"}>
                              {category.ativo ? "Ativa" : "Inativa"}
                            </Badge>
                            <span className="font-medium">{category.nome}</span>
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
                  <Label>URL da Foto</Label>
                  <Input
                    value={formData.foto_url}
                    onChange={(e) => setFormData({...formData, foto_url: e.target.value})}
                    placeholder="https://exemplo.com/foto.jpg"
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
