import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClientCard } from '@/components/clients/ClientCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockClients } from '@/data/mockData';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Clientes
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mockClients.length} clientes cadastrados
            </p>
          </div>
          <Button variant="warm">
            <Plus className="h-5 w-5" />
            Novo Cliente
          </Button>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clients List */}
        <section className="space-y-3">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum cliente encontrado</p>
            </div>
          ) : (
            filteredClients.map((client, index) => (
              <div
                key={client.id}
                className={cn("animate-slide-up", `stagger-${Math.min(index + 1, 5)}`)}
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                <ClientCard client={client} />
              </div>
            ))
          )}
        </section>

        {/* Mobile FAB */}
        <Button
          variant="warm"
          size="icon-lg"
          className="fixed bottom-20 right-4 md:hidden shadow-warm rounded-full z-40"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </AppLayout>
  );
};

export default Clients;
