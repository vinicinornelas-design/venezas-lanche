import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Search, 
  Send, 
  Clock, 
  Target,
  Phone,
  Calendar,
  Zap,
  CheckCircle
} from "lucide-react";

interface RemarketingCustomer {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  priority: string;
  campaign_type: string;
  remarketing_message: string;
  last_contact_date: string;
  scheduled_date: string;
  response_received: boolean;
  created_at: string;
}

export default function Remarketing() {
  const [customers, setCustomers] = useState<RemarketingCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    remarketing_message: "",
    priority: "NORMAL",
    campaign_type: "GENERAL"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRemarketingCustomers();
  }, []);

  const fetchRemarketingCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_remarketing')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching remarketing customers:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar campanhas de remarketing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRemarketingCampaign = async () => {
    try {
      const { error } = await supabase
        .from('customer_remarketing')
        .insert({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          remarketing_message: formData.remarketing_message,
          priority: formData.priority,
          campaign_type: formData.campaign_type,
          status: 'ATIVO'
        });

      if (error) throw error;

      await fetchRemarketingCustomers();
      setFormData({
        customer_name: "",
        customer_phone: "",
        remarketing_message: "",
        priority: "NORMAL",
        campaign_type: "GENERAL"
      });

      toast({
        title: "Sucesso",
        description: "Campanha de remarketing criada",
      });
    } catch (error) {
      console.error('Error creating remarketing campaign:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar campanha",
        variant: "destructive",
      });
    }
  };

  const updateCampaignStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('customer_remarketing')
        .update({ 
          status: newStatus,
          last_contact_date: newStatus === 'ENVIADO' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      await fetchRemarketingCustomers();
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENTE':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'ALTA':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'NORMAL':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'BAIXA':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-success/10 text-success border-success/20';
      case 'ENVIADO':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'RESPONDIDO':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'PAUSADO':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customer_phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || customer.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Remarketing</h1>
          <p className="text-muted-foreground">Reconquiste clientes perdidos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Remarketing
          </h1>
          <p className="text-muted-foreground">
            Reconquiste clientes perdidos com campanhas personalizadas
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Campanha de Remarketing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Cliente</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    placeholder="(31) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <Label>Mensagem de Remarketing</Label>
                <Textarea
                  value={formData.remarketing_message}
                  onChange={(e) => setFormData({...formData, remarketing_message: e.target.value})}
                  placeholder="Olá! Sentimos sua falta... Que tal experimentar nossos novos sabores? Temos uma promoção especial esperando por você! 🍔"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select 
                    value={formData.priority}
                    onValueChange={(value) => setFormData({...formData, priority: value})}
                  >
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
                <div>
                  <Label>Tipo de Campanha</Label>
                  <Select 
                    value={formData.campaign_type}
                    onValueChange={(value) => setFormData({...formData, campaign_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">Geral</SelectItem>
                      <SelectItem value="PROMOCAO">Promoção</SelectItem>
                      <SelectItem value="NOVIDADE">Novidade</SelectItem>
                      <SelectItem value="FIDELIDADE">Fidelidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={createRemarketingCampaign} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Criar Campanha
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar campanhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="enviado">Enviados</SelectItem>
            <SelectItem value="respondido">Respondidos</SelectItem>
            <SelectItem value="pausado">Pausados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {customers.filter(c => c.status === 'ATIVO').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Mensagens Enviadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {customers.filter(c => c.status === 'ENVIADO').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Respostas Recebidas</p>
                <p className="text-2xl font-bold text-green-600">
                  {customers.filter(c => c.response_received).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Alta Prioridade</p>
                <p className="text-2xl font-bold text-purple-600">
                  {customers.filter(c => c.priority === 'URGENTE' || c.priority === 'ALTA').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{customer.customer_name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {customer.customer_phone}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                  <Badge className={getPriorityColor(customer.priority)}>
                    {customer.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Mensagem:</p>
                <p className="text-sm">{customer.remarketing_message}</p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-3 w-3" />
                  Criado em {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                </div>
                {customer.last_contact_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Último contato: {new Date(customer.last_contact_date).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {customer.status === 'ATIVO' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateCampaignStatus(customer.id, 'ENVIADO')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Enviar
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateCampaignStatus(customer.id, customer.status === 'PAUSADO' ? 'ATIVO' : 'PAUSADO')}
                  className="flex-1"
                >
                  {customer.status === 'PAUSADO' ? 'Reativar' : 'Pausar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all" 
              ? "Tente ajustar os filtros de busca" 
              : "Crie sua primeira campanha de remarketing para reconquistar clientes"}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                Criar Primeira Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              {/* ... mesma dialog content de cima ... */}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}