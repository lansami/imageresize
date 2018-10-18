import fs from 'fs';
import path from 'path';
import {AppConfig} from './config';
import ImageResizeStatsCache from './imageResizeStatsCache'
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
    private cache : ImageResizeStatsCache;

    constructor(){
        //Cache the data for 1 hour
        this.cache = new ImageResizeStatsCache(60*60*1);
    }

    /**
     * Init the resize stats info
     */
    public init() : Promise<boolean>{
        return new Promise((resolve, reject) => {
            //Cache the data for 1 hour
            this.cache = new ImageResizeStatsCache(60*60*1);
        })
    }

    /**
     * Increase the number of resized images
     */
    public async addNumberOfResizedImages(): Promise<void>{
        let cachedStats = await this.getStats();
        let stats = JSON.parse(cachedStats);
        stats.numberOfResizedImages++;
        this.cache.set('stats', JSON.stringify(stats));
    }

    /**
     * Increase the number of cached hits
     */
    public async addNumberOfCachedHits(): Promise<void>{
        let cachedStats = await this.getStats();
        let stats = JSON.parse(cachedStats);
        stats.numberOfCachedHits++;
        this.cache.set('stats', JSON.stringify(stats));
    }

    /**
     * Increase the number of cache miss
     */
    public async addNumberOfCachedMiss(): Promise<void>{
        let cachedStats = await this.getStats();
        let stats = JSON.parse(cachedStats);
        stats.numberOfCachedMiss++;
        this.cache.set('stats',JSON.stringify(stats));
    }

    /**
     * Get latest stats
     */
    public async getStats(): Promise<any>{
        let stats = await this.cache.get('stats');
        return stats;
    }
}

export let ImageStats =  new ImageResizeStatsInfo()