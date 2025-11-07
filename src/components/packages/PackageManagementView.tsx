// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { getPacotes, savePacote, deletePacote, getServicos } from '../../services/api';
import type { Pacote, Servico } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const PackageManagementView: React.FC = () => {
  const [packages, setPackages] = useState<Pacote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Pacote | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<Pacote | null>(null);

  const loadPackages = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPacotes();
      setPackages(data);
    } catch (error) {
      console.error("Falha ao carregar pacotes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleOpenFormModal = (pkg: Pacote | null = null) => {
    setSelectedPackage(pkg);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedPackage(null);
  };
  
  const handleOpenConfirmModal = (pkg: Pacote) => {
    setPackageToDelete(pkg);
    setIsConfirmModalOpen(true);
  };
  
  const handleCloseConfirmModal = () => {
    setPackageToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleSavePackage = async (pkg: Partial<Pacote>) => {
    try {
      await savePacote(pkg);
      handleCloseFormModal();
      await loadPackages();
    } catch (error) {
      console.error("Falha ao salvar pacote:", error);
    }
  };

  const handleDeletePackage = async () => {
    if(packageToDelete) {
        try {
            await deletePacote(packageToDelete.id);
            handleCloseConfirmModal();
            await loadPackages();
        } catch(error) {
            console.error("Falha ao excluir pacote:", error);
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Gestão de Pacotes</h1>
          <p className="text-text-secondary mt-1">Crie e gerencie pacotes promocionais de serviços.</p>
        </div>
        <Button onClick={() => handleOpenFormModal()}>Criar Pacote</Button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Nome do Pacote</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Preço Promocional</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Serviços Inclusos</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-text-secondary">Carregando pacotes...</td></tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{pkg.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        <span className="font-semibold text-primary">{formatCurrency(pkg.preco)}</span>
                        <span className="line-through text-xs ml-2">{formatCurrency(pkg.precoOriginal)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary max-w-sm truncate">{pkg.servicosInclusos}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pkg.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {pkg.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button onClick={() => handleOpenFormModal(pkg)} className="text-primary hover:text-primary-dark">Editar</button>
                      <button onClick={() => handleOpenConfirmModal(pkg)} className="text-red-600 hover:text-red-800">Excluir</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormModalOpen && (
        <PackageFormModal
          pkg={selectedPackage}
          onClose={handleCloseFormModal}
          onSave={handleSavePackage}
        />
      )}

      {packageToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={handleCloseConfirmModal}
            onConfirm={handleDeletePackage}
            title="Confirmar Exclusão"
            message={`Tem certeza que deseja excluir o pacote "${packageToDelete.nome}"?`}
        />
      )}
    </div>
  );
};

const PackageFormModal: React.FC<{
  pkg: Pacote | null;
  onClose: () => void;
  onSave: (pkg: Partial<Pacote>) => void;
}> = ({ pkg, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Pacote>>(
    pkg || { nome: '', descricao: '', preco: 0, precoOriginal: 0, validade: 30, servicosInclusos: '', ativo: true }
  );
  const [availableServices, setAvailableServices] = useState<Servico[]>([]);

  useEffect(() => {
    getServicos().then(data => setAvailableServices(data.filter(s => s.ativo)));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value, type } = e.target;
     if (type === 'checkbox' && name === 'ativo') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
     } else if (name === 'preco' || name === 'precoOriginal') {
        setFormData(prev => ({ ...prev, [name]: Math.round(parseFloat(value) * 100) }));
     } else if (name === 'validade') {
        setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
     } else {
        setFormData(prev => ({...prev, [name]: value}));
     }
  }

  const handleServicesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, checked } = e.target;
      const currentServices = formData.servicosInclusos ? formData.servicosInclusos.split(',') : [];
      const newServices = checked 
        ? [...currentServices, value]
        : currentServices.filter(s => s !== value);
      setFormData(prev => ({...prev, servicosInclusos: newServices.join(',')}))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={pkg ? 'Editar Pacote' : 'Criar Novo Pacote'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="ml-2">Salvar</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-text-secondary">Nome do Pacote</label>
          <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="preco" className="block text-sm font-medium text-text-secondary">Preço (R$)</label>
                <input type="number" step="0.01" name="preco" id="preco" value={formData.preco !== undefined ? formData.preco / 100 : ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
             <div>
                <label htmlFor="precoOriginal" className="block text-sm font-medium text-text-secondary">Preço Original (R$)</label>
                <input type="number" step="0.01" name="precoOriginal" id="precoOriginal" value={formData.precoOriginal !== undefined ? formData.precoOriginal / 100 : ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="validade" className="block text-sm font-medium text-text-secondary">Validade (dias)</label>
                <input type="number" name="validade" id="validade" value={formData.validade} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary">Serviços Inclusos</label>
          <div className="mt-2 grid grid-cols-2 gap-2 border rounded-md p-2 max-h-40 overflow-y-auto">
              {availableServices.map(service => (
                  <div key={service.id} className="flex items-center">
                      <input 
                        type="checkbox"
                        id={`service-${service.id}`}
                        value={service.nome}
                        checked={formData.servicosInclusos?.includes(service.nome)}
                        onChange={handleServicesChange}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-text-secondary">{service.nome}</label>
                  </div>
              ))}
          </div>
        </div>
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-text-secondary">Descrição</label>
          <textarea name="descricao" id="descricao" value={formData.descricao} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"></textarea>
        </div>
         <div className="flex items-center">
            <input id="ativo" name="ativo" type="checkbox" checked={formData.ativo} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
            <label htmlFor="ativo" className="ml-2 block text-sm text-text-secondary">Pacote ativo</label>
        </div>
      </form>
    </Modal>
  )
}

export default PackageManagementView;