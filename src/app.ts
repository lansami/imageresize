import express from 'express';
import createError from 'http-errors'
import bodyParser from 'body-parser';
import {AppConfig} from './utils/config'
import {ImageStats} from './utils/ImageResizeStats'
import {ImageResize} from './routes/imageResizeRoute'
import {ImageResizeStats} from './routes/imageResizeStatsRoute'
const morgan = require('morgan');
const path = require('path');

class App{
    public express : express.Application;
    private imageResizeRoute : ImageResize = new ImageResize();
    private imageResizeStatsRoute: ImageResizeStats = new ImageResizeStats();

    constructor () {
        this.express = express();
        this.serverConfig();
        this.mountRoutes();
        this.errorHandler();
    }

    /**
     * Start server configuration
     */
    private serverConfig():void{
        this.express.use(morgan('dev'));
        this.express.use(bodyParser.json());
		this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.set('view engine','ejs');
        this.express.set('views',path.join(__dirname,'/views'));

        // Init the application config
        AppConfig.init().then(() => {
            console.log("Appplication configuration verified");
            return ImageStats.init();
        }).then((imageStatsDone) => {
            console.log('Image stats initialised'+ imageStatsDone);
        }).catch((err) => {
            console.log("Error when checking the application configuration\n"+err);
        });
    }

    /**
     * Mount routes for resizing images and stats
     */
    private mountRoutes () {
        this.imageResizeRoute.route(this.express);
        this.imageResizeStatsRoute.route(this.express);
    }

    /**
     * General error handler
     */
    private errorHandler(): void{
        this.express.use((req,res,next) => {
            next(createError(404));
        })

        this.express.use((err: any, req: any, res:any, next: any) => {
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            res.status(err.status || 500);
            console.log(err);
            res.render('error',{errorStatus:err.status || 500, errorMessage:err.message});
        })
    }
}

export default new App().express;