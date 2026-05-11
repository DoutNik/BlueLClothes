const { httpServer } = require("./serverConfig");

const { conn } = require("./src/DB_config");

const PORT = process.env.PORT || 3001;

conn.sync({ alter: true })
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(
        `Server listening on port ${PORT}`
      );
    });
  })
  .catch(console.log);