import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { Usuario } from './Usuario';

@Entity('goals')
export class Goal {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  usuarioId: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  goal: string;

  @Column({ type: 'text' })
  reality: string;

  @Column({ type: 'simple-array' })
  options: string[];

  @Column({ type: 'text' })
  will: string;

  @Column({ type: 'varchar', default: 'not_started' })
  status: 'not_started' | 'in_progress' | 'completed';

  @CreateDateColumn()
  criadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @ManyToOne(() => Usuario, usuario => usuario.goals)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;
}
