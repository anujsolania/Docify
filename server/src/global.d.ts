declare global {
    namespace NodeJS {
        interface ProcessEnv {
            VERIFICATION_KEY: string;
            // ACCESS_KEY: string;
            // PASSWORD_KEY: string;
        }
    }
}