import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from 'typeorm';
import { Sesion } from './Sesion';

@Entity('costes_por_proveedor')
export class CostePorProveedor {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  sesionId: string;

  @Column({ type: 'enum', enum: ['claude', 'openai'] })
  proveedor: 'claude' | 'openai';

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  costeTotalUSD: number;

  @Column()
  tokensEntrada: number;

  @Column()
  tokensSalida: number;

  @CreateDateColumn()
  criadoEn: Date;

  @ManyToOne(() => Sesion, sesion => sesion.costes)
  @JoinColumn({ name: 'sesionId' })
  sesion: Sesion;
}
