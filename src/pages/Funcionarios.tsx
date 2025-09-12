import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SenhaTemporariaModal } from "@/components/SenhaTemporariaModal";
import { 
  UserCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Mail,
  Phone,
  Award,
  Activity
} from "lucide-react";

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cargoFilter, setCargoFilter] = useState("all");
  const [selectedFuncionario, setSelectedFuncionario] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    nivel_acesso: "FUNCIONARIO",
    ativo: true
  });
  const [senhaModal, setSenhaModal] = useState({
    isOpen: false,
    funcionarioNome: "",
    funcionarioEmail: "",
    senhaTemporaria: ""
  });
  const { toast } = useToast();

  const cargos = [
    'CHAPEIRO',
    'ATENDENTE', 
    'CAIXA',
    'COZINHEIRA',
    'GERENTE'
  ];

  const niveisAcesso = [
    { value: 'FUNCIONARIO', label: 'Funcionário' },
    { value: 'ADMIN', label: 'Administrador' }
  ];

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .order('nome');

      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Error fetching funcionarios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar funcionários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFuncionario = async () => {
    try {
      const funcionarioData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || null,
        cargo: formData.cargo,
        nivel_acesso: formData.nivel_acesso,
        ativo: formData.ativo
      };

      let error;
      let funcionarioId;

      if (isEditing && selectedFuncionario) {
        // Atualizar funcionário existente
        ({ error } = await supabase
          .from('funcionarios')
          .update(funcionarioData)
          .eq('id', selectedFuncionario.id));
        
        funcionarioId = selectedFuncionario.id;
      } else {
        // Cadastrar novo funcionário
        const { data: funcionarioInserted, error: insertError } = await supabase
          .from('funcionarios')
          .insert(funcionarioData)
          .select()
          .single();
        
        if (insertError) throw insertError;
        funcionarioId = funcionarioInserted.id;

        // Criar usuário no sistema de autenticação usando signUp
        try {
          // Gerar senha temporária
          const senhaTemporaria = Math.random().toString(36).slice(-8) + '123!';
          
          console.log('🔍 Tentando criar usuário no auth...');
          console.log('Email:', formData.email);
          console.log('Senha temporária:', senhaTemporaria);
          
          // Usar signUp como na tela de Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: senhaTemporaria,
            options: {
              data: {
                nome: formData.nome,
                papel: formData.nivel_acesso,
                cargo: formData.cargo
              }
            }
          });

          console.log('📊 Resultado do signUp:');
          console.log('AuthData:', authData);
          console.log('AuthError:', authError);

          if (authError) {
            console.error('❌ Erro ao criar usuário no auth:', authError);
            toast({
              title: "Aviso",
              description: `Funcionário cadastrado, mas erro ao criar usuário: ${authError.message}`,
              variant: "destructive",
            });
          } else if (authData.user) {
            console.log('✅ Usuário criado no auth com sucesso!');
            console.log('User ID:', authData.user.id);
            
            // Atualizar funcionário com o profile_id
            const { error: updateError } = await supabase
              .from('funcionarios')
              .update({ profile_id: authData.user.id })
              .eq('id', funcionarioId);

            if (updateError) {
              console.error('❌ Erro ao atualizar funcionário com profile_id:', updateError);
            } else {
              console.log('✅ Funcionário atualizado com profile_id');
            }
            
            // Mostrar modal com senha temporária
            setSenhaModal({
              isOpen: true,
              funcionarioNome: formData.nome,
              funcionarioEmail: formData.email,
              senhaTemporaria: senhaTemporaria
            });
          } else {
            console.warn('⚠️ AuthData.user é null/undefined');
          }
        } catch (authError) {
          console.error('❌ Erro inesperado ao criar usuário:', authError);
          toast({
            title: "Aviso",
            description: `Funcionário cadastrado, mas erro inesperado: ${authError.message}`,
            variant: "destructive",
          });
        }
      }

      if (error) throw error;

      await fetchFuncionarios();
      resetForm();
      toast({
        title: "Sucesso",
        description: `Funcionário ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso${!isEditing ? ' e usuário criado no sistema' : ''}`,
      });
    } catch (error) {
      console.error('Error saving funcionario:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar funcionário",
        variant: "destructive",
      });
    }
  };

  const deleteFuncionario = async (funcionarioId: string) => {
    try {
      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', funcionarioId);

      if (error) throw error;

      await fetchFuncionarios();
      toast({
        title: "Sucesso",
        description: "Funcionário excluído com sucesso",
      });
    } catch (error) {
      console.error('Error deleting funcionario:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir funcionário",
        variant: "destructive",
      });
    }
  };

  const toggleFuncionarioStatus = async (funcionarioId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('funcionarios')
        .update({ ativo: !currentStatus })
        .eq('id', funcionarioId);

      if (error) throw error;

      await fetchFuncionarios();
      toast({
        title: "Sucesso",
        description: `Funcionário ${!currentStatus ? 'ativado' : 'desativado'}`,
      });
    } catch (error) {
      console.error('Error toggling funcionario status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do funcionário",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cargo: "",
      nivel_acesso: "FUNCIONARIO",
      ativo: true
    });
    setSelectedFuncionario(null);
    setIsEditing(false);
  };

  const editFuncionario = (funcionario: any) => {
    setFormData({
      nome: funcionario.nome,
      email: funcionario.email,
      telefone: funcionario.telefone || "",
      cargo: funcionario.cargo,
      nivel_acesso: funcionario.nivel_acesso,
      ativo: funcionario.ativo
    });
    setSelectedFuncionario(funcionario);
    setIsEditing(true);
  };

  const getCargoColor = (cargo: string) => {
    switch (cargo) {
      case 'CHAPEIRO':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'ATENDENTE':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'CAIXA':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'COZINHEIRA':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'GERENTE':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredFuncionarios = funcionarios.filter(funcionario => {
    const matchesSearch = funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         funcionario.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCargo = cargoFilter === "all" || funcionario.cargo === cargoFilter;
    return matchesSearch && matchesCargo;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Funcionários</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie a equipe do restaurante</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="joao@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(31) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select
                  value={formData.cargo}
                  onValueChange={(value) => setFormData({...formData, cargo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo} value={cargo}>
                        {cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nível de Acesso</Label>
                <Select
                  value={formData.nivel_acesso}
                  onValueChange={(value) => setFormData({...formData, nivel_acesso: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {niveisAcesso.map((nivel) => (
                      <SelectItem key={nivel.value} value={nivel.value}>
                        {nivel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                  />
                  <span className="text-sm">
                    {formData.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="col-span-2 flex gap-2">
                <Button onClick={saveFuncionario} className="flex-1">
                  {isEditing ? 'Atualizar' : 'Cadastrar'} Funcionário
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar funcionários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={cargoFilter} onValueChange={setCargoFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            {cargos.map((cargo) => (
              <SelectItem key={cargo} value={cargo}>
                {cargo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Funcionários Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFuncionarios.map((funcionario) => (
          <Card key={funcionario.id} className="shadow-elegant hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    {funcionario.nome}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getCargoColor(funcionario.cargo)}>
                      {funcionario.cargo}
                    </Badge>
                    <Badge 
                      variant={funcionario.nivel_acesso === 'ADMIN' ? "default" : "outline"}
                    >
                      {funcionario.nivel_acesso === 'ADMIN' ? 'Admin' : 'Funcionário'}
                    </Badge>
                  </div>
                </div>
                <Badge 
                  variant={funcionario.ativo ? "default" : "secondary"}
                  className="text-xs"
                >
                  {funcionario.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{funcionario.email}</span>
                </div>
                {funcionario.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{funcionario.telefone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Cadastrado em {new Date(funcionario.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs bg-muted/50 p-2 rounded">
                  <div>
                    <p className="font-medium text-primary">Mesas Atendidas</p>
                    <p className="text-lg font-bold">{funcionario.total_mesas_atendidas || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium text-accent">Pedidos Processados</p>
                    <p className="text-lg font-bold">{funcionario.total_pedidos_processados || 0}</p>
                  </div>
                </div>
                {funcionario.last_activity && (
                  <div className="text-xs text-muted-foreground">
                    Última atividade: {new Date(funcionario.last_activity).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFuncionarioStatus(funcionario.id, funcionario.ativo)}
                  className="flex-1"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {funcionario.ativo ? 'Desativar' : 'Ativar'}
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editFuncionario(funcionario)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Editar Funcionário</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input
                          value={formData.nome}
                          onChange={(e) => setFormData({...formData, nome: e.target.value})}
                          placeholder="Ex: João Silva"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="joao@exemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={formData.telefone}
                          onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                          placeholder="(31) 99999-9999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cargo</Label>
                        <Select
                          value={formData.cargo}
                          onValueChange={(value) => setFormData({...formData, cargo: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cargo" />
                          </SelectTrigger>
                          <SelectContent>
                            {cargos.map((cargo) => (
                              <SelectItem key={cargo} value={cargo}>
                                {cargo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nível de Acesso</Label>
                        <Select
                          value={formData.nivel_acesso}
                          onValueChange={(value) => setFormData({...formData, nivel_acesso: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {niveisAcesso.map((nivel) => (
                              <SelectItem key={nivel.value} value={nivel.value}>
                                {nivel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.ativo}
                            onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                          />
                          <span className="text-sm">
                            {formData.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <Button onClick={saveFuncionario} className="flex-1">
                          Atualizar Funcionário
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => deleteFuncionario(funcionario.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFuncionarios.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum funcionário encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || cargoFilter !== "all" 
                ? "Tente ajustar os filtros de busca"
                : "Comece cadastrando funcionários para sua equipe"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resumo por Cargo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cargos.map((cargo) => {
          const count = funcionarios.filter(f => f.cargo === cargo && f.ativo).length;
          return (
            <Card key={cargo}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{count}</p>
                <p className="text-sm text-muted-foreground">{cargo}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de Senha Temporária */}
      <SenhaTemporariaModal
        isOpen={senhaModal.isOpen}
        onClose={() => setSenhaModal({ ...senhaModal, isOpen: false })}
        funcionarioNome={senhaModal.funcionarioNome}
        funcionarioEmail={senhaModal.funcionarioEmail}
        senhaTemporaria={senhaModal.senhaTemporaria}
      />
    </div>
  );
}