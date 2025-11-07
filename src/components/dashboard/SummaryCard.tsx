// @ts-nocheck
import React from 'react';
import Card from '../common/Card';

// 1. Interface de props atualizada para usar 'subtitle'
interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactElement<any>;
  color: string;
  isWarning?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtitle, icon, color, isWarning = false }) => {
  return (
    <Card className="flex flex-col justify-between">
      {/* 2. Seção superior com título e ícone (sem alterações) */}
      <div className="flex justify-between items-start">
        <span className="text-text-secondary font-medium">{title}</span>
        <div className={`p-2 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${color}` })}
        </div>
      </div>
      {/* 3. Seção inferior com o valor principal e o novo subtítulo */}
      <div>
        <h2 className="text-3xl font-bold text-text-primary mt-2">{value}</h2>
        <p className={`text-sm mt-1 ${isWarning ? 'text-red-600 font-semibold' : 'text-text-secondary'}`}>
          {subtitle}
        </p>
      </div>
    </Card>
  );
};

export default SummaryCard;