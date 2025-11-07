// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { getProdutos, saveProduto, deleteProduto } from '../../services/api';
import type { Produto } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';

// Utility to format currency from cents to BRL format.
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const ProductManagementView: React.FC = () => {
  const [products, setProducts] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [productToDelete, setProductToDelete] = useState<Produto | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProdutos();
      setProducts(data);
    } catch (error) {
      console.error("Falha ao carregar produtos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleOpenFormModal = (product: Produto | null = null) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedProduct(null);
  };
  
  const handleOpenConfirmModal = (product: Produto) => {
    setProductToDelete(product);
    setIsConfirmModalOpen(true);
  };
  
  const handleCloseConfirmModal = () => {
    setProductToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleSaveProduct = async (productData: Partial<Produto>) => {
    try {
      await saveProduto(productData);
      handleCloseFormModal();
      await loadProducts();
    } catch (error) {
      console.error("Falha ao salvar produto:", error);
    }
  };
  
  const handleDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await deleteProduto(productToDelete.id);
        handleCloseConfirmModal();
        await loadProducts();
      } catch (error) {
        console.error("Falha ao excluir produto:", error);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Gestão de Produtos</h1>
          <p className="text-text-secondary mt-1">Gerencie o catálogo e o estoque de produtos.</p>
        </div>
        <Button onClick={() => handleOpenFormModal()}>Adicionar Produto</Button>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Preço</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Estoque</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-text-secondary">Carregando produtos...</td></tr>
              ) : (
                products.map((product) => {
                  const isLowStock = product.estoque <= product.estoqueMinimo;
                  return (
                    <tr key={product.id} className={`hover:bg-pink-50/30 transition-colors ${isLowStock ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{product.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(product.preco)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${isLowStock ? 'text-red-600' : 'text-text-secondary'}`}>
                        {product.estoque}
                        {isLowStock && <span className="ml-2 text-xs">(Baixo)</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                        <button onClick={() => handleOpenFormModal(product)} className="text-primary hover:text-primary-dark">Editar</button>
                        <button onClick={() => handleOpenConfirmModal(product)} className="text-red-600 hover:text-red-800">Excluir</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormModalOpen && (
        <ProductFormModal
          product={selectedProduct}
          onClose={handleCloseFormModal}
          onSave={handleSaveProduct}
        />
      )}
       {productToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={handleCloseConfirmModal}
            onConfirm={handleDeleteProduct}
            title="Confirmar Exclusão"
            message={`Tem certeza que deseja excluir o produto "${productToDelete.nome}"?`}
        />
      )}
    </div>
  );
};

const ProductFormModal: React.FC<{
  product: Produto | null;
  onClose: () => void;
  onSave: (product: Partial<Produto>) => void;
}> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Produto>>(
    product || { nome: '', descricao: '', preco: 0, estoque: 0, estoqueMinimo: 0, ativo: true }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value, type } = e.target;
     if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
     } else if (name === 'preco') {
        setFormData(prev => ({ ...prev, [name]: Math.round(parseFloat(value) * 100) }));
     } else if (name === 'estoque' || name === 'estoqueMinimo') {
        setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
     } else {
        setFormData(prev => ({...prev, [name]: value}));
     }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={product ? 'Editar Produto' : 'Adicionar Novo Produto'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="ml-2">Salvar</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-text-secondary">Nome do Produto</label>
          <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="preco" className="block text-sm font-medium text-text-secondary">Preço (R$)</label>
                <input type="number" step="0.01" name="preco" id="preco" value={formData.preco !== undefined ? formData.preco / 100 : ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="estoque" className="block text-sm font-medium text-text-secondary">Estoque</label>
                <input type="number" name="estoque" id="estoque" value={formData.estoque} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="estoqueMinimo" className="block text-sm font-medium text-text-secondary">Estoque Mínimo</label>
                <input type="number" name="estoqueMinimo" id="estoqueMinimo" value={formData.estoqueMinimo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
        </div>
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-text-secondary">Descrição</label>
          <textarea name="descricao" id="descricao" value={formData.descricao} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"></textarea>
        </div>
         <div className="flex items-center">
            <input id="ativo" name="ativo" type="checkbox" checked={formData.ativo} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
            <label htmlFor="ativo" className="ml-2 block text-sm text-text-secondary">Produto ativo</label>
        </div>
      </form>
    </Modal>
  )
}

export default ProductManagementView;