/**
 * @summary
 * Purpose subcategories mapping for credit requests.
 * Defines valid subcategories for each purpose category.
 *
 * @module constants/creditRequest/purposeSubcategories
 */

import { PurposeCategory } from '@/services/creditRequest';

/**
 * @constant PURPOSE_SUBCATEGORIES
 * @description Mapping of purpose categories to their valid subcategories
 */
export const PURPOSE_SUBCATEGORIES: Record<PurposeCategory, string[]> = {
  [PurposeCategory.CONSUMO]: [
    'Pagamento de dívidas',
    'Despesas pessoais/familiares',
    'Emergência médica',
    'Viagem/Lazer',
    'Eletrodomésticos/Móveis',
  ],
  [PurposeCategory.INVESTIMENTO]: [
    'Negócio próprio',
    'Educação/Cursos',
    'Reforma/Construção',
    'Equipamentos profissionais',
    'Capital de giro',
  ],
  [PurposeCategory.IMOVEL]: [
    'Compra de imóvel residencial',
    'Compra de imóvel comercial',
    'Reforma/Ampliação',
    'Entrada/Sinal',
    'Quitação de financiamento',
  ],
  [PurposeCategory.VEICULO]: [
    'Compra de carro',
    'Compra de moto',
    'Veículo comercial/trabalho',
    'Entrada/Sinal',
    'Quitação de financiamento',
  ],
};
