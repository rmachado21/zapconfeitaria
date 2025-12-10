import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { DeleteClientDialog } from '@/components/clients/DeleteClientDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClients, Client, ClientFormData } from '@/hooks/useClients';
import { Plus, Search, Loader2, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'name_asc' | 'name_desc' | 'recent';

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { clients, isLoading, createClient, updateClient, deleteClient } = useClients();

  const filteredClients = useMemo(() => {
    let result = clients.filter(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone && client.phone.includes(searchQuery))
    );

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name, 'pt-BR');
        case 'name_desc':
          return b.name.localeCompare(a.name, 'pt-BR');
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [clients, searchQuery, sortOption]);

  const handleCreate = () => {
    setSelectedClient(null);
    setFormOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setDeleteOpen(true);
  };

  const handleSubmit = async (data: ClientFormData) => {
    if (selectedClient) {
      await updateClient.mutateAsync({ id: selectedClient.id, ...data });
    } else {
      await createClient.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedClient) {
      await deleteClient.mutateAsync(selectedClient.id);
      setDeleteOpen(false);
      setSelectedClient(null);
    }
  };

  return (
    <AppLayout>
      <div className="px-5 py-4 md:px-8 md:py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Clientes
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {clients.length} clientes cadastrados
            </p>
          </div>
          <Button variant="warm" onClick={handleCreate}>
            <Plus className="h-5 w-5" />
            Novo Cliente
          </Button>
        </header>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Nome: A-Z</SelectItem>
              <SelectItem value="name_desc">Nome: Z-A</SelectItem>
              <SelectItem value="recent">Mais recentes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clients List */}
        <section className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}</p>
              {clients.length === 0 && (
                <Button variant="link" className="mt-2" onClick={handleCreate}>
                  Cadastrar primeiro cliente
                </Button>
              )}
            </div>
          ) : (
            filteredClients.map((client, index) => (
              <div
                key={client.id}
                className={cn("animate-slide-up", `stagger-${Math.min(index + 1, 5)}`)}
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                <ClientCard
                  client={{
                    id: client.id,
                    name: client.name,
                    phone: client.phone || '',
                    email: client.email || undefined,
                    birthday: client.birthday || undefined,
                    createdAt: client.created_at,
                  }}
                  onClick={() => handleEdit(client)}
                  onDelete={() => handleDelete(client)}
                />
              </div>
            ))
          )}
        </section>

        {/* Mobile FAB */}
        <Button
          variant="warm"
          size="icon-lg"
          className="fixed bottom-20 right-4 md:hidden shadow-warm rounded-full z-40"
          onClick={handleCreate}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Form Dialog */}
      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={selectedClient}
        onSubmit={handleSubmit}
        isLoading={createClient.isPending || updateClient.isPending}
      />

      {/* Delete Dialog */}
      <DeleteClientDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        clientName={selectedClient?.name || ''}
        onConfirm={handleConfirmDelete}
        isLoading={deleteClient.isPending}
      />
    </AppLayout>
  );
};

export default Clients;
