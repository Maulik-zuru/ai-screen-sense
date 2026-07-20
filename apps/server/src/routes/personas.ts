import { Router, type Router as RouterType } from "express";
import { PERSONAS } from "../personas/registry.js";

export const personasRouter: RouterType = Router();

personasRouter.get("/", (_req, res) => {
  res.json({
    personas: Object.values(PERSONAS).map((p) => ({
      id: p.id,
      name: p.name,
      scope: p.scope,
    })),
  });
});
