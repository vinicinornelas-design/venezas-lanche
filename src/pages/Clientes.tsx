import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Calendar,
  Heart,
  MessageCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
  loyalty_points: number;
  whatsapp_opt_in: boolean;
  created_at: string;
}

export default function Clientes() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysInactive = (lastOrderAt: string) => {
    if (!lastOrderAt) return null;
    const lastOrder = new Date(lastOrderAt);
    const today = new Date();
    const diffTime = today.getTime() - lastOrder.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCustomerStatus = (customer: Customer) => {
    if (!customer.last_order_at) return "Novo";
    const daysInactive = getDaysInactive(customer.last_order_at);
    if (daysInactive === null) return "Novo";
    if (daysInactive <= 7) return "Ativo";
    if (daysInactive <= 30) return "Regular";
    return "Inativo";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-success/10 text-success border-success/20";
      case "Regular": return "bg-warning/10 text-warning border-warning/20";
      case "Inativo": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && getCustomerStatus(customer).toLowerCase() === filterStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes e histórico de pedidos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">
          Gerencie sua base de clientes e identifique oportunidades de remarketing
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status do cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="regular">Regulares</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
            <SelectItem value="novo">Novos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total de Clientes</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Clientes Ativos</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => getCustomerStatus(c) === "Ativo").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm font-medium">Para Remarketing</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => getCustomerStatus(c) === "Inativo").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4 text-accent" />
              <div>
                <p className="text-sm font-medium">Faturamento Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const status = getCustomerStatus(customer);
          const daysInactive = getDaysInactive(customer.last_order_at);
          
          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(status)}>
                    {status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {customer.email && (
                    <div className="text-sm text-muted-foreground">
                      📧 {customer.email}
                    </div>
                  )}
                  
                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{customer.address}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total de Pedidos</p>
                      <p className="font-semibold">{customer.total_orders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Gasto</p>
                      <p className="font-semibold">{formatCurrency(customer.total_spent)}</p>
                    </div>
                  </div>

                  {customer.loyalty_points > 0 && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Pontos de Fidelidade</p>
                      <p className="font-semibold text-accent">{customer.loyalty_points} pontos</p>
                    </div>
                  )}

                  {customer.last_order_at && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Último Pedido</p>
                      <p className="font-semibold">
                        {formatDate(customer.last_order_at)}
                        {daysInactive && daysInactive > 0 && (
                          <span className="text-muted-foreground ml-2">
                            ({daysInactive} dias atrás)
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="text-sm">
                    <p className="text-muted-foreground">Cliente desde</p>
                    <p className="font-semibold">{formatDate(customer.created_at)}</p>
                  </div>

                  {status === "Inativo" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Enviar Remarketing
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Remarketing para {customer.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Mensagem de Remarketing</Label>
                            <Textarea 
                              placeholder={`Olá ${customer.name}! Sentimos sua falta... Que tal experimentar nossos novos sabores? Temos uma promoção especial esperando por você! 🍔`}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label>Prioridade</Label>
                            <Select defaultValue="NORMAL">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BAIXA">Baixa</SelectItem>
                                <SelectItem value="NORMAL">Normal</SelectItem>
                                <SelectItem value="ALTA">Alta</SelectItem>
                                <SelectItem value="URGENTE">Urgente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                              Enviar Agora
                            </Button>
                            <Button variant="outline" className="flex-1">
                              Agendar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterStatus !== "all" 
              ? "Tente ajustar os filtros de busca" 
              : "Os primeiros clientes aparecerão aqui quando fizerem pedidos"}
          </p>
        </div>
      )}
    </div>
  );
}