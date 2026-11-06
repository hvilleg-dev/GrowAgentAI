import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Sesion } from './Sesion';
import { AlertaCrisis } from './AlertaCrisis';

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  telefonoCoach?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: 'es', length: 2 })
  idioma: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  criadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @OneToMany(() => Sesion, sesion => sesion.usuario)
  sesiones: Sesion[];

  @OneToMany(() => AlertaCrisis, alerta => alerta.usuario)
  alertas: AlertaCrisis[];
}
