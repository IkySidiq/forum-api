

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'TEXT',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner_id: {
      type: 'TEXT',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    thread_id: {
      type: 'TEXT',
      notNull: true,
      references: 'threads(id)',
      onDelete: 'CASCADE',
    },
    is_delete: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
    date: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
