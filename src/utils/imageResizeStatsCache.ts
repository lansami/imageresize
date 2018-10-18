import NodeCache from 'node-cache'
import {AppConfig} from './config'
const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const dateFormat = require('dateformat');

class ImageResizeStatsCache{
    private cache: NodeCache;

    constructor(timeToExpire){
        this.cache = new NodeCache({stdTTL:timeToExpire, checkperiod:timeToExpire * 0.2, useClones:false});
        this.timeout();
    }

    timeout(){
        setTimeout(()=>{
            console.log('Saving stats');
            this.saveStats();
        },60*30*1);
    }

    async get(key){
        let value = this.cache.get(key);
        if(value){
            const originalImages = await this.countOriginalImages();
            const resizedImages = await this.countResizedImages();
            const stats = JSON.parse(value.toString());
            if(originalImages != stats.numberOfOriginalImages || resizedImages != stats.numberOfResizedImages){
                stats.numberOfOriginalImages = originalImages;
                stats.numberOfResizedImages = resizedImages;
                value = JSON.stringify(stats);
                const statsPath = path.join(AppConfig.getResourcesPath(),'imageResizedStats.json');
                fs.writeFileSync(statsPath,value);
            }
            return Promise.resolve(value);
        } else if(key === 'stats'){
            await this.readStatsFile();
            value = this.cache.get(key);
            return Promise.resolve(value);
        }
        Promise.reject('Key not found');
    }

    set(key, value){
        this.cache.set(key,value);
    }

    flush(){
        this.cache.flushAll();
    }

    async saveStats(){
        const statsPath = path.join(AppConfig.getResourcesPath(),'imageResizedStats.json');
        const stats = await this.get('stats');
        fs.writeFileSync(statsPath,stats);
    }

    async readStatsFile(){
        const statsPath = path.join(AppConfig.getResourcesPath(),'imageResizedStats.json');
        const statsExists = fs.existsSync(statsPath);
        if(statsExists){
            const statsFile = fs.readFileSync(statsPath,"utf8");
            try{
                const stats = JSON.parse(statsFile.toString());
                this.set('stats',statsFile);
            }
            catch(err){
                console.error(err);
                await this.initImageResizeStats();
            }
        }else{
            await this.initImageResizeStats();
        }
    }

    async initImageResizeStats(): Promise<void>{
        let imageResizedStatsPath = path.join(AppConfig.getResourcesPath(),'imageResizedStats.json');
        const statsExists = fs.existsSync(imageResizedStatsPath);
        if(statsExists){
            const dateNow = dateFormat(Date.now(),"yyyymmdd_h_MM_ss");
            let brokenResizedImagesStatsFile = path.join(AppConfig.getResourcesPath(),'imageResizedStats_'+dateNow+'.json');
            fs.renameSync(imageResizedStatsPath, brokenResizedImagesStatsFile);
        }
        await this.createNewStatsFile();
    }
    
    async createNewStatsFile():Promise<void>{
        let imageResizedStatsPath = path.join(AppConfig.getResourcesPath(),'imageResizedStats.json');
        const originalImages = await this.countOriginalImages();
        const resizedImages = await this.countResizedImages();
        let stats = {
            numberOfOriginalImages: originalImages,
            numberOfResizedImages: resizedImages,
            numberOfCachedHits: 0,
            numberOfCachedMiss: 0
        }
        this.cache.set('stats',JSON.stringify(stats));
        fs.writeFileSync(imageResizedStatsPath,JSON.stringify(stats));
    }

    async countResizedImages(): Promise<number>{
        const files = fs.readdirSync(AppConfig.getResizedImagesPath());
        if(files){
            return Promise.resolve(files.length);
        }
        else{
            return Promise.resolve(0);
        }
    }

    async countOriginalImages(): Promise<number>{
        const files = fs.readdirSync(AppConfig.getImagesPath());
        if(files){
            return Promise.resolve(_.without(files,'resized').length);
        }else{
            return Promise.resolve(0);
        }
    }
    

}

export default ImageResizeStatsCache;