module.exports = {
  up: (queryInterface, Sequelize) => {
    // cria coluna avatar_id na tabela recipients
    return queryInterface.addColumn('recipients', 'avatar_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'files',
        key: 'id',
      }, // FK para tabela model
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('recipients', 'avatar_id');
  },
};
