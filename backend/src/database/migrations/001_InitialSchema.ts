import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableColumn } from 'typeorm';

export class InitialSchema001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'usuarios',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true
          }),
          new TableColumn({
            name: 'nombre',
            type: 'varchar'
          }),
          new TableColumn({
            name: 'email',
            type: 'varchar',
            isUnique: true
          }),
          new TableColumn({
            name: 'passwordHash',
            type: 'varchar'
          }),
          new TableColumn({
            name: 'telefonoCoach',
            type: 'varchar',
            isNullable: true
          }),
          new TableColumn({
            name: 'avatar',
            type: 'varchar',
            isNullable: true
          }),
          new TableColumn({
            name: 'idioma',
            type: 'varchar',
            length: '2',
            default: "'es'"
          }),
          new TableColumn({
            name: 'activo',
            type: 'boolean',
            default: true
          }),
          new TableColumn({
            name: 'criadoEn',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          }),
          new TableColumn({
            name: 'actualizadoEn',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          })
        ]
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'sesiones',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true
          }),
          new TableColumn({
            name: 'usuarioId',
            type: 'uuid'
          }),
          new TableColumn({
            name: 'etapaActual',
            type: 'enum',
            enum: ['goal', 'reality', 'options', 'will', 'wrap_up', 'reflection', 'action_plan'],
            default: "'goal'"
          }),
          new TableColumn({
            name: 'objetivo',
            type: 'text',
            isNullable: true
          }),
          new TableColumn({
            name: 'realidad',
            type: 'text',
            isNullable: true
          }),
          new TableColumn({
            name: 'opciones',
            type: 'text',
            isNullable: true
          }),
          new TableColumn({
            name: 'voluntad',
            type: 'text',
            isNullable: true
          }),
          new TableColumn({
            name: 'resumen',
            type: 'text',
            isNullable: true
          }),
          new TableColumn({
            name: 'reflexion',
            type: 'text',
            isNullable: true
          }),
          new TableColumn({
            name: 'planAccion',
            type: 'text',
            isNullable: true
          }),
          new TableColumn({
            name: 'criadaEn',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          }),
          new TableColumn({
            name: 'actualizadaEn',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          }),
          new TableColumn({
            name: 'finalizadaEn',
            type: 'timestamp',
            isNullable: true
          })
        ]
      })
    );

    await queryRunner.createForeignKey(
      'sesiones',
      new TableForeignKey({
        columnNames: ['usuarioId'],
        referencedTableName: 'usuarios',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'mensajes',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true
          }),
          new TableColumn({
            name: 'sesionId',
            type: 'uuid'
          }),
          new TableColumn({
            name: 'rol',
            type: 'enum',
            enum: ['usuario', 'coach']
          }),
          new TableColumn({
            name: 'contenido',
            type: 'text'
          }),
          new TableColumn({
            name: 'etapa',
            type: 'enum',
            enum: ['goal', 'reality', 'options', 'will', 'wrap_up', 'reflection', 'action_plan'],
            isNullable: true
          }),
          new TableColumn({
            name: 'tokensEntrada',
            type: 'integer',
            isNullable: true
          }),
          new TableColumn({
            name: 'tokensSalida',
            type: 'integer',
            isNullable: true
          }),
          new TableColumn({
            name: 'proveedor',
            type: 'varchar',
            length: '20',
            isNullable: true
          }),
          new TableColumn({
            name: 'costo',
            type: 'decimal',
            precision: 10,
            scale: 6,
            isNullable: true
          }),
          new TableColumn({
            name: 'criadoEn',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          })
        ]
      })
    );

    await queryRunner.createForeignKey(
      'mensajes',
      new TableForeignKey({
        columnNames: ['sesionId'],
        referencedTableName: 'sesiones',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'incrustaciones',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true
          }),
          new TableColumn({
            name: 'mensajeId',
            type: 'uuid',
            isUnique: true
          }),
          new TableColumn({
            name: 'vector',
            type: 'vector'
          }),
          new TableColumn({
            name: 'modelo',
            type: 'varchar',
            length: '50'
          }),
          new TableColumn({
            name: 'criadaEn',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          })
        ]
      })
    );

    await queryRunner.createForeignKey(
      'incrustaciones',
      new TableForeignKey({
        columnNames: ['mensajeId'],
        referencedTableName: 'mensajes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'alertas_crisis',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true
          }),
          new TableColumn({
            name: 'sesionId',
            type: 'uuid'
          }),
          new TableColumn({
            name: 'usuarioId',
            type: 'uuid'
          }),
          new TableColumn({
            name: 'nivelRiesgo',
            type: 'enum',
            enum: ['bajo', 'medio', 'alto', 'critico']
          }),
          new TableColumn({
            name: 'indicador',
            type: 'text'
          }),
          new TableColumn({
            name: 'notas',
            type: 'text',
            isNullable: true
          }),
          new TableColumn({
            name: 'detectadoEn',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          }),
          new TableColumn({
            name: 'resueltoEn',
            type: 'timestamp',
            isNullable: true
          })
        ]
      })
    );

    await queryRunner.createForeignKey(
      'alertas_crisis',
      new TableForeignKey({
        columnNames: ['usuarioId'],
        referencedTableName: 'usuarios',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createForeignKey(
      'alertas_crisis',
      new TableForeignKey({
        columnNames: ['sesionId'],
        referencedTableName: 'sesiones',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'costes_por_proveedor',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true
          }),
          new TableColumn({
            name: 'sesionId',
            type: 'uuid'
          }),
          new TableColumn({
            name: 'proveedor',
            type: 'enum',
            enum: ['claude', 'openai']
          }),
          new TableColumn({
            name: 'costeTotalUSD',
            type: 'decimal',
            precision: 12,
            scale: 6
          }),
          new TableColumn({
            name: 'tokensEntrada',
            type: 'integer'
          }),
          new TableColumn({
            name: 'tokensSalida',
            type: 'integer'
          }),
          new TableColumn({
            name: 'criadoEn',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          })
        ]
      })
    );

    await queryRunner.createForeignKey(
      'costes_por_proveedor',
      new TableForeignKey({
        columnNames: ['sesionId'],
        referencedTableName: 'sesiones',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'configuraciones_sistema',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true
          }),
          new TableColumn({
            name: 'clave',
            type: 'varchar',
            isUnique: true
          }),
          new TableColumn({
            name: 'valor',
            type: 'text'
          }),
          new TableColumn({
            name: 'tipoValor',
            type: 'enum',
            enum: ['string', 'number', 'boolean', 'json']
          }),
          new TableColumn({
            name: 'descripcion',
            type: 'text',
            isNullable: true
          }),
          new TableColumn({
            name: 'criadaEn',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          }),
          new TableColumn({
            name: 'actualizadaEn',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          })
        ]
      })
    );

    await queryRunner.createIndex('sesiones', new TableIndex({
      columnNames: ['usuarioId']
    }));

    await queryRunner.createIndex('mensajes', new TableIndex({
      columnNames: ['sesionId']
    }));

    await queryRunner.createIndex('alertas_crisis', new TableIndex({
      columnNames: ['usuarioId']
    }));

    await queryRunner.createIndex('alertas_crisis', new TableIndex({
      columnNames: ['nivelRiesgo']
    }));

    await queryRunner.createIndex('costes_por_proveedor', new TableIndex({
      columnNames: ['sesionId']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('configuraciones_sistema');
    await queryRunner.dropTable('costes_por_proveedor');
    await queryRunner.dropTable('alertas_crisis');
    await queryRunner.dropTable('incrustaciones');
    await queryRunner.dropTable('mensajes');
    await queryRunner.dropTable('sesiones');
    await queryRunner.dropTable('usuarios');
  }
}
