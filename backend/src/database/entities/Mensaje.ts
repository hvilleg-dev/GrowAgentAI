import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  JoinColumn
} from 'typeorm';
import { Sesion } from './Sesion';
import { Incrustacion } from './Incrustacion';
import { GROWStage } from '@/types/coaching';

@Entity('mensajes')
export class Mensaje {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  sesionId: string;

  @Column({ type: 'enum', enum: ['usuario', 'coach'] })
  rol: 'usuario' | 'coach';

  @Column('text')
  contenido: string;

  @Column({
    type: 'enum',
    enum: GROWStage,
    nullable: true
  })
  etapa?: GROWStage;

  @Column({ nullable: true })
  tokensEntrada?: number;

  @Column({ nullable: true })
  tokensSalida?: number;

  @Column({ nullable: true, length: 20 })
  proveedor?: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 6 })
  costo?: number;

  @CreateDateColumn()
  criadoEn: Date;

  @ManyToOne(() => Sesion, sesion => sesion.mensajes)
  @JoinColumn({ name: 'sesionId' })
  sesion: Sesion;

  @OneToOne(() => Incrustacion, incrustacion => incrustacion.mensaje, {
    nullable: true,
    cascade: true
  })
  incrustacion?: Incrustacion;
}
