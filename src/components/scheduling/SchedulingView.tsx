// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAgendamentos, saveAgendamento, deleteAgendamento, getClientes, getFuncionarios, getServicos } from '../../services/api';
import type { Agendamento, Cliente, Funcionario, Servico } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';

const SchedulingView: React.FC = () => {
  const [appointments, setAppointments] = useState<Agendamento[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [employees, setEmployees] = useState<Funcionario[]>([]);
  const [services, setServices] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Agendamento | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Agendamento | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [agendamentosData, clientesData, funcionariosData, servicosData] = await Promise.all([
        getAgendamentos(),
        getClientes(),
        getFuncionarios(),
        getServicos(),
      ]);
      setAppointments(agendamentosData.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()));
      setClients(clientesData);
      setEmployees(funcionariosData.filter(e => e.ativo));
      setServices(servicosData.filter(s => s.ativo));
    } catch (error) {
      console.error("Falha ao carregar dados de agendamento", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.nome])), [clients]);
  const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e.nome])), [employees]);
  const serviceMap = useMemo(() => new Map(services.map(s => [s.id, s.nome])), [services]);

  const handleOpenFormModal = (appt: Agendamento | null = null) => {
    setSelectedAppointment(appt);
    setIsFormModalOpen(true);
  };
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setSelectedAppointment(null);
  };

  const handleOpenConfirmModal = (appt: Agendamento) => {
    setAppointmentToDelete(appt);
    setIsConfirmModalOpen(true);
  }
  const handleCloseConfirmModal = () => {
    setAppointmentToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleSave = async (appt: Partial<Agendamento>) => {
    try {
        await saveAgendamento(appt);
        handleCloseFormModal();
        await loadData();
    } catch (error) {
        console.error("Falha ao salvar agendamento:", error);
    }
  };

  const handleDelete = async () => {
    if(appointmentToDelete) {
        try {
            await deleteAgendamento(appointmentToDelete.id);
            handleCloseConfirmModal();
            await loadData();
        } catch (error) {
            console.error("Falha ao excluir agendamento:", error);
        }
    }
  }

  const statusStyles: { [key in Agendamento['status']]: string } = {
    agendado: 'bg-blue-100 text-blue-800',
    confirmado: 'bg-green-100 text-green-800',
    em_atendimento: 'bg-yellow-100 text-yellow-800',
    concluido: 'bg-gray-100 text-gray-800',
    cancelado: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Agendamentos</h1>
          <p className="text-text-secondary mt-1">Visualize e gerencie os horários marcados.</p>
        </div>
        <Button onClick={() => handleOpenFormModal()}>Novo Agendamento</Button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Data & Hora</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Funcionário</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Carregando agendamentos...</td></tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{new Date(appt.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'})}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{clientMap.get(appt.clienteId) || 'Desconhecido'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{serviceMap.get(appt.servicoId) || 'Desconhecido'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{employeeMap.get(appt.funcionarioId) || 'Desconhecido'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[appt.status]}`}>{appt.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button onClick={() => handleOpenFormModal(appt)} className="text-primary hover:text-primary-dark">Editar</button>
                      <button onClick={() => handleOpenConfirmModal(appt)} className="text-red-600 hover:text-red-800">Excluir</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isFormModalOpen && <AppointmentFormModal onClose={handleCloseFormModal} onSave={handleSave} appointment={selectedAppointment} clients={clients} employees={employees} services={services} />}
      {appointmentToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={handleCloseConfirmModal}
            onConfirm={handleDelete}
            title="Confirmar Exclusão"
            message={`Tem certeza que deseja excluir este agendamento?`}
        />
      )}
    </div>
  );
};

const AppointmentFormModal: React.FC<{
  onClose: () => void;
  onSave: (appt: Partial<Agendamento>) => void;
  appointment: Agendamento | null;
  clients: Cliente[];
  employees: Funcionario[];
  services: Servico[];
}> = ({ onClose, onSave, appointment, clients, employees, services }) => {
  const [formData, setFormData] = useState<Partial<Agendamento>>(
    appointment || { status: 'agendado', dataHora: new Date().toISOString().slice(0, 16) }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Converte Ids para número
    if (name.endsWith('Id')) {
        setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  }
  
  // Ajuste para formatar a data para o input datetime-local
  const formatDateTimeLocal = (isoString: string | undefined) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      // Ajusta para o fuso horário local antes de formatar
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      return localDate.toISOString().slice(0, 16);
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={appointment ? "Editar Agendamento" : "Novo Agendamento"} footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={handleSubmit} className="ml-2">Salvar</Button></>}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="clienteId" className="block text-sm font-medium text-text-secondary">Cliente</label>
          <select id="clienteId" name="clienteId" value={formData.clienteId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
            <option value="">Selecione um cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="servicoId" className="block text-sm font-medium text-text-secondary">Serviço</label>
          <select id="servicoId" name="servicoId" value={formData.servicoId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
            <option value="">Selecione um serviço</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="funcionarioId" className="block text-sm font-medium text-text-secondary">Funcionário</label>
          <select id="funcionarioId" name="funcionarioId" value={formData.funcionarioId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
            <option value="">Selecione um funcionário</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="dataHora" className="block text-sm font-medium text-text-secondary">Data e Hora</label>
          <input type="datetime-local" id="dataHora" name="dataHora" value={formatDateTimeLocal(formData.dataHora)} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-text-secondary">Status</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label htmlFor="observacoes" className="block text-sm font-medium text-text-secondary">Observações</label>
          <textarea name="observacoes" id="observacoes" value={formData.observacoes} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"></textarea>
        </div>
      </form>
    </Modal>
  )
}

export default SchedulingView;