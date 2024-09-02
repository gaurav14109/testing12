const express = require("express");
const authRoutes = require("./authRoute");
const verticalRoutes = require("./verticalRoute");
const userRoutes = require("./userRoute");
const commonFileRoutes = require("./commonFileUpload");
const requestsRoute = require("./requestsRoute");
const solRoutes = require("./sol_routes");

const router = express.Router();

const allRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/vertical",
    route: verticalRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/commonFile",
    route: commonFileRoutes,
  },
  {
    path: "/requests",
    route: requestsRoute,
  },
  {
    path: "/sol",
    route: solRoutes,
  },
];

allRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
