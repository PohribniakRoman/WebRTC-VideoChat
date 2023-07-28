import express from "express";
import { Server } from "socket.io";
import { ACTIONS } from "../src/socket/actions.js";
import {createServer } from "http";
import { validate, version } from "uuid";

const PORT = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server);


