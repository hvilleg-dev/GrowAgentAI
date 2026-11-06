import { INDICADORES_CRISIS } from '@/constants/coaching';
import { ILLMProvider } from '@/types/providers';
import { CrisisDetectedError } from '@/errors/AppError';
import logger from '@/utils/logger';

export class CrisisDetector {
  private regexPatterns: Map<string, RegExp> = new Map();
  private aiProvider?: ILLMProvider;

  constructor(aiProvider?: ILLMProvider) {
    this.aiProvider = aiProvider;
    this.compileRegexPatterns();
  }

  private compileRegexPatterns(): void {
    const altoCriticoTermos = INDICADORES_CRISIS.CRISIS_ALTO.join('|');
    const medioTermos = INDICADORES_CRISIS.CRISIS_MEDIO.join('|');
    const bajoTermos = INDICADORES_CRISIS.CRISIS_BAJO.join('|');

    this.regexPatterns.set('critico', new RegExp(altoCriticoTermos, 'gi'));
    this.regexPatterns.set('medio', new RegExp(medioTermos, 'gi'));
    this.regexPatterns.set('bajo', new RegExp(bajoTermos, 'gi'));
  }

  async detectCrisis(
    text: string,
    enableAI: boolean = true,
    enableRegex: boolean = true
  ): Promise<{ level: string; indicator: string } | null> {
    let level: string | null = null;
    let indicator = '';

    if (enableRegex) {
      const regexResult = this.detectViaRegex(text);
      if (regexResult) {
        level = regexResult.level;
        indicator = regexResult.indicator;
      }
    }

    if (!level && enableAI && this.aiProvider) {
      try {
        const aiResult = await this.detectViaAI(text);
        if (aiResult && aiResult.nivel !== 'ninguno') {
          level = aiResult.nivel;
          indicator = aiResult.indicador;
        }
      } catch (error) {
        logger.error('AI crisis detection failed:', error);
      }
    }

    if (level && level !== 'ninguno') {
      return { level, indicator };
    }

    return null;
  }

  private detectViaRegex(
    text: string
  ): { level: string; indicator: string } | null {
    if (this.regexPatterns.get('critico')!.test(text)) {
      const match = text.match(this.regexPatterns.get('critico')!);
      return {
        level: 'critico',
        indicator: match ? match[0] : 'Indicador critico detectado'
      };
    }

    if (this.regexPatterns.get('medio')!.test(text)) {
      const match = text.match(this.regexPatterns.get('medio')!);
      return {
        level: 'alto',
        indicator: match ? match[0] : 'Indicador alto detectado'
      };
    }

    if (this.regexPatterns.get('bajo')!.test(text)) {
      const match = text.match(this.regexPatterns.get('bajo')!);
      return {
        level: 'medio',
        indicator: match ? match[0] : 'Indicador medio detectado'
      };
    }

    return null;
  }

  private async detectViaAI(text: string): Promise<{
    nivel: string;
    indicador: string;
    accion: string;
  } | null> {
    if (!this.aiProvider) return null;

    try {
      const prompt = `Analiza el siguiente texto para detectar señales de crisis:
"${text}"

Responde SOLO con un JSON: { "nivel": "alto|medio|bajo|ninguno", "indicador": "descripción breve", "accion": "descripción" }`;

      const response = await this.aiProvider.getCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Failed to parse AI response:', error);
      return null;
    }
  }

  throwIfCrisis(
    result: { level: string; indicator: string } | null,
    manualFlag?: boolean
  ): void {
    if (!result && !manualFlag) return;

    if (manualFlag) {
      throw new CrisisDetectedError('alto', 'Manual flag activated');
    }

    if (result) {
      const map: Record<string, 'bajo' | 'medio' | 'alto' | 'critico'> = {
        'bajo': 'bajo',
        'medio': 'medio',
        'alto': 'alto',
        'critico': 'critico'
      };
      throw new CrisisDetectedError(
        map[result.level] || 'bajo',
        result.indicator
      );
    }
  }
}
