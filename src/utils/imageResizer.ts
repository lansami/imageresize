import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import {AppConfig} from './config';
import {ImageStats} from './imageresizeStats';

class ImageResizer{
    private height:number;
    private width: number;

    public imageResize(imageName: string, size: string,keepAspectRatio: boolean): Promise<Buffer>{
        let imageExt = path.extname(imageName);
        this.checkSize(size);
        const withAspectRatio = (keepAspectRatio?'_keeptAspect':'');
        // Set output name of the file to check
        let outputName = path.basename(imageName, imageExt) + '_resizedAt_' + size + withAspectRatio + imageExt;

        return new Promise((resolve,reject) => {
            let outputPath = path.join(AppConfig.getResizedImagesPath(),outputName);
            // Check if the file already exists
            fs.exists(outputPath, (exists) => {
                // If resized image exists then read it from disk
                if(exists){
                    fs.readFile(outputPath,(err:NodeJS.ErrnoException, data:Buffer) => {
                        if(err){
                            console.log('Error when reading the existing image from'+outputPath);
                            reject(err);                            
                        }
                        ImageStats.addNumberOfCachedHits();
                        resolve(data);
                    })
                }
                // If resized image does not exists then read the original image and resize it 
                else{
                    let imagePath = path.join(AppConfig.getImagesPath(),imageName);
                    fs.readFile(imagePath,(err:NodeJS.ErrnoException, data:Buffer)=>{
                        if(err){
                            console.log('Error when reading the original image '+imagePath);
                            reject(err);
                        }
                        const transformer = keepAspectRatio ? sharp(data).resize(this.width, this.height).max() : sharp(data).resize(this.width, this.height);
                        transformer.toBuffer().then((data) => {
                            fs.writeFile(outputPath,data,(err:NodeJS.ErrnoException) => {
                                if(err){ reject(err); }
                                ImageStats.addNumberOfCachedMiss();
                                ImageStats.addNumberOfResizedImages();
                                resolve(data);
                            });
                        }).catch((error) => { reject(error); })
                    })
                }
            })
        })
    }

    private checkSize(size:string):number[]{
        let requestedSize = size.split('x').map(x=>parseInt(x));
        if(this.isNumber(requestedSize[0]) && this.isNumber(requestedSize[1])){
            this.height = requestedSize[0];
            this.width = requestedSize[1];
        }
        else{
            console.log('Input size is not in the right format');
            throw 'Input size is not in the right format';
        }
        return requestedSize;
    }

    private isNumber(n: number): boolean{
        return !isNaN(n) && isFinite(n) && n>0;
    }
}

export let Resizer = new ImageResizer();