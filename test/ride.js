const { assert, should, expect } = require("chai");
const truffleAssert = require('truffle-assertions');

const Ride = artifacts.require('Ride');


contract('Ride', (accounts) =>{

    
    it('Should deploy smart contract properly', async ()=>{
        
        const ride = await Ride.deployed()
        // console.log(ride.address);

        assert(ride.address !=='');
    });

    describe('Driver Information', async () =>{
      

        it('add driver information', async () =>{
            const ride = await Ride.deployed();
            const carPlate = "Aman23";
            const carSize = 5;

            const driverEvent = await ride.addDriverInformation(carPlate,carSize);

            truffleAssert.eventEmitted(driverEvent,'DriverAdded', (ev)=>{
                // console.log(ev);
                return ev[1] === carPlate && ev[2].toNumber() === carSize;
            })
        });


        it('fetch driver information', async ()=>{
            const ride = await Ride.deployed();
            const carPlate = "Aman23";
            const carSize = 5;

            const driver  = await ride.drivers(accounts[0]);

            // console.log(driver);
            // check carPlate
            assert.equal(driver.carPlate, carPlate );

            // check carSize
            assert.equal(driver.carSize.toNumber(), carSize);

        })
    });


    describe('driver availabilty', async () => {

        it('fetch driver availabilty', async ()=> {
            const ride = await Ride.deployed();
            const driver  = await ride.drivers(accounts[0]);
            assert.equal(driver.availabilty, false );
        });


        it('change driver availabilty', async ()=> {
            const ride = await Ride.deployed();
            const availabilty = true;
            const event = await ride.changeAvailabilty(availabilty);


            truffleAssert.eventEmitted(event,'AvailabiltyChanged', (ev)=>{
                return ev.availabilty === availabilty;
            })
        });


        
    });


    describe('driver location', async ()=> {
        it('set driver location', async ()=> {
            const ride = await Ride.deployed();

            const lat = 3464646;
            const long = 345454;

            const event = await ride.setLocation(lat, long);

            truffleAssert.eventEmitted(event, 'LocationChanged', (ev)=>{
                return parseInt(ev.location['longtitude']) === long  && parseInt(ev.location['latitude']) === lat;
            })



        });


        it('fetch driver location', async ()=>{
            
            const lat = 3464646;
            const long = 345454;

            const ride = await Ride.deployed();
            const driverLocation = await ride.locations(accounts[0]);
            

            assert.equal(driverLocation.latitude.toNumber(), lat);
            assert.equal(driverLocation.longtitude.toNumber(), long);


        });


    });

    
    

});