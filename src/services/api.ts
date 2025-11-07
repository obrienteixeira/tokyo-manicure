// @ts-nocheck
import type { Cliente, Funcionario, Servico, Produto, Agendamento, Transacao, Pacote, User } from '../types';

// URL base da nossa API Flask. Garanta que seu backend esteja rodando neste endereço.
const API_URL = 'http://127.0.0.1:5000/api';

// Função de utilidade para tratar erros de requisição
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido no servidor' }));
    throw new Error(errorData.message || `Erro na requisição: ${response.statusText}`);
  }
  // Retorna um objeto vazio se o status for 200 (OK) mas não houver conteúdo (ex: em um DELETE)
  if (response.status === 204) {
      return {};
  }
  return response.json();
};

// Função genérica para realizar requisições
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Erro de rede ou na API para ${endpoint}:`, error);
    throw error;
  }
};

// --- MÓDULO DE CLIENTES ---
export const getClientes = (): Promise<Cliente[]> => apiRequest('/clientes');
export const saveCliente = (cliente: Partial<Cliente>): Promise<Cliente> => {
  if (cliente.id) {
    return apiRequest(`/clientes/${cliente.id}`, { method: 'PUT', body: JSON.stringify(cliente) });
  }
  return apiRequest('/clientes', { method: 'POST', body: JSON.stringify(cliente) });
};
export const deleteCliente = (id: number): Promise<void> => apiRequest(`/clientes/${id}`, { method: 'DELETE' });

// --- MÓDULO DE FUNCIONÁRIOS ---
export const getFuncionarios = (): Promise<Funcionario[]> => apiRequest('/funcionarios');
export const saveFuncionario = (funcionario: Partial<Funcionario>): Promise<Funcionario> => {
  if (funcionario.id) {
    return apiRequest(`/funcionarios/${funcionario.id}`, { method: 'PUT', body: JSON.stringify(funcionario) });
  }
  return apiRequest('/funcionarios', { method: 'POST', body: JSON.stringify(funcionario) });
};
export const deleteFuncionario = (id: number): Promise<void> => apiRequest(`/funcionarios/${id}`, { method: 'DELETE' });

// --- MÓDULO DE SERVIÇOS ---
export const getServicos = (): Promise<Servico[]> => apiRequest('/servicos');
export const saveServico = (servico: Partial<Servico>): Promise<Servico> => {
  if (servico.id) {
    return apiRequest(`/servicos/${servico.id}`, { method: 'PUT', body: JSON.stringify(servico) });
  }
  return apiRequest('/servicos', { method: 'POST', body: JSON.stringify(servico) });
};
export const deleteServico = (id: number): Promise<void> => apiRequest(`/servicos/${id}`, { method: 'DELETE' });

// --- MÓDULO DE PRODUTOS ---
export const getProdutos = (): Promise<Produto[]> => apiRequest('/produtos');
export const saveProduto = (produto: Partial<Produto>): Promise<Produto> => {
  if (produto.id) {
    return apiRequest(`/produtos/${produto.id}`, { method: 'PUT', body: JSON.stringify(produto) });
  }
  return apiRequest('/produtos', { method: 'POST', body: JSON.stringify(produto) });
};
export const deleteProduto = (id: number): Promise<void> => apiRequest(`/produtos/${id}`, { method: 'DELETE' });

// --- MÓDULO DE AGENDAMENTOS ---
export const getAgendamentos = (): Promise<Agendamento[]> => apiRequest('/agendamentos');
export const saveAgendamento = (agendamento: Partial<Agendamento>): Promise<Agendamento> => {
  if (agendamento.id) {
    return apiRequest(`/agendamentos/${agendamento.id}`, { method: 'PUT', body: JSON.stringify(agendamento) });
  }
  return apiRequest('/agendamentos', { method: 'POST', body: JSON.stringify(agendamento) });
};
export const deleteAgendamento = (id: number): Promise<void> => apiRequest(`/agendamentos/${id}`, { method: 'DELETE' });

// --- MÓDULO DE TRANSAÇÕES ---
export const getTransacoes = (): Promise<Transacao[]> => apiRequest('/transacoes');
export const saveTransacao = (transacao: Partial<Transacao>): Promise<Transacao> => {
    return apiRequest('/transacoes', { method: 'POST', body: JSON.stringify(transacao) });
};
export const deleteTransacao = (id: number): Promise<void> => apiRequest(`/transacoes/${id}`, { method: 'DELETE' });

// --- MÓDULO DE PACOTES ---
export const getPacotes = (): Promise<Pacote[]> => apiRequest('/pacotes');
export const savePacote = (pacote: Partial<Pacote>): Promise<Pacote> => {
  if (pacote.id) {
    return apiRequest(`/pacotes/${pacote.id}`, { method: 'PUT', body: JSON.stringify(pacote) });
  }
  return apiRequest('/pacotes', { method: 'POST', body: JSON.stringify(pacote) });
};
export const deletePacote = (id: number): Promise<void> => apiRequest(`/pacotes/${id}`, { method: 'DELETE' });

// --- MÓDULO DE USUÁRIOS ---
export const getUsers = (): Promise<User[]> => apiRequest('/users');
export const saveUser = (user: Partial<User>): Promise<User> => {
  if (user.id) {
    return apiRequest(`/users/${user.id}`, { method: 'PUT', body: JSON.stringify(user) });
  }
  return apiRequest('/users', { method: 'POST', body: JSON.stringify(user) });
};
export const deleteUser = (id: number): Promise<void> => apiRequest(`/users/${id}`, { method: 'DELETE' });