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
         * development: ''
         * */
        host: '',
        user: '',
        password: '',
        /*
         * production: ''
         * testing: ''
         * development: ''
         * */
        database: ''
    },
    website: {
        /*
         * production: 80
         * testing: 80
         * development: 10240
         * */
        port: 10240,
        innerHostName: "0.0.0.0",
        outerHostName: "localhost"
    },
    smtp: {
        host: "",
        name: "",
        password: ""
    },
    redis: {
        host: "",
        port: 6379
    }
};