import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  JoinColumn
} from 'typeorm';
import { Mensaje } from './Mensaje';

@Entity('incrustaciones')
export class Incrustacion {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  mensajeId: string;

  @Column({ type: 'vector', length: 1536 })
  vector: number[];

  @Column({ length: 50 })
  modelo: string;

  @CreateDateColumn()
  criadaEn: Date;

  @OneToOne(() => Mensaje, mensaje => mensaje.incrustacion)
  @JoinColumn({ name: 'mensajeId' })
  mensaje: Mensaje;
}
