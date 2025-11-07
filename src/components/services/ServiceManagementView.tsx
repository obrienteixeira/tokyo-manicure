// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { getServicos, saveServico, deleteServico } from '../../services/api';
import type { Servico } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';

// Utility to format currency from cents to BRL format.
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const ServiceManagementView: React.FC = () => {
  const [services, setServices] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Servico | null>(null);

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getServicos();
      setServices(data);
    } catch (error) {
      console.error("Falha ao carregar serviços:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleOpenFormModal = (service: Servico | null = null) => {
    setSelectedService(service);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedService(null);
  };
  
  const handleOpenConfirmModal = (service: Servico) => {
    setServiceToDelete(service);
    setIsConfirmModalOpen(true);
  };
  
  const handleCloseConfirmModal = () => {
    setServiceToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleSaveService = async (serviceData: Partial<Servico>) => {
    try {
      await saveServico(serviceData);
      handleCloseFormModal();
      await loadServices();
    } catch (error) {
      console.error("Falha ao salvar serviço:", error);
    }
  };

  const handleDeleteService = async () => {
    if(serviceToDelete) {
      try {
        await deleteServico(serviceToDelete.id);
        handleCloseConfirmModal();
        await loadServices();
      } catch (error) {
        console.error("Falha ao excluir serviço:", error);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Gestão de Serviços</h1>
          <p className="text-text-secondary mt-1">Adicione, edite e visualize os serviços oferecidos.</p>
        </div>
        <Button onClick={() => handleOpenFormModal()}>Adicionar Serviço</Button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Preço</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Duração</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-text-secondary">Carregando serviços...</td></tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{service.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(service.preco)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{service.duracaoMinutos} min</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {service.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button onClick={() => handleOpenFormModal(service)} className="text-primary hover:text-primary-dark">Editar</button>
                      <button onClick={() => handleOpenConfirmModal(service)} className="text-red-600 hover:text-red-800">Excluir</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormModalOpen && (
        <ServiceFormModal
          service={selectedService}
          onClose={handleCloseFormModal}
          onSave={handleSaveService}
        />
      )}

      {serviceToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={handleCloseConfirmModal}
            onConfirm={handleDeleteService}
            title="Confirmar Exclusão"
            message={`Tem certeza que deseja excluir o serviço "${serviceToDelete.nome}"?`}
        />
      )}
    </div>
  );
};

const ServiceFormModal: React.FC<{
  service: Servico | null;
  onClose: () => void;
  onSave: (service: Partial<Servico>) => void;
}> = ({ service, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Servico>>(
    service || { nome: '', descricao: '', preco: 0, duracaoMinutos: 30, ativo: true }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
     if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'preco') {
        setFormData(prev => ({ ...prev, [name]: Math.round(parseFloat(value) * 100) }));
    } else {
        setFormData(prev => ({...prev, [name]: value}));
    }
  };
  
  const handleIntegerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="ml-2">Salvar</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-text-secondary">Nome do Serviço</label>
          <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="preco" className="block text-sm font-medium text-text-secondary">Preço (R$)</label>
                <input type="number" step="0.01" name="preco" id="preco" value={formData.preco !== undefined ? formData.preco / 100 : ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="duracaoMinutos" className="block text-sm font-medium text-text-secondary">Duração (minutos)</label>
                <input type="number" name="duracaoMinutos" id="duracaoMinutos" value={formData.duracaoMinutos} onChange={handleIntegerChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
        </div>
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-text-secondary">Descrição</label>
          <textarea name="descricao" id="descricao" value={formData.descricao} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"></textarea>
        </div>
        <div className="flex items-center">
            <input id="ativo" name="ativo" type="checkbox" checked={formData.ativo} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
            <label htmlFor="ativo" className="ml-2 block text-sm text-text-secondary">Serviço ativo</label>
        </div>
      </form>
    </Modal>
  )
}

export default ServiceManagementView;