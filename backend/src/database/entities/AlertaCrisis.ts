import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from 'typeorm';
import { Usuario } from './Usuario';
import { Sesion } from './Sesion';

@Entity('alertas_crisis')
export class AlertaCrisis {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  sesionId: string;

  @Column('uuid')
  usuarioId: string;

  @Column({
    type: 'enum',
    enum: ['bajo', 'medio', 'alto', 'critico']
  })
  nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';

  @Column('text')
  indicador: string;

  @Column({ nullable: true, type: 'text' })
  notas?: string;

  @CreateDateColumn()
  detectadoEn: Date;

  @Column({ nullable: true })
  resueltoEn?: Date;

  @ManyToOne(() => Usuario, usuario => usuario.alertas)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @ManyToOne(() => Sesion, sesion => sesion.alertas)
  @JoinColumn({ name: 'sesionId' })
  sesion: Sesion;
}
