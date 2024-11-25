const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const { User, Notifications, Tienda, Compra } = require("./src/DB_config");

const router = require("./src/routes/routes");
const matchsSockets = require("./src/controllers/payController");

const admin = require("firebase-admin");
/* const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://accounts.google.com/o/oauth2/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.CERT_URL
}; */

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

matchsSockets.setSocketIO(io);

io.on("connection", (socket) => {
  console.log("Un cliente se ha conectado");
  socket.on("assignSocketId", async (userId) => {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        user.socketId = socket.id;
        user.save();
        console.log(`Socket.id ${socket.id} asignado a User ${userId}`);
      }
    } catch (error) {
      console.error("Error al asignar Socket.id al usuario:", error);
    }
  });

  //____________________________________________________________________________________________________________

  socket.on("mensajeGeneral", async (data) => {
    const { titulo, texto, image, ciudad } = data;

    const users = await User.findAll();

    const filteredUsers = users.filter(user => user.ciudad === ciudad)

    filteredUsers.forEach(async (user) => {
      if (user.FCMtoken) {
        const message = {
          data: {
            title: titulo,
            text: texto,
            image: image ? image : ""
          },
          token: user.FCMtoken,
        };
    
        admin
          .messaging()
          .send(message)
          .then((response) => {
            console.log(`Successfully sent message to ${user.username}:`, response);
          })
          .catch((error) => {
            console.log(`Error sending message to ${user.username}:`, error);
          });
      }
      try {
        const existingNotification = await Notifications.findOne({
          where: {
            content: texto,
            userId: user.id,
          },
        });
  
        if (!existingNotification) {
          await Notifications.create({
            content: `Tiendas Locales: ${titulo} - ${texto}`,
            userId: user.id,
            image: image ? image : "https://firebasestorage.googleapis.com/v0/b/tiendaslocales-7bbf8.appspot.com/o/logo.png?alt=media&token=bca80e33-79d3-4b7e-8e50-e7cb026a2a58",
            type: "aviso"
          });
  
          console.log("Notificación almacenada en la base de datos");
        } else {
          existingNotification.read = false;
          await existingNotification.save();
  
          console.log(
            "Notificación ya existe en la base de datos, propiedad 'read' actualizada a true"
          );
        }
      } catch (error) {
        console.error(
          "Error al almacenar/comprobar notificación en la base de datos:",
          error
        );
      }
      const userSocket = user.socketId;
      io.to(userSocket).emit("mensajeGeneral");
    });
  });

  //____________________________________________________________________________________________________________

  socket.on("productoEnviado", async (data) => {
    const { itemId, comprador, userStore } = data;

    const item = await Compra.findByPk(itemId);
    const text = `Su compra de ${item.quantity} ${item.title} ya ha sido confirmada por ${userStore.nombre}`

    if (comprador.FCMtoken) {
      const message = {
        data: {
          title: `${comprador.username}`,
          text: text,
          image: item.productImage,
        },
        token: comprador.FCMtoken,
      };

      admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
    }

    try {
      const existingNotification = await Notifications.findOne({
        where: {
          content: text,
          userId: comprador.id,
        },
      });

      if (!existingNotification) {
        await Notifications.create({
          content: text,
          userId: comprador.id,
          image: item.productImage,
          type: "envio"
        });

        console.log("Notificación almacenada en la base de datos");
      } else {
        existingNotification.read = false;
        await existingNotification.save();

        console.log(
          "Notificación ya existe en la base de datos, propiedad 'read' actualizada a true"
        );
      }
    } catch (error) {
      console.error(
        "Error al almacenar/comprobar notificación en la base de datos:",
        error
      );
    }

    const userSocket = comprador.socketId;
    io.to(userSocket).emit("productoEnviado");
    console.log(`socket productoEnviado emitido al front a ${comprador.username}`);
  });

  //____________________________________________________________________________________________________________

  socket.on("waitingStore", async (data) => {
    const { storeData, userData } = data;
    const { nombre, image, userId } = storeData;

    if (userData?.FCMtoken) {
      const message = {
        data: {
          title: `${userData?.username}`,
          text: `Su tienda "${nombre}" se encuentra en espera de aprobación`,
          image: image,
        },
        token: userData?.FCMtoken,
      };

      admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
    }

    const waiterText = `Su tienda "${nombre}" se encuentra en espera de aprobación`;
    try {
      await Notifications.create({
        content: waiterText,
        userId: userId,
        image: image,
      });
      console.log("Notificación almacenada en la base de datos");
    } catch (error) {
      console.error(
        "Error al almacenar notificación en la base de datos:",
        error
      );
    }
    const user = await User.findByPk(userId);
    const userSocket = user.socketId;
    const userdata = { nombre: nombre, image: image };
    io.to(userSocket).emit("waitingStore", userdata);
  });

  //____________________________________________________________________________________________________________

  socket.on("approvedStore", async (data) => {
    const { storeData, userData } = data;
    const { nombre, image, userId } = storeData;

    const usertoken = await User.findByPk(userId);

    if (usertoken?.FCMtoken) {
      const message = {
        data: {
          title: `${usertoken?.username}`,
          text: `Su tienda "${nombre}" fue aprobada!`,
          image: image,
        },
        token: usertoken?.FCMtoken,
      };

      admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
    }

    const approvedText = `Su tienda "${nombre}" fue aprobada!`;
    try {
      
      await Notifications.create({
        content: approvedText,
        userId: userId,
        image: image,
        type: "store"
      });
      console.log("Notificación almacenada en la base de datos");
    } catch (error) {
      console.error(
        "Error al almacenar notificación en la base de datos:",
        error
      );
    }
    const user = await User.findByPk(userId);
    const userSocket = user.socketId;
    const userdata = { nombre: nombre, image: image };
    io.to(userSocket).emit("approvedStore", userdata);
  });

  //____________________________________________________________________________________________________________

  socket.on("newMessage", async (messageData) => {
    const { people, lastMessage, sender, senderId } = messageData;
    const addressee = people?.find(
      (people) => people.person.username !== sender
    );

    try {
      // busca el destinatario entre los usuarios
      const user = await User.findOne({
        where: {
          username: addressee.person.username,
        },
      });
      // Si el destinatario no es un usuario, lo busca entre las tiendas
      if (!user) {
        const store = await Tienda.findOne({
          where: {
            nombre: addressee.person.username,
          },
        });

        // Si es una tienda guarda la noti en la DB y manda el evento
        const userId = store.userId;
        const image = store.image;
        const storeId = store.id;
        let messageNotificationText;
        if (lastMessage.length < 10) {
          messageNotificationText = `Tu tienda ha recibido un nuevo mensaje de ${sender}: "${lastMessage}"`;
        } else {
          messageNotificationText = `Tu tienda ha recibido un nuevo mensaje de ${sender}`;
        }
        const existingNotification = await Notifications.findOne({
          where: {
            content: messageNotificationText,
            userId: userId,
          },
        });
  
        if (!existingNotification) {
        await Notifications.create({
          content: messageNotificationText,
          userId: userId,
          image: image,
          type: "storeMessage"
        });
      } else {
        existingNotification.read = false;
        await existingNotification.save();
      }
        const user = await User.findByPk(userId);
        const userSocket = user.socketId;

        if (user.FCMtoken) {
          const message = {
            data: {
              title: store.nombre,
              text: messageNotificationText,
            },
            token: user.FCMtoken,
          };

          admin
            .messaging()
            .send(message)
            .then((response) => {
              console.log("Successfully sent message:", response);
            })
            .catch((error) => {
              console.log("Error sending message:", error);
            });
        }

        const data = {
          storeId: storeId,
          image: image,
          lastMessage: lastMessage,
          sender: sender,
        };
        io.to(userSocket).emit("newMessage", data);
      }
      // si es un usuario guarda la noti en la DB y manda el evento
      const userId = user?.id;
      const image = user?.image;
      if (user) {
        let messageNotificationText;
        if (lastMessage.length < 10) {
          messageNotificationText = `Has recibido un nuevo mensaje de ${sender}: "${lastMessage}"`;
        } else {
          messageNotificationText = `Has recibido un nuevo mensaje de ${sender}`;
        }
        const existingNotification = await Notifications.findOne({
          where: {
            content: messageNotificationText,
            userId: userId,
          },
        });
  
        if (!existingNotification) {
        await Notifications.create({
          content: messageNotificationText,
          userId: userId,
          image: image,
          type: "userMessage"
        });
      } else {
        existingNotification.read = false;
        await existingNotification.save();
      }

        if (user.FCMtoken) {
          const message = {
            data: {
              title: user.username,
              text: messageNotificationText,
            },
            token: user.FCMtoken,
          };

          admin
            .messaging()
            .send(message)
            .then((response) => {
              console.log("Successfully sent message:", response);
            })
            .catch((error) => {
              console.log("Error sending message:", error);
            });
        }

        const userSocket = user?.socketId;
        const data = {
          nombre: user?.username,
          image: image,
          lastMessage: lastMessage,
          sender: sender,
        };
        io.to(userSocket).emit("newMessage", data);
      }
    } catch (error) {
      throw error;
    }
  });

  //______________________________________________________________________________________________________________-

  socket.on("calificacionDada", async (data) => {
    const { userId, reviewedUserId, rating } = data;

    const reviewedUser = await User.findByPk(reviewedUserId);
    const user = await User.findByPk(userId);
    
    const reviewNotificationText = `¡${user?.username} te ha calificado con ${rating} estrellas!`
    try {

      const existingNotification = await Notifications.findOne({
        where: {
          content: reviewNotificationText,
          userId: reviewedUserId,
        },
      });

      if (!existingNotification) {
      await Notifications.create({
        content: reviewNotificationText,
        userId: reviewedUserId,
        image: user?.image,
        type: "review"
      });
      console.log("Notificación almacenada en la base de datos");
    }else {
      existingNotification.read = false;
      await existingNotification.save();
    }

    if (reviewedUser.FCMtoken) {
      const message = {
        data: {
          title: reviewedUser.username,
          text: reviewNotificationText,
        },
        token: reviewedUser.FCMtoken,
      };

      admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
    }

    } catch (error) {
      console.error(
        "Error al almacenar notificación en la base de datos:",
        error
      );
    }

    const userSocket = reviewedUser.socketId;
    io.to(userSocket).emit("waitingStore");
  });

  //____________________________________________________________________________________________________________

  socket.on("compraRealizadaToDB", async (data) => {
    const {comprador, store, cantidad, title, vendedor, post, allData, userData} = data;
    const compraText = `¡Tu compra de ${cantidad} ${title} ha sido notificada a ${store?.nombre}!`
    try {

      const existingNotification = await Notifications.findOne({
        where: {
          content: compraText,
          userId: comprador?.id,
        },
      });

      if (!existingNotification) {
      await Notifications.create({
        content: compraText,
        userId: comprador?.id,
        image: post?.image,
        type: "compra"
      });
      console.log("Notificación almacenada en la base de datos");
    }else {
      existingNotification.read = false;
      await existingNotification.save();
    }
    } catch (error) {
      console.error(
        "Error al almacenar notificación en la base de datos:",
        error
      );
    }
  });

  //____________________________________________________________________________________________________________

  socket.on("ventaRealizadaToDB", async (data) => {
    const {comprador, cantidad, store, vendedor, post, allData, title, compradorName, image} = data;
    try {
      const compraText = `¡${compradorName} te ha comprado ${cantidad} ${title}!`

      const existingNotification = await Notifications.findOne({
        where: {
          content: compraText,
          userId: vendedor?.id,
        },
      });

      if (!existingNotification) {
      await Notifications.create({
        content: compraText,
        userId: vendedor?.id,
        image: image,
        type: "venta"
      });
    }
    else {
      existingNotification.read = false;
      await existingNotification.save();
    }
    } catch (error) {
      console.error(
        "Error al almacenar notificación en la base de datos:",
        error
      );
    }
  });

  //____________________________________________________________________________________________________________

  socket.on("disconnect", () => {
    console.log("Un cliente se ha desconectado");
  });
});

const morgan = require("morgan");
const cors = require("cors");
const mercadopago = require("mercadopago");

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());


app.use(function (req, res, next) {

  const allowedOrigins = [
    "http://localhost:5173",
    "https://www.tiendaslocales.com.ar",
    "https://tiendaslocales-production-9ef2.up.railway.app/",
    "http://69.162.124.224",
    "http://63.143.42.240",
    "http://216.245.221.80",
    "http://208.115.199.16",
    "http://216.144.248.16",
    "http://2607:FF68:107::"
  ]; 
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
  }
  next();
});

app.use(router);

module.exports = httpServer;