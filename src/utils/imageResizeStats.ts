import fs from 'fs';
import path from 'path';
import {AppConfig} from './config';
const dateFormat = require('dateformat');
const _ = require('underscore');

/*
* Class for keeping the stats for the resized image
*/
 class ImageResizeStatsInfo{
    private numberOfOriginalImages: number;
    private numberOfResizedImages: number;
    private numberOfCachedHits: number;
    private numberOfCachedMiss: number;
    private statsPath: string;

    /**
     * Init the resize stats info
     */
    public init() : Promise<boolean>{
        return new Promise((resolve, reject) => {
            this.checkIfStatsSaved().then((done) => {
                return this.syncStats();
            }).then(() => {
                console.log('All data is synced');
            }).catch((err) => {
                console.log('Error when initialising the image resize stats\n'+err);
                reject(err);
            });
        })
    }

    /**
     * Increase the number of resized images
     */
    public addNumberOfResizedImages(): void{
        this.syncStats().then(() => {
            console.log('Increased the number of resized images');
            this.numberOfResizedImages++;
            this.saveStats();
        }).catch((err) => { console.log('Error when increasing the number of resized images\n'+err);})
    }

    /**
     * Increase the number of cached hits
     */
    public addNumberOfCachedHits(): void{
        this.syncStats().then(()=>{
            console.log('Increased the number of cached hits');
            this.numberOfCachedHits++;
            this.saveStats();
        }).catch((err) => { console.log('Error when increasing the number of cached hits \n'+err);})
    }

    /**
     * Increase the number of cache miss
     */
    public addNumberOfCachedMiss(): void{
        this.syncStats().then(() => {
            console.log('Increased the number of cached miss');
            this.numberOfCachedMiss++;
            this.saveStats();
        }).catch((err) => { console.log('Error when increasing the number of cached miss \n'+err);})
    }

    /**
     * Save stats into file
     */
    public saveStats(): Promise<boolean>{
        let stats = {
            numberOfOriginalImages: this.numberOfOriginalImages,
            numberOfResizedImages: this.numberOfResizedImages,
            numberOfCachedHits: this.numberOfCachedHits,
            numberOfCachedMiss: this.numberOfCachedMiss
        };
        return new Promise((resolve, reject) => {
            fs.writeFile(this.statsPath,JSON.stringify(stats),(err: NodeJS.ErrnoException) => {
                if(err){ console.log('Error when saving the stats: \n'+err);
                    reject(err);    
                }
                resolve(true);
                console.log('Finished saving stats');
            })
        })


    }

    /**
     * Get latest stats
     */
    public getStats(): Promise<any>{
        return new Promise((resolve, reject) => {
            this.syncStats().then(()=>{
                resolve({
                    numberOfOriginalImages: this.numberOfOriginalImages,
                    numberOfResizedImages: this.numberOfResizedImages,
                    numberOfCachedHits: this.numberOfCachedHits,
                    numberOfCachedMiss: this.numberOfCachedMiss
                })
            }).catch((err) => { reject(err); })
        })
    }

    /**
     * Check if the stats file exists; if not then creates one
     */
    private checkIfStatsSaved(): Promise<boolean>{
        this.statsPath = path.join(AppConfig.getResourcesPath(),'imageResizedStats.json');        
        return new Promise((resolve,reject) => {
            // Check if the path to the stats exists
            fs.exists(this.statsPath,(exists) => {
                // If exists then read it and store the values; If does not exists then create a new file with the stats
                if(exists){
                    // Read the file that continas the stats and store it's values
                    fs.readFile(this.statsPath,(err: NodeJS.ErrnoException, data:Buffer)=>{
                        if(err){ 
                            console.log("Error when reading the stats file saved: \n"+err);
                            reject(err); 
                        }
                        // Check if data is readable; If not then init a new stats file
                        try{
                            const stats = JSON.parse(data.toString());

                            this.numberOfOriginalImages = stats.numberOfOriginalImages;
                            this.numberOfResizedImages = stats.numberOfResizedImages;
                            this.numberOfCachedHits = stats.numberOfCachedHits;
                            this.numberOfCachedMiss = stats.numberOfCachedMiss;
    
                            resolve(true);
                        }
                        catch(exc){
                            console.log('Initialising stats file');
                            this.initImageResizeStats().then(() => {
                                resolve(true);
                            }).catch((err) => { reject(err); });
                        }
                    });
                }
                else{
                    console.log('Initialising stats file');
                    this.initImageResizeStats().then(() => {
                        resolve(true);
                    }).catch((err) => { reject(err); });
                }
            });
        })
    }

    /**
     * Initialise the file for keeping the image stats
     * @param statsPath Path where all stats should be saved
     */
    private initImageResizeStats(): Promise<void>{
        return new Promise((resolve, reject) => {
            let imageResizedStatsPath = path.join(AppConfig.getResourcesPath(),'imageResizedStats.json');
            // Check if the stats file exists
            fs.exists(imageResizedStatsPath,(exists) => {
                // If it exists then rename the actual one with the date_now time and create a new one with the name imageResizeStats
                if(exists){
                    var dateNow = dateFormat(Date.now(),"yyyymmdd_h_MM_ss");
                    let brokenResizedImagesStatsFile = path.join(AppConfig.getResourcesPath(),'imageResizedStats_'+dateNow+'.json');
                    fs.rename(imageResizedStatsPath, brokenResizedImagesStatsFile,(err:NodeJS.ErrnoException) => {
                        console.log('Renamed the old imageResizeStats to '+ brokenResizedImagesStatsFile);
                        // Create new image resize stats file
                        this.initNewImageResizeStatsFile().then(()=>{
                            resolve();
                        }).catch((err) => { reject(err); });
                    })
                }
                else{
                    // Create new image resize stats file
                    this.initNewImageResizeStatsFile().then(()=>{
                        resolve();
                    }).catch((err) => { reject(err); });
                }
            });
        })
    }

    /**
     * Init new image resize stats file and write the initial values
     */
    private initNewImageResizeStatsFile(): Promise<void>{
        return new Promise((resolve, reject) => {
            // Get the number of original images and resized images
            this.countOriginalImages().then((originalImages) => {
                this.numberOfOriginalImages = originalImages;
                // Get the number of resized images
                return this.countResizedImages();
            }).then((resizedImages) => {
                this.numberOfResizedImages = resizedImages;
                // Write stats into the file
                let stats = {
                    numberOfOriginalImages: this.numberOfOriginalImages,
                    numberOfResizedImages: this.numberOfResizedImages,
                    numberOfCachedHits: 0,
                    numberOfCachedMiss: 0
                }
                let output = JSON.stringify(stats);
                fs.writeFile(this.statsPath, output, (err: NodeJS.ErrnoException) => {
                    if(err){
                        console.log('Error when wrinting the stats file saved: \n'+err);
                        reject(err);
                    }
                    console.log('Initialised the image resize stats file!\nStats path: '+this.statsPath);
                    resolve();
                })
            }).catch((err)=>{reject(err);})  
        })        
    }

    /**
     * Count the number of resized images
     */
    private countResizedImages(): Promise<number>{
        return new Promise((resolve, reject) => {
            // Read the resized images directory and return the number of resized images
            fs.readdir(AppConfig.getResizedImagesPath(),(err: NodeJS.ErrnoException, files: string[]) => {
                if(err){console.error("Could not read the resized images directory"); reject(err);}
                if(files){
                    resolve(files.length);
                }else{
                    resolve(0);
                }
            })

        })
    }

    /**
     * Count the number of orignal images
     */
    private countOriginalImages():Promise<number>{
        return new Promise((resolve, reject) => {
            // Read the images directory and return the number of the images in the folder
            fs.readdir(AppConfig.getImagesPath(),(err: NodeJS.ErrnoException, files: string[]) => {
                if(err){console.error("Could not read the images directory"); reject(err);}
                if(files){
                    resolve(_.without(files,'resized').length);
                }else{
                    resolve(0);
                }
            });
        })
    }

    /**
     * Sync stats with the saved one
     */
    private syncStats(): Promise<void>{
        return new Promise((resolve, reject) => {
            this.statsPath = path.join(AppConfig.getResourcesPath(),'imageResizedStats.json');
            // Read the stats file
            fs.readFile(this.statsPath,(err:NodeJS.ErrnoException,data:Buffer) => {
                if(err){ console.log('Error when reading the image resized stats\n'+err); reject(err); }
                let stats = JSON.parse(data.toString());
                this.numberOfCachedHits = stats.numberOfCachedHits;
                this.numberOfCachedMiss = stats.numberOfCachedMiss;
                // Count the original images and check if the number is the same as the saved one
                this.countOriginalImages().then((originalImages) => {
                    this.numberOfOriginalImages = originalImages;
                    // If the number of original images is changed then save the value
                    if(originalImages != stats.numberOfOriginalImages){
                        console.log('Number of original images has changed');
                        this.saveStats();
                    }
                    // Count the resized images and check if the number is the same as the saved one
                    return this.countResizedImages();
                }).then((resizedImages) => {
                    this.numberOfResizedImages = resizedImages;
                    // If the number of resizd images is changed then save the value
                    if(resizedImages != stats.numberOfResizedImages){
                        console.log('Number of resized images has changed');
                        this.saveStats();
                    }

                    resolve();
                }).catch((err) => {reject(err);})               
            });
        })
    }
}

export let ImageStats =  new ImageResizeStatsInfo()