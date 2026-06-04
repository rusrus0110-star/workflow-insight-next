export const DEMO_USER = {
  name: "Demo Operations Manager",
  email: "demo@workflowinsight.dev",
  password: "Demo123456",
};

export const COOKIE_NAME = "workflow_insight_token";

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;
