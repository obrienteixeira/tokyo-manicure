// @ts-nocheck
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Card from '../common/Card';
import Button from '../common/Button';
import type { ClientSegment, Cliente } from '../../types';
import { getClientes } from '../../services/api'; // Alterado para usar a API real

const InsightsCard: React.FC = () => {
  const [insights, setInsights] = useState<ClientSegment[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    // IMPORTANTE: Insira sua chave da API do Gemini aqui!
    const GEMINI_API_KEY = "SUA_CHAVE_DE_API_DO_GEMINI_AQUI";

    if (GEMINI_API_KEY === "SUA_CHAVE_DE_API_DO_GEMINI_AQUI") {
      setError("Chave de API do Gemini não configurada. Por favor, edite o arquivo InsightsCard.tsx.");
      setIsLoading(false);
      return;
    }

    try {
      const clientes: Cliente[] = await getClientes();
      
      if (clientes.length === 0) {
          setError("Não há clientes cadastrados para gerar insights.");
          setIsLoading(false);
          return;
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const clientData = JSON.stringify(clientes.map(c => ({
        nome: c.nome,
        dataRegistro: c.dataRegistro,
        observacoes: c.observacoes
      })), null, 2);

      const prompt = `
        Você é um analista de marketing para um salão de unhas chamado "Tokyo Nails". 
        Com base nos seguintes dados de clientes, segmente-os em grupos distintos.
        Para cada grupo, forneça um nome, uma breve descrição, liste os nomes dos clientes e sugira uma campanha de marketing direcionada em português.
        O salão tem uma temática japonesa, então tente incorporar isso nas suas sugestões.

        Dados dos Clientes:
        ${clientData}

        Forneça sua resposta no formato JSON especificado, sem nenhuma formatação markdown como \`\`\`json.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              segments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    segmentName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    clientNames: { type: Type.ARRAY, items: { type: Type.STRING } },
                    marketingSuggestion: { type: Type.STRING }
                  },
                  required: ["segmentName", "description", "clientNames", "marketingSuggestion"]
                }
              }
            }
          },
        }
      });
      
      const parsedResponse = JSON.parse(response.text);
      setInsights(parsedResponse.segments);

    } catch (e) {
      console.error("Erro ao gerar insights do Gemini:", e);
      setError("Falha ao gerar insights. Verifique sua chave de API e a conexão com o backend.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-secondary">AI Marketing Insights</h3>
          <p className="text-text-secondary">Segmentação de clientes e sugestões de marketing geradas por IA.</p>
        </div>
        <Button onClick={fetchInsights} isLoading={isLoading} disabled={isLoading}>
          Gerar Novos Insights
        </Button>
      </div>

      {isLoading && <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Analisando dados e gerando insights...</p>
        </div>}
      {error && <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg">{error}</div>}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {insights.map((segment, index) => (
            <div key={index} className="bg-background p-4 rounded-lg border border-gray-200/60">
              <h4 className="font-bold text-primary">{segment.segmentName}</h4>
              <p className="text-sm text-text-secondary mt-1">{segment.description}</p>
              <div className="mt-4">
                <h5 className="font-semibold text-sm text-text-primary">Sugestão de Marketing:</h5>
                <p className="text-sm text-text-secondary mt-1">{segment.marketingSuggestion}</p>
              </div>
              <div className="mt-4">
                <h5 className="font-semibold text-sm text-text-primary">Clientes no Segmento:</h5>
                <p className="text-sm text-text-secondary mt-1">{segment.clientNames.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && !insights && !error && (
         <div className="text-center p-8 text-text-secondary">
          Clique em "Gerar Novos Insights" para começar a análise com os dados do seu salão.
        </div>
      )}
    </Card>
  );
};

export default InsightsCard;