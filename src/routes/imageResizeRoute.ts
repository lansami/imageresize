import fs from 'fs';
import _ from 'underscore';
import path from 'path';
import createError from 'http-errors'

import {Request,Response, NextFunction} from 'express';
import {AppConfig} from '../utils/config';
import {ImageStats} from '../utils/imageResizeStats'
import {Resizer} from '../utils/imageResizer'


/**
 * Route for resizing the image
 */
export class ImageResize {
    public route(app):void {
        // Main rout for resizing the images
        app.route('/image/:imageName').get((req:Request, res:Response,next: NextFunction) => {
            const imageExtension = path.extname(req.params.imageName);
            const resourceType = 'image/'+imageExtension;
            // Check if the the folder images exists
            fs.readdir(AppConfig.getImagesPath(),(err:NodeJS.ErrnoException, files: string[]) => {
                if(err){
                    next(err);
                }                
                // Get the image that 
                let image = _.find(files,(file) => {
                    return file===req.params.imageName
                })
                
                if(image){
                    // If query paramter is set then resize the image to the requested size
                    if(req.query.size){
                        const aspectRatio: boolean = req.query.keep_aspect_ratio === "true";
                        Resizer.imageResize(image, req.query.size, aspectRatio).then((resizedImage) => {
                            res.contentType(resourceType);
                            res.end(resizedImage,'binary')
                        }).catch((err) => {
                            next(err);
                        })
                    } else {
                        // If query paramter is not set then send the original image back
                        let originalImagePath = path.join(AppConfig.getImagesPath(),image);
                        fs.readFile(originalImagePath,(err: NodeJS.ErrnoException, data: Buffer) => {
                            if(err){
                                next(err);
                            }
                            ImageStats.addNumberOfCachedHits();
                            res.type(resourceType);
                            res.end(data,'binary');
                        });
                    }
                }
                else{
                    console.log('Image is not found');
                    ImageStats.addNumberOfCachedMiss();
                    next(createError(404, 'Image not found'));
                }
            })
        })
    }
}