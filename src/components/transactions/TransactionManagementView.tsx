// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getTransacoes, saveTransacao, deleteTransacao, getClientes, getFuncionarios, getServicos, getProdutos } from '../../services/api';
import type { Transacao, Cliente, Funcionario, Servico, Produto } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const TransactionManagementView: React.FC = () => {
    const [transactions, setTransactions] = useState<Transacao[]>([]);
    const [clients, setClients] = useState<Cliente[]>([]);
    const [employees, setEmployees] = useState<Funcionario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transacao | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [transData, clientData, employeeData] = await Promise.all([
                getTransacoes(),
                getClientes(),
                getFuncionarios()
            ]);
            setTransactions(transData.sort((a,b) => new Date(b.dataTransacao).getTime() - new Date(a.dataTransacao).getTime()));
            setClients(clientData);
            setEmployees(employeeData);
        } catch (error) {
            console.error("Falha ao carregar transações:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.nome])), [clients]);

    const handleOpenFormModal = () => setIsFormModalOpen(true);
    const handleCloseFormModal = () => setIsFormModalOpen(false);
    
    const handleOpenConfirmModal = (transaction: Transacao) => {
        setTransactionToDelete(transaction);
        setIsConfirmModalOpen(true);
    };
    const handleCloseConfirmModal = () => {
        setTransactionToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleSaveTransaction = async (transaction: Partial<Transacao>) => {
        try {
            await saveTransacao(transaction);
            handleCloseFormModal();
            await loadData();
        } catch (error) {
            console.error("Falha ao salvar transação:", error);
        }
    };
    
    const handleDeleteTransaction = async () => {
        if (transactionToDelete) {
            try {
                await deleteTransacao(transactionToDelete.id);
                handleCloseConfirmModal();
                await loadData();
            } catch (error) {
                console.error("Falha ao excluir transação:", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Transações</h1>
                    <p className="text-text-secondary mt-1">Registre e visualize todas as vendas de serviços e produtos.</p>
                </div>
                <Button onClick={handleOpenFormModal}>Registrar Transação</Button>
            </div>
            <div className="bg-surface rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Pagamento</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-10">Carregando transações...</td></tr>
                            ) : (
                                transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-pink-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(t.dataTransacao).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{clientMap.get(t.clienteId) || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary truncate max-w-xs">{t.descricao}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(t.valor)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary capitalize">{t.metodoPagamento.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => handleOpenConfirmModal(t)} className="text-red-600 hover:text-red-800">Excluir</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isFormModalOpen && <TransactionFormModal onClose={handleCloseFormModal} onSave={handleSaveTransaction} clients={clients} employees={employees} />}
            {transactionToDelete && <ConfirmationModal isOpen={isConfirmModalOpen} onClose={handleCloseConfirmModal} onConfirm={handleDeleteTransaction} title="Confirmar Exclusão" message="Tem certeza que deseja excluir esta transação?" />}
        </div>
    );
};

const TransactionFormModal: React.FC<{
    onClose: () => void;
    onSave: (transaction: Partial<Transacao>) => void;
    clients: Cliente[];
    employees: Funcionario[];
}> = ({ onClose, onSave, clients, employees }) => {
    const [formData, setFormData] = useState<Partial<Transacao>>({ 
        tipo: 'servico', 
        metodoPagamento: 'pix',
        dataTransacao: new Date().toISOString()
    });
    const [services, setServices] = useState<Servico[]>([]);
    const [products, setProducts] = useState<Produto[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string>('');

    useEffect(() => {
        if (formData.tipo === 'servico') {
            getServicos().then(data => setServices(data.filter(s => s.ativo)));
        } else {
            getProdutos().then(data => setProducts(data.filter(p => p.ativo)));
        }
        // Reset item selection when type changes
        setSelectedItemId('');
        setFormData(prev => ({...prev, valor: 0, descricao: ''}));
    }, [formData.tipo]);

    const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedItemId(id);
        const list = formData.tipo === 'servico' ? services : products;
        const item = list.find(i => i.id === parseInt(id));
        if (item) {
            setFormData(prev => ({
                ...prev,
                valor: item.preco,
                descricao: item.nome,
            }));
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'clienteId' || name === 'funcionarioId') {
            setFormData(prev => ({ ...prev, [name]: value ? parseInt(value, 10) : undefined }));
        } else if (name === 'valor') {
            setFormData(prev => ({ ...prev, [name]: value ? Math.round(parseFloat(value) * 100) : 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const itemList = formData.tipo === 'servico' ? services : products;

    return (
        <Modal isOpen={true} onClose={onClose} title="Registrar Nova Transação" footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={handleSubmit} className="ml-2">Salvar</Button></>}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary">Tipo de Transação</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <button type="button" onClick={() => setFormData(p => ({...p, tipo: 'servico'}))} className={`px-4 py-2 border rounded-l-md w-1/2 ${formData.tipo === 'servico' ? 'bg-primary text-white border-primary' : 'bg-white'}`}>Serviço</button>
                        <button type="button" onClick={() => setFormData(p => ({...p, tipo: 'produto'}))} className={`px-4 py-2 border rounded-r-md w-1/2 ${formData.tipo === 'produto' ? 'bg-primary text-white border-primary' : 'bg-white'}`}>Produto</button>
                    </div>
                </div>
                <div>
                    <label htmlFor="clienteId" className="block text-sm font-medium text-text-secondary">Cliente</label>
                    <select name="clienteId" value={formData.clienteId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
                        <option value="">Selecione...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="item" className="block text-sm font-medium text-text-secondary">{formData.tipo === 'servico' ? 'Serviço' : 'Produto'}</label>
                    <select id="item" name="item" value={selectedItemId} onChange={handleItemChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
                        <option value="">Selecione...</option>
                        {itemList.map(item => <option key={item.id} value={item.id}>{item.nome} - {formatCurrency(item.preco)}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="valor" className="block text-sm font-medium text-text-secondary">Valor (R$)</label>
                        <input type="number" step="0.01" name="valor" value={formData.valor !== undefined ? formData.valor / 100 : ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="metodoPagamento" className="block text-sm font-medium text-text-secondary">Método de Pagamento</label>
                        <select name="metodoPagamento" value={formData.metodoPagamento} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
                            <option value="pix">PIX</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao_credito">Cartão de Crédito</option>
                            <option value="cartao_debito">Cartão de Débito</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="funcionarioId" className="block text-sm font-medium text-text-secondary">Funcionário Responsável</label>
                    <select name="funcionarioId" value={formData.funcionarioId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                        <option value="">Nenhum</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                </div>
            </form>
        </Modal>
    );
};

export default TransactionManagementView;