// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { getClientes, saveCliente, deleteCliente } from '../../services/api';
import type { Cliente } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';

const ClientManagementView: React.FC = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Cliente | null>(null);
  
  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getClientes();
      setClients(data);
    } catch (error) {
      console.error("Falha ao carregar clientes:", error);
      // Aqui você poderia adicionar um estado para mostrar um erro na tela
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);
  
  const handleOpenFormModal = (client: Cliente | null = null) => {
    setSelectedClient(client);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedClient(null);
  };

  const handleOpenConfirmModal = (client: Cliente) => {
    setClientToDelete(client);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setClientToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleSaveClient = async (clientData: Partial<Cliente>) => {
    try {
      await saveCliente(clientData);
      handleCloseFormModal();
      await loadClients(); // Recarrega a lista do backend
    } catch (error) {
      console.error("Falha ao salvar cliente:", error);
    }
  };

  const handleDeleteClient = async () => {
    if (clientToDelete) {
      try {
        await deleteCliente(clientToDelete.id);
        handleCloseConfirmModal();
        await loadClients(); // Recarrega a lista do backend
      } catch (error) {
        console.error("Falha ao excluir cliente:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-secondary">Gestão de Clientes</h1>
            <p className="text-text-secondary mt-1">Adicione, edite e visualize os clientes do salão.</p>
        </div>
        <Button onClick={() => handleOpenFormModal()}>Adicionar Cliente</Button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Telefone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Data de Registro</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-text-secondary">Carregando clientes...</td></tr>
                ) : (
                clients.map((client) => (
                    <tr key={client.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{client.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{client.telefone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{client.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(client.dataRegistro).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                        <button onClick={() => handleOpenFormModal(client)} className="text-primary hover:text-primary-dark">Editar</button>
                        <button onClick={() => handleOpenConfirmModal(client)} className="text-red-600 hover:text-red-800">Excluir</button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
      
      {isFormModalOpen && (
        <ClientFormModal
            client={selectedClient}
            onClose={handleCloseFormModal}
            onSave={handleSaveClient}
        />
      )}
      
      {clientToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={handleCloseConfirmModal}
            onConfirm={handleDeleteClient}
            title="Confirmar Exclusão"
            message={`Tem certeza de que deseja excluir o cliente "${clientToDelete.nome}"? Esta ação não pode ser desfeita.`}
        />
      )}
    </div>
  );
};

const ClientFormModal: React.FC<{
  client: Cliente | null;
  onClose: () => void;
  onSave: (client: Partial<Cliente>) => void;
}> = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Cliente>>(
    client || { nome: '', telefone: '', email: '', dataNascimento: '', observacoes: '' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <Modal
        isOpen={true}
        onClose={onClose}
        title={client ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
        footer={
        <>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} className="ml-2">Salvar</Button>
        </>
        }
    >
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="nome" className="block text-sm font-medium text-text-secondary">Nome</label>
                <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-text-secondary">Telefone</label>
                <input type="tel" name="telefone" id="telefone" value={formData.telefone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
            </div>
            <div>
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-text-secondary">Data de Nascimento</label>
                <input type="date" name="dataNascimento" id="dataNascimento" value={formData.dataNascimento ? formData.dataNascimento.split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
            </div>
            <div>
                <label htmlFor="observacoes" className="block text-sm font-medium text-text-secondary">Observações</label>
                <textarea name="observacoes" id="observacoes" value={formData.observacoes} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"></textarea>
            </div>
        </form>
    </Modal>
  )
}

export default ClientManagementView;