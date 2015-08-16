export const config = {
    /*
     * production: "production"
     * testing: "testing"
     * development: "development"
     * */
    environment: "development",
    db: {
        /*
         * production: 'localhost'
         * testing: 'localhost'
         * development: '115.29.42.125'
         * */
        host: '115.29.42.125',
        user: 'root',
        password: '123',
        /*
         * production: 'main_db'
         * testing: 'main_db'
         * development: 'main_db'
         * */
        database: 'main_db'
    },
    website: {
        /*
         * production: 80
         * testing: 80
         * development: 10240
         * */
        port: 10240,
        hostname: "0.0.0.0",
        ip: "115.29.42.125"
    }
};