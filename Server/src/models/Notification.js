const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notification = sequelize.define("Notification", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(
        "info",
        "success",
        "warning",
        "error",
        "sale",
        "stock",
        "user",
      ),
      defaultValue: "info",
    },

    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "medium",
    },

    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    roleTarget: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    entityType: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Notification;
};
