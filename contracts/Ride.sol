pragma solidity ^0.5;

contract Ride{
    struct Location {
        uint longtitude;
        uint latitude; 
    }
    struct Driver {
        address id;
        string carPlate;
        uint carSize;
        bool availabilty;  
    }
    struct Request {
        address user;
        Location startPoint;
        Location endPoint;
        uint256 cost;
        address payable driver;
        bool driverConfirmation;
        bool userConfirmation;
    }

    mapping(address => Location) public locations;
    mapping(address => Driver) public drivers;
    mapping(address => Request)  rideRequests;


    modifier isDriver(address id){
        require(drivers[id].id == id,"You are not a Driver");
         _;
    }

    function setLocation(uint _latitude, uint _longtitude ) public  {
        locations[msg.sender].latitude = _latitude;
        locations[msg.sender].longtitude = _longtitude;
    }

    function addDriverInformation(string memory _carPlate, uint _carSize) public {
        drivers[msg.sender].carSize = _carSize;
        drivers[msg.sender].carPlate = _carPlate;
        drivers[msg.sender].availabilty = false;
        drivers[msg.sender].id = msg.sender;

    }

    function changeAvailabilty(bool _available) public isDriver(msg.sender) {
        drivers[msg.sender].availabilty = _available;
    }


    function rideRequest(uint256 _cost, uint  _startLongtitude,uint  _startLatitude ,uint  _endLongtitude,uint  _endLatitude, address payable _driver) public {
        require(msg.sender!= _driver, "driver can not request to himself/herself");

        rideRequests[msg.sender].user = msg.sender;
        rideRequests[msg.sender].driver = _driver;
        rideRequests[msg.sender].startPoint.longtitude = _startLongtitude;
        rideRequests[msg.sender].startPoint.latitude = _startLatitude;
        rideRequests[msg.sender].endPoint.longtitude = _endLongtitude;
        rideRequests[msg.sender].endPoint.latitude = _endLatitude;
        rideRequests[msg.sender].cost = _cost;
        rideRequests[msg.sender].driverConfirmation = false;
        rideRequests[msg.sender].userConfirmation = false;

    }

    function acceptRequest(address user) public {

    }

    function ridePayment(address d) payable public {

    }

    function cancelRequest() public {

    }

    function declineRequest() public {

    }

    function fetchAllDrivers() public {

    }




}