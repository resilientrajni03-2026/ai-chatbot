import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('uploaded_files', {
    id: {
      type: 'varchar(36)',
      primaryKey: true,
    },
    original_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    storage_key: {
      type: 'varchar(500)',
      notNull: true,
      unique: true,
    },
    mime_type: {
      type: 'varchar(150)',
    },
    size_bytes: {
      type: 'bigint',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createTable('chats', {
    id: {
      type: 'varchar(36)',
      primaryKey: true,
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    selected_file_id: {
      type: 'varchar(36)',
      references: 'uploaded_files(id)',
      onDelete: 'SET NULL',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createTable('messages', {
    id: {
      type: 'varchar(36)',
      primaryKey: true,
    },
    chat_id: {
      type: 'varchar(36)',
      notNull: true,
      references: 'chats(id)',
      onDelete: 'CASCADE',
    },
    role: {
      type: 'varchar(20)',
      notNull: true,
    },
    content: {
      type: 'text',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.addConstraint('messages', 'messages_role_check', {
    check: "role IN ('user', 'assistant', 'system')",
  });

  pgm.createIndex('chats', 'updated_at');
  pgm.createIndex('messages', ['chat_id', 'created_at']);
  pgm.createIndex('uploaded_files', 'created_at');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('messages');
  pgm.dropTable('chats');
  pgm.dropTable('uploaded_files');
}
