import { Router } from "express";

export interface RoutesHandler {
  getInstance(): Router;
  handleRoutes(): void;
  path(): string;
}
