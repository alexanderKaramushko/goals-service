declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    SERVICE_PORT: string;
    MICROSERVICE_HOST: string;
    MICROSERVICE_PORT: string;
    DATABASE_URL: string;
    POSTGRES_DB_NAME: string;
    POSTGRES_DB_PORT: string;
    POSTGRES_DB_HOST: string;
    POSTGRES_DB_USER: string;
    POSTGRES_DB_PASSWORD: string;
    MOCKS_DIR?: string;
  }
}
