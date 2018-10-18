import {Request, Response} from 'express'
import {ImageStats}  from '../utils/imageResizeStats';

export class ImageResizeStats{
    /**
     * route for getting the image resize stats
        @param app express app
     */
    public route(app):void {
        app.route('/').get((req:Request, res: Response) => {
            ImageStats.getStats().then((stats) => {
                res.render('stats',JSON.parse(stats));
            }).catch((err) => { console.error(err); });
        })

        app.route('/stats').get((req:Request, res: Response) => {
            ImageStats.getStats().then((stats) => {
                res.json(JSON.parse(stats));
            }).catch((err) => { console.error(err);});
        })
    }
}