import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../src/app'
import fs from 'fs'
import path from 'path'

import {AppConfig} from '../src//utils/config'

chai.use(chaiHttp);

describe('Image resize stats', function(){
    it('should return a json with the stats',() => {
        return chai.request(app).get('/stats').then((res) => {
            chai.expect(typeof(res.body)).to.equal(typeof(JSON), "response from server was not a json object. Received: "+typeof(res.body));
            fs.readFile(path.join(AppConfig.getResourcesPath(),'imageResizedStats.json'),(err: NodeJS.ErrnoException, data: Buffer)=>{
                if(err){console.error('Error when reading the stored imageResizedStats'); throw err;}
                let stats = JSON.parse(data.toString());
                let received = JSON.stringify(res.body);
                chai.expect(received).to.equal(JSON.stringify(stats),'Response from server was not the same json as expected. Received: '+res.body);
            })
        }).catch((err) => {
            console.log(err);
        })
    });

    it('should return the stats page', () => {
		return chai.request(app).get('/')
			.then(res => {
				chai.expect(res.type).to.eql('text/html');
				chai.expect(res.status).to.eql(200);
			});
	});
})