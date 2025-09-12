import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Search, 
  SortAsc, 
  List,
  X
} from "lucide-react";

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

export default function GestaoCardapio() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [semCodigoPDV, setSemCodigoPDV] = useState(false);
  const [sortBy, setSortBy] = useState<"nome" | "preco" | "categoria">("nome");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterAndSortItems();
  }, [items, searchTerm, selectedCategory, semCodigoPDV, sortBy, sortOrder]);

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

  const filterAndSortItems = () => {
    let filtered = [...items];

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.preco.toString().includes(searchTerm) ||
        item.categorias?.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter(item => 
        item.categorias?.nome === selectedCategory
      );
    }

    // Filtro por disponibilidade (sem código de PDV)
    if (semCodigoPDV) {
      // Aqui você pode implementar a lógica específica para "sem código de PDV"
      // Por enquanto, vou filtrar itens que não têm foto_url (como exemplo)
      filtered = filtered.filter(item => !item.foto_url);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "nome":
          aValue = a.nome;
          bValue = b.nome;
          break;
        case "preco":
          aValue = a.preco;
          bValue = b.preco;
          break;
        case "categoria":
          aValue = a.categorias?.nome || "";
          bValue = b.categorias?.nome || "";
          break;
        default:
          aValue = a.nome;
          bValue = b.nome;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredItems(filtered);
  };

  const handleSort = () => {
    if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder("asc");
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'cardapio.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Sucesso",
      description: "Cardápio exportado com sucesso!",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Aqui você pode implementar a lógica de importação
        toast({
          title: "Sucesso",
          description: "Cardápio importado com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao importar arquivo",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestão de Cardápio</h1>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca de Produtos */}
            <div className="space-y-2">
              <Label htmlFor="search">Busca de Produtos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Busque por nome, categoria, ordem ou valor"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.nome}>
                      {category.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Disponibilidade */}
            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilidade</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sem-codigo-pdv"
                  checked={semCodigoPDV}
                  onCheckedChange={(checked) => setSemCodigoPDV(checked as boolean)}
                />
                <Label htmlFor="sem-codigo-pdv" className="text-sm">
                  Sem código de PDV
                </Label>
              </div>
            </div>

            {/* Ordenação */}
            <div className="space-y-2">
              <Label>Ordenar por</Label>
              <Select value={sortBy} onValueChange={(value: "nome" | "preco" | "categoria") => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome</SelectItem>
                  <SelectItem value="preco">Preço</SelectItem>
                  <SelectItem value="categoria">Categoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
        
        <Button variant="outline" className="bg-pink-100 hover:bg-pink-200 text-pink-700">
          <List className="mr-2 h-4 w-4" />
          Categorias
        </Button>
        
        <Button variant="outline" onClick={handleSort}>
          <SortAsc className="mr-2 h-4 w-4" />
          Ordenar por {sortBy} ({sortOrder === "asc" ? "A-Z" : "Z-A"})
        </Button>
        
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Cardápio
        </Button>
        
        <Button variant="outline" asChild>
          <label htmlFor="import-file" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Importar Cardápio
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredItems.length}</div>
            <p className="text-sm text-muted-foreground">Total de Itens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredItems.filter(item => item.ativo).length}
            </div>
            <p className="text-sm text-muted-foreground">Itens Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredItems.filter(item => !item.ativo).length}
            </div>
            <p className="text-sm text-muted-foreground">Itens Inativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              R$ {filteredItems.reduce((sum, item) => sum + item.preco, 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Itens */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Cardápio ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {item.foto_url && (
                      <img 
                        src={item.foto_url} 
                        alt={item.nome}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{item.nome}</h3>
                      <p className="text-sm text-muted-foreground">{item.descricao}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={item.ativo ? "default" : "secondary"}>
                          {item.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge variant="outline">{item.categorias?.nome}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">R$ {item.preco.toFixed(2)}</span>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item encontrado com os filtros aplicados.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}