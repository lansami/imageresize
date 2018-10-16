import chai from 'chai'
import chaiHttp from 'chai-http'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import {AppConfig} from '../src//utils/config'
import app from '../src/app'

let image:Buffer;
chai.use(chaiHttp);

describe('Image resizer',() => {
    it('should return the image resized at 300x900',() => {
        let size = '300x900';
        return chai.request(app).get('/image/testimg.jpg?size='+size).then((res) => {
            chai.expect(res.status).to.equal(200);
            chai.expect(res.type).to.equal('image/.jpg');
            chai.expect(typeof(res.body)).to.equal('object','wrong body type response: '+typeof(res.body));
            fs.readFile(path.join(AppConfig.getImagesPath(),'testimg.jpg'),(err: NodeJS.ErrnoException,data: Buffer) => {
                sharp(res.body).metadata().then((imageData) => {
                    let {width, height} = imageData;
                    sharp(image).metadata().then((expectedData) => {
                        chai.expect(width).to.equal(expectedData.width, 'The width from response is different than expected. Received: '+width);
                        chai.expect(height).to.equal(expectedData.height, 'The height from response is different than expected. Received: '+height);
                    }).catch((err) => { throw err;});
                }).catch((err) => {throw err;})
            });
        }).catch((err) => {
            console.log('error in returning the 300x900 image');
            console.log(err);
        })
    })

    it('should return the same image',() => {
        return chai.request(app).get('/image/testimg.jpg').then((res) => {
            chai.expect(res.status).to.equal(200);
            chai.expect(res.type).to.equal('image/.jpg');
            chai.expect(typeof(res.body)).to.equal('object','wrong body type response: '+ typeof(res.body));
            fs.readFile(path.join(AppConfig.getImagesPath(),'testimg.jpg'),(err: NodeJS.ErrnoException,data: Buffer) => {
                sharp(data).metadata().then((imageMetadata) => {
                    const { width, height } = imageMetadata;
                    sharp(res.body).metadata().then(responseImageInfo => {
                        chai.expect(responseImageInfo.width).to.equal(width, `Not the same width returned. It was `+responseImageInfo.width);
                        chai.expect(responseImageInfo.height).to.equal(height, `Not the same height returned. It was `+responseImageInfo.height);
                    }).catch((err) => {throw err;});
                }).catch((err) => {throw err;})
            });
        }).catch((err) =>{
            console.log('error in returning the same image');
            console.log(err);
        })
    })

    it('should return image not found',() => {
        return chai.request(app).get('/image/image_not_found.jpg').then((res) => {
            chai.expect(res.status).to.equal(404);
            chai.expect(res.type).to.equal('text/html');
            chai.expect(res.text).to.contain('Image not found');
        }).catch((err) => {
            console.log('Image not found error: '+err);
        })
    })
});