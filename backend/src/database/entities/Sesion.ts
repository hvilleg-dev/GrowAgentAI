import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { Usuario } from './Usuario';
import { Mensaje } from './Mensaje';
import { AlertaCrisis } from './AlertaCrisis';
import { CostePorProveedor } from './CostePorProveedor';
import { GROWStage } from '@/types/coaching';

@Entity('sesiones')
export class Sesion {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  usuarioId: string;

  @Column({ nullable: true, type: 'uuid' })
  goalId?: string;

  @Column({
    type: 'enum',
    enum: GROWStage,
    default: GROWStage.GOAL
  })
  etapaActual: GROWStage;

  @Column({ nullable: true, type: 'text' })
  objetivo?: string;

  @Column({ nullable: true, type: 'text' })
  realidad?: string;

  @Column({ nullable: true, type: 'simple-array' })
  opciones?: string[];

  @Column({ nullable: true, type: 'text' })
  voluntad?: string;

  @Column({ nullable: true, type: 'text' })
  resumen?: string;

  @Column({ nullable: true, type: 'text' })
  reflexion?: string;

  @Column({ nullable: true, type: 'text' })
  planAccion?: string;

  @CreateDateColumn()
  criadaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;

  @Column({ nullable: true })
  finalizadaEn?: Date;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'PAUSED', 'CLOSED'],
    default: 'ACTIVE'
  })
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';

  @Column({ default: () => "NOW() + interval '45 minutes'" })
  expiresAt: Date;

  @Column({ nullable: true })
  pausedAt?: Date;

  @Column({ default: 0 })
  pausedDuration: number;

  @Column({ nullable: true })
  warningShownAt?: Date;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  deviceId?: string;

  @ManyToOne(() => Usuario, usuario => usuario.sesiones)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @OneToMany(() => Mensaje, mensaje => mensaje.sesion)
  mensajes: Mensaje[];

  @OneToMany(() => AlertaCrisis, alerta => alerta.sesion)
  alertas: AlertaCrisis[];

  @OneToMany(() => CostePorProveedor, coste => coste.sesion)
  costes: CostePorProveedor[];
}
