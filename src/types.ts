
// 1. User type based on the 'users' table
export interface User {
  id: number;
  openId: string;
  name?: string;
  email: string;
  loginMethod?: string;
  role: 'user' | 'admin' | 'gerente' | 'atendente';
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
}

// 2. Client type based on the 'clientes' table
export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  dataNascimento?: string;
  dataRegistro: string;
  observacoes?: string;
}

// 3. Employee type based on the 'funcionarios' table
export interface Funcionario {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  cpfCnpj?: string;
  especialidades?: string;
  comissaoPercentual: number;
  bancoNome?: string;
  agencia?: string;
  contaBancaria?: string;
  tipoConta?: 'corrente' | 'poupanca';
  ativo: boolean;
}

// 4. Service type based on the 'servicos' table
export interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  preco: number; // Stored as INT in DB (cents)
  duracaoMinutos: number;
  ativo: boolean;
}

// 5. Product type based on the 'produtos' table
export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number; // Stored as INT in DB (cents)
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
}

// 6. Gemini AI Insight Types for client segmentation
export interface ClientSegment {
  segmentName: string;
  description: string;
  clientNames: string[];
  marketingSuggestion: string;
}

export interface GeminiInsightsResponse {
  segments: ClientSegment[];
}

// 7. Appointment type based on 'agendamentos' table
export interface Agendamento {
  id: number;
  clienteId: number;
  funcionarioId: number;
  servicoId: number;
  dataHora: string;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado';
  observacoes?: string;
}

// 8. Transaction type based on 'transacoes' table
export interface Transacao {
  id: number;
  tipo: 'servico' | 'produto' | 'pacote';
  clienteId: number;
  funcionarioId?: number;
  agendamentoId?: number;
  valor: number; // Stored as INT (cents)
  comissaoFuncionario: number; // Stored as INT (cents)
  metodoPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'outro';
  descricao?: string;
  dataTransacao: string;
}

// 9. Package type based on 'pacotes' table
export interface Pacote {
  id: number;
  nome: string;
  descricao?: string;
  preco: number; // Stored as INT in DB (cents)
  precoOriginal: number; // Stored as INT in DB (cents)
  servicosInclusos: string; // Comma-separated list of service names
  validade: number; // in days
  ativo: boolean;
}
