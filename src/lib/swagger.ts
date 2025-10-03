import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.js";

export const setupSwagger = (app: any) => {
  // Swagger JSON endpoint
  app.get("/api-docs.json", (req: any, res: any) => {
    res.setHeader("Content-Type", "application/json");
    res.send(openApiDocument);
  });

  // Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "RBAC System API Documentation",
    })
  );

  console.log(
    `📚 Swagger documentation available at http://localhost:${
      process.env.PORT || 4000
    }/api-docs`
  );
};
