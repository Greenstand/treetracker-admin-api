const express = require("express");
const router = express.Router();

router.post("/login", async function login(req, res, next){
  res.send("OK");
});

router.get("/test", async function login(req, res, next){
  res.send("OK");
});

exports.auth = {
  router,
}
