import { expect } from '@loopback/testlab';
import { TreetrackerDataSource } from '../datasources';
import { SpeciesController } from '../controllers';
import { SpeciesRepository } from '../repositories';
require('dotenv').config();

/*Purpose: Include env. variables in test in order to 
map to env. variables in Github Actions.*/
describe('Species Controller Integration Tests', () => {
    //Configure the database with env. variables. 
    const config = 
    {
        name: process.env.DB_NAME, 
        connector: process.env.DB_CONNECTOR, 
        url: process.env.DB_URL, 
        port: process.env.DB_PORT, 
    };      
    const datasource = new TreetrackerDataSource(config);

    describe('Count number of species', () => {
        it('return total species', async () => {
            const ExpectResult: number = 1;
            const controller = new SpeciesController(new SpeciesRepository(datasource)); 
            const CountSpecies = (await controller.count()).count; 
            expect(CountSpecies).equal(ExpectResult);
        });
    });
});

