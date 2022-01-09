const { assert, should, expect } = require("chai");
const truffleAssert = require('truffle-assertions');

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));


const Ride = artifacts.require('Ride');
const ether = 10**18; // 1 ether = 1000000000000000000 wei

contract('Ride', (accounts) =>{
    const alice = accounts[0];
    const bob = accounts[1];
    const marcus = accounts[2];
    const deGea = accounts[3];
    
    it('Should deploy smart contract properly', async ()=>{
        
        const ride = await Ride.deployed();
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

            const driver  = await ride.drivers(alice);

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
            const driver  = await ride.drivers(alice);
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
            const driverLocation = await ride.locations(alice);
            

            assert.equal(driverLocation.latitude.toNumber(), lat);
            assert.equal(driverLocation.longtitude.toNumber(), long);


        });


    });

    describe('Fetch All drivers', ()=>{
        it('fetch all drivers', async ()=>{
            const ride = await Ride.deployed();
            const drivers = await ride.fetchAllDrivers.call();
        
            return drivers[0] === alice;

            

        });
    });

      

    describe('Ride Request', () => {

        it('requesting Ride', async () =>{
            const ride = await Ride.deployed();
            const cost = 2 * ether;
            const startingLocation = [34546,45353];
            const finishingLocation = [46,45];
            const driver = alice;
            
            await ride.deposit({from: bob, value: web3.utils.toBN(10*ether) } );



            const request = await ride.rideRequest.sendTransaction(web3.utils.toBN(cost), startingLocation[0], startingLocation[1], finishingLocation[0],
                             finishingLocation[1], driver   ,  {from: bob });

         

            truffleAssert.eventEmitted(request,'RideRequested', (ev)=>{
                return ev.cost.eq( web3.utils.toBN(cost) );
            })
            
        });


        it('Fetch all requests',  async ()=>{
            const ride = await Ride.deployed();


            const cost = 50;
            const startingLocation = [34546,45353];
            const finishingLocation = [46,45];
            const driver = accounts[3];


            await ride.deposit({from: marcus, value: web3.utils.toBN(10*ether) } );

            const request = await ride.rideRequest.sendTransaction(cost, startingLocation[0], startingLocation[1], finishingLocation[0],
                             finishingLocation[1], driver   ,  {from: marcus });

         



            const requests = await ride.fetchAllRequests.call();

            return requests[1].driver === '0x0000000000000000000000000000000000000000' && requests[0].driver == alice;



        });
        




        it('accept request', async () =>{
            const ride = await Ride.deployed();
            const event = await ride.acceptRequest(bob, {from:alice});
            const cost = 2 * ether;

            truffleAssert.eventEmitted(event, 'RideAccepted', (ev)=>{
                // console.log()
                return ev.cost.eq(web3.utils.toBN(cost))  && ev.user == bob;

            });


        });
        it('cancel request', async ()=>{
            const ride = await Ride.deployed();
            const event = await ride.cancelRequest.sendTransaction({from:bob});

        
            truffleAssert.eventEmitted(event,'RideRequestCanceled', (ev)=>{
                return ev.user === bob;
            });


        });
        it('requesting Ride', async () =>{
            const ride = await Ride.deployed();
            const cost = 1 * ether;
            const startingLocation = [34546,45353];
            const finishingLocation = [46,45];
            const driver = alice;



            const request = await ride.rideRequest.sendTransaction(web3.utils.toBN(cost), startingLocation[0], startingLocation[1], finishingLocation[0],
                             finishingLocation[1], driver   ,  {from: bob });

         

            truffleAssert.eventEmitted(request,'RideRequested', (ev)=>{

                return ev.cost.toString() === cost.toString();
            })
            
        });
        it('decline request', async ()=>{
            const ride = await Ride.deployed();
            const event = await ride.declineRequest(bob);

            truffleAssert.eventEmitted(event,'RideRequestDeleted', (ev)=>{
                return ev.user === bob && ev.driver === alice;
            });
        });


    });





    describe('ride payment', () => {

        it('deposit moeny ', async ()=>{
            const ride = await Ride.deployed();
            const deposit = 5 * ether;
            
            const receipt = await ride.deposit({from: deGea, value: web3.utils.toBN(deposit)});
            const afterDeposit = await ride.balance({from: deGea});


            assert.equal(afterDeposit,  deposit, "deposit amount incorrect, check deposit method");




        });

        it('balance', async ()=>{
            const ride = await Ride.deployed();
            const balance = 5 * ether;

            const receipt = await ride.balance({from: deGea});

            assert.equal(receipt, balance, "balance amount incorrect, check balance method");




        } );

        it('withdraw',  async ()=>{
            const ride = await Ride.deployed();
            const amount = 2* ether;
            var beforeBalance = await ride.balance({from: deGea});

            await ride.withdraw(web3.utils.toBN(amount) , {from: deGea});
  
            var receipt = await ride.balance({from: deGea});
           

            assert.equal(amount.toString(),  beforeBalance.sub(receipt).toString() , " withdraw amount incorrect, check withdraw");

        });



        it('ride  payment',async ()=>{
            const ride = await Ride.deployed();
            const cost = 1 * ether;
            const startingLocation = [34546,45353];
            const finishingLocation = [46,45];
            const driver = alice;


            // send request
            await ride.rideRequest.sendTransaction(web3.utils.toBN(cost), startingLocation[0], startingLocation[1], finishingLocation[0],
                             finishingLocation[1], driver   ,  {from: deGea });
            // acccept request
            await ride.acceptRequest(deGea, {from:alice});

            /// pay the drivers
            
            const receipt = await ride.ridePayment(alice, {from: deGea});

            truffleAssert.eventEmitted(receipt,'PaymentSuccesful', (ev)=>{
          
                return ev.driver == alice && ev.amount.eq(web3.utils.toBN(cost));
            })



        });

        it('fetch ride history', async ()=>{
            
         const ride = await Ride.deployed();
         const history = await ride.fetchHistory.call();
         const cost = 1 * ether;


         return history[0].user === deGea && history[0].driver === alice && history[0].cost.toString() === cost.toString();




        });
    });
    


});