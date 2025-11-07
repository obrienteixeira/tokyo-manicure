// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { getFuncionarios, saveFuncionario, deleteFuncionario } from '../../services/api';
import type { Funcionario } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';

const EmployeeManagementView: React.FC = () => {
  const [employees, setEmployees] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Funcionario | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Funcionario | null>(null);

  const loadEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getFuncionarios();
      setEmployees(data);
    } catch (error) {
      console.error("Falha ao carregar funcionários:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleOpenFormModal = (employee: Funcionario | null = null) => {
    setSelectedEmployee(employee);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleOpenConfirmModal = (employee: Funcionario) => {
    setEmployeeToDelete(employee);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setEmployeeToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleSaveEmployee = async (employeeData: Partial<Funcionario>) => {
    try {
      await saveFuncionario(employeeData);
      handleCloseFormModal();
      await loadEmployees();
    } catch (error) {
      console.error("Falha ao salvar funcionário:", error);
    }
  };

  const handleDeleteEmployee = async () => {
    if (employeeToDelete) {
      try {
        await deleteFuncionario(employeeToDelete.id);
        handleCloseConfirmModal();
        await loadEmployees();
      } catch (error) {
        console.error("Falha ao excluir funcionário:", error);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-secondary">Gestão de Funcionários</h1>
            <p className="text-text-secondary mt-1">Gerencie a equipe de profissionais do salão.</p>
        </div>
        <Button onClick={() => handleOpenFormModal()}>Adicionar Funcionário</Button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Nome</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Especialidades</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Telefone</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-text-secondary">Carregando funcionários...</td></tr>
                ) : (
                employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{employee.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{employee.especialidades || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{employee.telefone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {employee.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                        <button onClick={() => handleOpenFormModal(employee)} className="text-primary hover:text-primary-dark">Editar</button>
                        <button onClick={() => handleOpenConfirmModal(employee)} className="text-red-600 hover:text-red-800">Excluir</button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {isFormModalOpen && (
        <EmployeeFormModal
            employee={selectedEmployee}
            onClose={handleCloseFormModal}
            onSave={handleSaveEmployee}
        />
      )}

      {employeeToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={handleCloseConfirmModal}
            onConfirm={handleDeleteEmployee}
            title="Confirmar Exclusão"
            message={`Tem certeza de que deseja excluir o funcionário "${employeeToDelete.nome}"?`}
        />
      )}
    </div>
  );
};

const EmployeeFormModal: React.FC<{
  employee: Funcionario | null;
  onClose: () => void;
  onSave: (employee: Partial<Funcionario>) => void;
}> = ({ employee, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Funcionario>>(
    employee || { 
        nome: '', 
        telefone: '', 
        email: '', 
        especialidades: '', 
        comissaoPercentual: 0, 
        ativo: true,
        cpfCnpj: '',
        bancoNome: '',
        agencia: '',
        contaBancaria: '',
        tipoConta: undefined
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <Modal
        isOpen={true}
        onClose={onClose}
        title={employee ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}
        footer={
        <>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} className="ml-2">Salvar</Button>
        </>
        }
    >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-text-secondary">Nome</label>
                    <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-text-secondary">Telefone</label>
                    <input type="tel" name="telefone" id="telefone" value={formData.telefone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="especialidades" className="block text-sm font-medium text-text-secondary">Especialidades</label>
                    <input type="text" name="especialidades" id="especialidades" value={formData.especialidades} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" placeholder="Ex: Manicure, Pedicure, Nail Art"/>
                </div>
                 <div>
                    <label htmlFor="cpfCnpj" className="block text-sm font-medium text-text-secondary">CPF/CNPJ</label>
                    <input type="text" name="cpfCnpj" id="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="comissaoPercentual" className="block text-sm font-medium text-text-secondary">Comissão (%)</label>
                    <input type="number" name="comissaoPercentual" id="comissaoPercentual" value={formData.comissaoPercentual} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
            </div>

            <div className="pt-4 mt-4 border-t">
                <h4 className="text-md font-medium text-text-primary">Informações Bancárias</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label htmlFor="bancoNome" className="block text-sm font-medium text-text-secondary">Nome do Banco</label>
                        <input type="text" name="bancoNome" id="bancoNome" value={formData.bancoNome} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="agencia" className="block text-sm font-medium text-text-secondary">Agência</label>
                        <input type="text" name="agencia" id="agencia" value={formData.agencia} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="contaBancaria" className="block text-sm font-medium text-text-secondary">Conta (com dígito)</label>
                        <input type="text" name="contaBancaria" id="contaBancaria" value={formData.contaBancaria} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="tipoConta" className="block text-sm font-medium text-text-secondary">Tipo de Conta</label>
                        <select name="tipoConta" id="tipoConta" value={formData.tipoConta} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                            <option value="">Selecione...</option>
                            <option value="corrente">Corrente</option>
                            <option value="poupanca">Poupança</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end pt-4 mt-4 border-t">
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                    <input id="ativo" name="ativo" type="checkbox" checked={formData.ativo} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                    <label htmlFor="ativo" className="font-medium text-text-secondary">Funcionário Ativo</label>
                    </div>
                </div>
            </div>
        </form>
    </Modal>
  )
}

export default EmployeeManagementView;