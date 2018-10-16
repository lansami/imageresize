import fs from 'fs'
import path from 'path'

const config = require('../config.json');

class Config{
    private imagesPath: string;
    private resizedImagesPath: string;
    private resourcesPath: string;

    /**
     * Get the images path
     */
    public getImagesPath(): string{
        return this.imagesPath;
    }
    /**
     * Get the resources path
     */
    public getResourcesPath(): string{
        return this.resourcesPath;
    }
    /**
     * Get the resized images path
     */
    public getResizedImagesPath(): string{
        return this.resizedImagesPath;   
    }

    public init():Promise<void>{
        return new Promise((resolve, reject) => {
            this.setResourcesDirectory().then(()=>{
                   return this.setImagesDirectory();
            }).then(() => {
                    return this.setResizedImagesDirectory();
            }).then(() => {
                console.log('Finished checking the resources');
                resolve();
            }).catch((err)=>{
                console.log("Error when checking the resources \n"+err);
                reject(err);
            });
        })
    }

    /**
     * Checking if the resized images directory exists and if it does not exists then create it
     */
    private setResizedImagesDirectory(): Promise<void>{
        return new Promise((resolve, reject) => {
            this.resizedImagesPath = path.join(this.imagesPath,'resized');
            this.assureDirectoryExists(this.resizedImagesPath).then((exists) => {
                if(exists){
                    console.log("The resized images directory is ok");
                    resolve();
                }else{
                    console.log("The resized images directory is not ok. Could not create the directory");
                    reject();
                }
            }).catch((err) => {
                reject(err);
            })
        })

    }

    /**
     * Checking if the images directory exists and if it does not exists then create it
     */
    private setImagesDirectory(): Promise<void>{
        return new Promise((resolve, reject) => {
            if(process.env.IMAGESPATH){
                this.imagesPath = process.env.IMAGESPATH;
            }else{
                if(config.imagesPath){
                    this.imagesPath = path.join(__dirname, config.imagesPath);
                }else{
                    const imagesPath = path.join(__dirname,'../resources/images');
                    this.imagesPath = imagesPath;
                }
            }
    
            this.assureDirectoryExists(this.imagesPath).then((exists) => {
                if(exists){
                    console.log("The images directory is ok");
                    resolve();
                }else{
                    console.log("The images directory is not ok. Could not create the directory");
                    reject();
                }
            }).catch((err) => {
                reject(err);
            })
        })
    }

    /**
     * Checking if the resources images directory exists and if it does not exists then create it
     */
    private setResourcesDirectory():Promise<boolean>{
        let x = JSON.stringify(config);
        return new Promise((resolve,reject) => {
            if(process.env.RESOURCESPATH){
                this.resourcesPath = process.env.RESOURCESPATH;
            }else{
                if(config.resourcesPath){
                    this.resourcesPath = path.join(__dirname, config.resourcesPath);
                }else{
                    const resourcesPath = path.join(__dirname,'../resources');
                    this.resourcesPath = resourcesPath;
                }
            }
    
            this.assureDirectoryExists(this.resourcesPath).then((exists) => {
                if(exists){
                    console.log("The resources directory is ok");
                    resolve();
                }else{
                    console.log("The resources directory is not ok. Could not create the directory");
                    reject();
                }
            }).catch((err) => {
                reject(err);
            })
        })
    }

    /**
     * Check if the directory exists and if not then it tries to create it
     * @param directoryPath Path of the directory to check
     */
    private assureDirectoryExists(directoryPath: string):Promise<boolean>{
        return new Promise((resolve,reject) => {
            fs.exists(directoryPath, (exists) => {
                if(exists){
                    resolve(true);
                }else{
                    fs.mkdir(directoryPath,(err:NodeJS.ErrnoException) => {
                        if(err){
                            console.log('Error when creating the directory '+directoryPath);
                            console.log(err);
                            reject(false);
                        }
                        resolve(true);
                    });
                }
            })
        })      
    }
}

export let AppConfig = new Config();
