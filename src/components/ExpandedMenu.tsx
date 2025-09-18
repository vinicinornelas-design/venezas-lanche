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

export default function ExpandedMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `cardapio/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Atualizar formData com a nova URL
      setFormData(prev => ({
        ...prev,
        foto_url: publicUrl
      }));

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar imagem. Tente novamente.",
        variant: "destructive",
      });
      setPreviewImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      foto_url: ""
    }));
    setPreviewImage(null);
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
        // Update existing category
        const { error } = await supabase
          .from('categorias')
          .update(categoryFormData)
          .eq('id', selectedCategory.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categorias')
          .insert([categoryFormData]);

        if (error) throw error;
      }

      await fetchCategories();
      resetCategoryForm();
      toast({
        title: "Sucesso",
        description: selectedCategory ? "Categoria atualizada" : "Categoria criada",
      });
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
        .from('itens_cardapio')
        .select('id')
        .eq('categoria_id', categoryId)
        .limit(1);

      if (itemsInCategory && itemsInCategory.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível deletar categoria que possui itens",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      await fetchCategories();
      toast({
        title: "Sucesso",
        description: "Categoria removida",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover categoria",
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

      await fetchCategories();
      toast({
        title: "Sucesso",
        description: !currentStatus ? "Categoria ativada" : "Categoria desativada",
      });
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da categoria",
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

          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetCategoryForm} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <FolderPlus className="h-4 w-4 mr-2" />
                Gerenciar Categorias
              </Button>
            </DialogTrigger>
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
                <Label>Imagem do Item</Label>
                
                {/* Preview da imagem */}
                {(previewImage || formData.foto_url) && (
                  <div className="relative mb-4">
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted border">
                      <img 
                        src={previewImage || formData.foto_url} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Upload de imagem */}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {uploadingImage ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                        Enviando...
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Image className="h-6 w-6" />
                        <span className="text-sm">
                          {previewImage || formData.foto_url ? 'Trocar imagem' : 'Clique para enviar imagem'}
                        </span>
                        <span className="text-xs text-gray-400">PNG, JPG até 5MB</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Campo de URL como alternativa */}
                <div className="mt-2">
                  <Label className="text-sm text-gray-500">Ou cole uma URL:</Label>
                  <Input
                    value={formData.foto_url}
                    onChange={(e) => {
                      setFormData({...formData, foto_url: e.target.value});
                      setPreviewImage(e.target.value || null);
                    }}
                    placeholder="URL da imagem (opcional)"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveItem} className="w-full gradient-primary">
                {selectedItem ? "Atualizar Item" : "Criar Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Categorias */}
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
                    id="categoria-ativa"
                    checked={categoryFormData.ativo}
                    onChange={(e) => setCategoryFormData({...categoryFormData, ativo: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="categoria-ativa">Categoria ativa</Label>
                </div>
              </div>
              
              <Button onClick={handleSaveCategory} className="w-full">
                {selectedCategory ? "Atualizar Categoria" : "Criar Categoria"}
              </Button>
            </div>

            {/* Lista de Categorias */}
            <div className="space-y-4">
              <h3 className="font-semibold">Categorias Existentes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {categories.map((category) => {
                  const itemsInCategory = items.filter(item => item.categoria_id === category.id).length;
                  
                  return (
                    <Card key={category.id} className={`transition-all duration-200 ${!category.ativo ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{category.nome}</h4>
                            <p className="text-sm text-gray-500">
                              {itemsInCategory} item(s)
                            </p>
                          </div>
                          
                          <div className="flex gap-1">
                            {!category.ativo && (
                              <Badge variant="secondary" className="text-xs">Inativa</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => editCategory(category)}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant={category.ativo ? "secondary" : "default"}
                            onClick={() => handleToggleCategoryStatus(category.id, category.ativo)}
                            className="flex-1"
                          >
                            {category.ativo ? "Desativar" : "Ativar"}
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={itemsInCategory > 0}
                            title={itemsInCategory > 0 ? "Não é possível deletar categoria com itens" : "Deletar categoria"}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FolderPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma categoria encontrada</p>
                  <p className="text-sm">Crie sua primeira categoria acima</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryItems = items.filter(item => item.categoria_id === category.id);
          
          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${category.ativo ? 'text-primary' : 'text-gray-400'}`}>
                  {category.nome}
                </h3>
                <div className="flex items-center gap-2">
                  {!category.ativo && (
                    <Badge variant="secondary">Categoria Inativa</Badge>
                  )}
                  <Badge variant="outline">
                    {categoryItems.length} item(s)
                  </Badge>
                </div>
              </div>
              
              {categoryItems.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-gray-500">
                    <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">Nenhum item nesta categoria</p>
                    <p className="text-sm">Adicione itens para esta categoria</p>
                  </CardContent>
                </Card>
              ) : (
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
              )}
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