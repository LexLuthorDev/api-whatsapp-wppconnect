// middlewares/visita.js
const { IpFilter, IpDeniedError } = require("express-ipfilter");
const db = require("../models");
const moment = require("moment");

const visita = async (req, res, next) => {
  try {
    console.log(req.ip);
    //return;
    const today = moment().format("YYYY-MM-DD");
    const existingVisit = await db.Visita.findOne({
      where: {
        ip: req.ip,
        dataVisita: today,
      },
    });

    if (!existingVisit) {
      await db.Visita.create({ ip: req.ip, dataVisita: today });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  visita,
  IpFilter,
  IpDeniedError,
};
