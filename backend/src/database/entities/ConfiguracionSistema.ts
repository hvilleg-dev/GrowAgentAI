import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique
} from 'typeorm';

@Entity('configuraciones_sistema')
@Unique(['clave'])
export class ConfiguracionSistema {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  clave: string;

  @Column('text')
  valor: string;

  @Column({
    type: 'enum',
    enum: ['string', 'number', 'boolean', 'json']
  })
  tipoValor: 'string' | 'number' | 'boolean' | 'json';

  @Column({ nullable: true, type: 'text' })
  descripcion?: string;

  @CreateDateColumn()
  criadaEn: Date;

  @UpdateDateColumn()
  actualizadaEn: Date;
}
