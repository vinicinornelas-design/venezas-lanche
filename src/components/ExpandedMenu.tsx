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
import { Plus, Edit, Trash2, Upload, Star, FileText } from "lucide-react";

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

export default function ExpandedMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
  const { toast } = useToast();
  const { exportMenuToPdf, isExporting } = usePdfExport();

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchRestaurantConfig();
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
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRestaurantConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_config')
        .select('*')
        .single();

      if (data && !error) {
        setRestaurantConfig({
          nome_restaurante: data.nome_restaurante || "Veneza's Lanches",
          telefone: data.telefone || "(31) 99999-0000",
          endereco: data.endereco || "Rua das Palmeiras, 456 - Centro",
          logo_url: data.logo_url || ""
        });
      }
    } catch (error) {
      console.error('Error fetching restaurant config:', error);
    }
  };

  const handleSaveItem = async () => {
    try {
      if (!formData.nome || !formData.categoria_id || formData.preco <= 0) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      if (selectedItem) {
        // Update existing item
        const { error } = await supabase
          .from('itens_cardapio')
          .update(formData)
          .eq('id', selectedItem.id);

        if (error) throw error;
      } else {
        // Create new item
        const { error } = await supabase
          .from('itens_cardapio')
          .insert([formData]);

        if (error) throw error;
      }

      await fetchMenuItems();
      resetForm();
      toast({
        title: "Sucesso",
        description: selectedItem ? "Item atualizado" : "Item criado",
      });
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('itens_cardapio')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await fetchMenuItems();
      toast({
        title: "Sucesso",
        description: "Item removido",
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover item",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (itemId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('itens_cardapio')
        .update({ ativo: !currentStatus })
        .eq('id', itemId);

      if (error) throw error;

      await fetchMenuItems();
      toast({
        title: "Sucesso",
        description: !currentStatus ? "Item ativado" : "Item desativado",
      });
    } catch (error) {
      console.error('Error toggling item status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do item",
        variant: "destructive",
      });
    }
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
    setIsDialogOpen(true);
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
                <Label>Preço</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value) || 0})}
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição detalhada do item..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>URL da Imagem</Label>
                <Input
                  value={formData.foto_url}
                  onChange={(e) => setFormData({...formData, foto_url: e.target.value})}
                  placeholder="URL da imagem (opcional)"
                />
              </div>
              
              <Button onClick={handleSaveItem} className="w-full gradient-primary">
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
          
          if (categoryItems.length === 0) return null;
          
          return (
            <div key={category.id} className="space-y-4">
              <h3 className="text-xl font-bold text-primary">{category.nome}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map((item) => (
                  <Card key={item.id} className={`transition-all duration-200 hover:shadow-lg ${!item.ativo ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.nome}</CardTitle>
                        <div className="flex gap-1">
                          {!item.ativo && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                          <Badge className="bg-primary/10 text-primary">
                            {formatCurrency(item.preco)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {item.foto_url && (
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={item.foto_url} 
                            alt={item.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {item.descricao && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.descricao}
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => editItem(item)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant={item.ativo ? "secondary" : "default"}
                          onClick={() => handleToggleStatus(item.id, item.ativo)}
                        >
                          {item.ativo ? "Desativar" : "Ativar"}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum item encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando itens ao seu cardápio
            </p>
            <Dialog>
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