// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getTransacoes, getClientes, getFuncionarios, getServicos, getAgendamentos, getProdutos } from '../../services/api';
import type { Transacao, Cliente, Funcionario, Servico, Agendamento, Produto } from '../../types';
import Card from '../common/Card';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
const getStartOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
const getToday = () => new Date().toISOString().split('T')[0];

const ReportsView: React.FC = () => {
    const [transactions, setTransactions] = useState<Transacao[]>([]);
    const [appointments, setAppointments] = useState<Agendamento[]>([]);
    const [clients, setClients] = useState<Cliente[]>([]);
    const [employees, setEmployees] = useState<Funcionario[]>([]);
    const [services, setServices] = useState<Servico[]>([]);
    const [products, setProducts] = useState<Produto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: getStartOfMonth(),
        endDate: getToday(),
        employeeId: 'all',
        clientId: 'all',
        serviceId: 'all',
        productId: 'all',
        paymentMethod: 'all',
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [transData, apptData, clientData, employeeData, serviceData, productData] = await Promise.all([
                getTransacoes(),
                getAgendamentos(),
                getClientes(),
                getFuncionarios(),
                getServicos(),
                getProdutos(),
            ]);
            setTransactions(transData);
            setAppointments(apptData);
            setClients(clientData);
            setEmployees(employeeData);
            setServices(serviceData);
            setProducts(productData);
        } catch (error) {
            console.error("Falha ao carregar dados para relatórios:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const reportData = useMemo(() => {
        if (isLoading) return null;

        const filteredTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.dataTransacao);
            const start = filters.startDate ? new Date(filters.startDate + 'T00:00:00Z') : null;
            const end = filters.endDate ? new Date(filters.endDate + 'T23:59:59Z') : null;
            
            if (start && transactionDate < start) return false;
            if (end && transactionDate > end) return false;
            if (filters.employeeId !== 'all' && t.funcionarioId !== parseInt(filters.employeeId)) return false;
            if (filters.clientId !== 'all' && t.clienteId !== parseInt(filters.clientId)) return false;
            if (filters.paymentMethod !== 'all' && t.metodoPagamento !== filters.paymentMethod) return false;
            
            if (filters.serviceId !== 'all') {
                 const service = services.find(s => s.id === parseInt(filters.serviceId));
                 if (t.tipo !== 'servico' || !service || t.descricao !== service.nome) return false;
            }
            if (filters.productId !== 'all') {
                const product = products.find(p => p.id === parseInt(filters.productId));
                if (t.tipo !== 'produto' || !product || t.descricao !== product.nome) return false;
            }

            return true;
        });

        const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.valor, 0);
        const totalTransactions = filteredTransactions.length;
        const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        const employeePerformance = employees.map(emp => {
            const empRevenue = filteredTransactions
                .filter(t => t.funcionarioId === emp.id)
                .reduce((sum, t) => sum + t.valor, 0);
             const empAppointments = appointments.filter(a => {
                const apptDate = new Date(a.dataHora);
                const start = filters.startDate ? new Date(filters.startDate + 'T00:00:00Z') : null;
                const end = filters.endDate ? new Date(filters.endDate + 'T23:59:59Z') : null;
                if (start && apptDate < start) return false;
                if (end && apptDate > end) return false;
                return a.funcionarioId === emp.id && a.status === 'concluido';
            }).length;
            return { name: emp.nome, appointments: empAppointments, revenue: empRevenue };
        }).sort((a,b) => b.revenue - a.revenue);

        const clientValue = clients.map(client => {
            const clientRevenue = filteredTransactions.filter(t => t.clienteId === client.id).reduce((sum, t) => sum + t.valor, 0);
            return { name: client.nome, revenue: clientRevenue };
        }).sort((a,b) => b.revenue - a.revenue).slice(0, 5);

        const servicePopularity = services.map(service => {
             const serviceRevenue = filteredTransactions.filter(t => t.descricao === service.nome && t.tipo === 'servico').reduce((sum, t) => sum + t.valor, 0);
             const serviceCount = filteredTransactions.filter(t => t.descricao === service.nome && t.tipo === 'servico').length;
            return { name: service.nome, count: serviceCount, revenue: serviceRevenue };
        }).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
        
        const productPopularity = products.map(product => {
             const productRevenue = filteredTransactions.filter(t => t.descricao === product.nome && t.tipo === 'produto').reduce((sum, t) => sum + t.valor, 0);
             const productCount = filteredTransactions.filter(t => t.descricao === product.nome && t.tipo === 'produto').length;
            return { name: product.nome, count: productCount, revenue: productRevenue };
        }).sort((a,b) => b.revenue - a.revenue).slice(0, 5);

        return { totalRevenue, totalTransactions, averageTicket, employeePerformance, clientValue, servicePopularity, productPopularity };
    }, [isLoading, transactions, appointments, clients, employees, services, products, filters]);

    if (isLoading) {
        return <div className="text-center p-8">Carregando relatórios...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-secondary">Relatórios</h1>
                <p className="text-text-secondary mt-1">Análise de performance e insights do negócio.</p>
            </div>
            
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="startDate" className="text-sm font-medium text-text-secondary">Data Início</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="text-sm font-medium text-text-secondary">Data Fim</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="employeeId" className="text-sm font-medium text-text-secondary">Funcionário</label>
                        <select name="employeeId" id="employeeId" value={filters.employeeId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                            <option value="all">Todos</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="paymentMethod" className="text-sm font-medium text-text-secondary">Pagamento</label>
                        <select name="paymentMethod" id="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                            <option value="all">Todos</option>
                            <option value="pix">PIX</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao_credito">Cartão de Crédito</option>
                            <option value="cartao_debito">Cartão de Débito</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="clientId" className="text-sm font-medium text-text-secondary">Cliente</label>
                        <select name="clientId" id="clientId" value={filters.clientId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                            <option value="all">Todos</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="serviceId" className="text-sm font-medium text-text-secondary">Serviço</label>
                        <select name="serviceId" id="serviceId" value={filters.serviceId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                            <option value="all">Todos</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="productId" className="text-sm font-medium text-text-secondary">Produto</label>
                        <select name="productId" id="productId" value={filters.productId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                            <option value="all">Todos</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-text-secondary font-medium">Receita no Período</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(reportData?.totalRevenue || 0)}</p>
                </Card>
                <Card>
                    <h3 className="text-text-secondary font-medium">Transações no Período</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{reportData?.totalTransactions}</p>
                </Card>
                <Card>
                    <h3 className="text-text-secondary font-medium">Ticket Médio</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(reportData?.averageTicket || 0)}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold text-secondary mb-4">Produtividade por Funcionário</h3>
                    <ul className="space-y-3">
                        {reportData?.employeePerformance.filter(e => e.revenue > 0).map(emp => (
                            <li key={emp.name} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                                <span className="font-medium text-text-primary">{emp.name}</span>
                                <div className="text-right">
                                    <span className="font-semibold text-primary">{formatCurrency(emp.revenue)}</span>
                                    <span className="text-sm text-text-secondary ml-2">({emp.appointments} atend.)</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card>
                    <h3 className="text-xl font-bold text-secondary mb-4">Serviços Mais Rentáveis</h3>
                    <ul className="space-y-3">
                        {reportData?.servicePopularity.filter(s => s.revenue > 0).map(serv => (
                            <li key={serv.name} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                                <span className="font-medium text-text-primary">{serv.name}</span>
                                 <div className="text-right">
                                    <span className="font-semibold text-primary">{formatCurrency(serv.revenue)}</span>
                                    <span className="text-sm text-text-secondary ml-2">({serv.count} vendas)</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
                
                <Card>
                    <h3 className="text-xl font-bold text-secondary mb-4">Produtos Mais Vendidos</h3>
                    <ul className="space-y-3">
                        {reportData?.productPopularity.filter(p => p.revenue > 0).map(prod => (
                            <li key={prod.name} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                                <span className="font-medium text-text-primary">{prod.name}</span>
                                 <div className="text-right">
                                    <span className="font-semibold text-primary">{formatCurrency(prod.revenue)}</span>
                                    <span className="text-sm text-text-secondary ml-2">({prod.count} un.)</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card>
                    <h3 className="text-xl font-bold text-secondary mb-4">Top 5 Clientes (por valor gasto)</h3>
                    <ul className="space-y-3">
                        {reportData?.clientValue.filter(c => c.revenue > 0).map(client => (
                            <li key={client.name} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                                <span className="font-medium text-text-primary">{client.name}</span>
                                <span className="font-semibold text-primary">{formatCurrency(client.revenue)}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default ReportsView;