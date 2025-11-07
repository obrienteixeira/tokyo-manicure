// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, saveUser, deleteUser } from '../../services/api';
import type { User } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';

const UserManagementView: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Falha ao carregar usuários:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleOpenFormModal = (user: User | null = null) => {
        setSelectedUser(user);
        setIsFormModalOpen(true);
    };
    const handleCloseFormModal = () => {
        setSelectedUser(null);
        setIsFormModalOpen(false);
    };

    const handleOpenConfirmModal = (user: User) => {
        setUserToDelete(user);
        setIsConfirmModalOpen(true);
    };
    const handleCloseConfirmModal = () => {
        setUserToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleSaveUser = async (user: Partial<User>) => {
        try {
            await saveUser(user);
            handleCloseFormModal();
            await loadUsers();
        } catch (error) {
            console.error("Falha ao salvar usuário:", error);
        }
    };

    const handleDeleteUser = async () => {
        if (userToDelete) {
            try {
                await deleteUser(userToDelete.id);
                handleCloseConfirmModal();
                await loadUsers();
            } catch (error) {
                console.error("Falha ao excluir usuário:", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Gestão de Usuários</h1>
                    <p className="text-text-secondary mt-1">Gerencie os acessos dos usuários ao sistema.</p>
                </div>
                <Button onClick={() => handleOpenFormModal()}>Adicionar Usuário</Button>
            </div>

            <div className="bg-surface rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Função</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-10 text-text-secondary">Carregando usuários...</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-pink-50/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary capitalize">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => handleOpenFormModal(user)} className="text-primary hover:text-primary-dark">Editar</button>
                                            <button onClick={() => handleOpenConfirmModal(user)} className="text-red-600 hover:text-red-800">Excluir</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormModalOpen && (
                <UserFormModal
                    user={selectedUser}
                    onClose={handleCloseFormModal}
                    onSave={handleSaveUser}
                />
            )}

            {userToDelete && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={handleCloseConfirmModal}
                    onConfirm={handleDeleteUser}
                    title="Confirmar Exclusão"
                    message={`Tem certeza de que deseja excluir o usuário "${userToDelete.name}"? Esta ação não pode ser desfeita.`}
                />
            )}
        </div>
    );
};

const UserFormModal: React.FC<{
    user: User | null;
    onClose: () => void;
    onSave: (user: Partial<User>) => void;
}> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<User>>(
        user || { name: '', email: '', role: 'atendente', ativo: true, openId: `mock|${Date.now()}` }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            title={user ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} className="ml-2">Salvar</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Nome Completo</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="senha" className="block text-sm font-medium text-text-secondary">Senha</label>
                    <input type="password" name="senha" id="senha" placeholder={user ? 'Deixe em branco para não alterar' : ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required={!user} />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-text-secondary">Função</label>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                        <option value="atendente">Atendente</option>
                        <option value="gerente">Gerente</option>
                        <option value="admin">Admin</option>
                        <option value="user">Usuário</option>
                    </select>
                </div>
                <div className="pt-2">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="ativo" name="ativo" type="checkbox" checked={formData.ativo} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="ativo" className="font-medium text-text-secondary">Usuário Ativo</label>
                            <p className="text-xs text-gray-500">Usuários inativos não podem fazer login.</p>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default UserManagementView;