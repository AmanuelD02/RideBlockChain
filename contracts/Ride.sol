pragma solidity ^0.5;
pragma experimental ABIEncoderV2;


contract Ride{

    struct Location {
        uint longtitude;
        uint latitude; 
    }
    struct Driver {
        address id;
        string carPlate;
        uint8 carSize;
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

    struct History {
        address user;
        Location startPoint;
        Location endPoint;
        uint256 cost;
        address payable driver;
        uint256 timestamp;
    }




    
    // Declare Events
    event DriverAdded(address driver, string carPlate, uint8 carSize);
    event AvailabiltyChanged(address driver, bool availabilty);
    event LocationChanged(address driver,Location location );
    event RideRequested(address driver, address user, Location start, Location end, uint256 cost);
    event RideAccepted(address user, uint256 cost, Location startPoint);
    event RideRequestDeleted(address user, address driver );
    event RideRequestCanceled(address user );
    event PaymentSuccesful(address user, address driver, uint256 amount);
    event DepositMade(address user , uint amount);


    mapping(address => Location) public locations;
    mapping(address => Driver) public drivers;
    mapping(address => Request)  rideRequests;
    mapping(address => uint) private balances;

    History[] public history;


    // Array to store the address  of requestedRide and drivers
    address[] public requestArray;
    mapping(address => bool) private requestInserted;
    mapping(address => bool) private driverInserted;
    address[]  public driverArray; 




    // Owner of the contract
    address public owner;
    constructor() public  {
        owner = msg.sender;
    }

    modifier isDriver(address id){
        require(drivers[id].id == id,"You are not a Driver");
         _;
    }


    function deposit() public payable returns(uint) {
         balances[msg.sender] += msg.value;

         emit DepositMade(msg.sender, msg.value);

         return balances[msg.sender];
    }


    function withdraw(uint withdrawAmount) public returns (uint remainingBal) {
        // Check enough balance available
        require(withdrawAmount <= balances[msg.sender], "Insufficient Balance");
        
        balances[msg.sender] -= withdrawAmount;
        msg.sender.transfer(withdrawAmount);
        
        return balances[msg.sender];
    }


    function balance() public view returns (uint) {
        return balances[msg.sender];
    }

    function ridePayment(address payable _driver)  public payable  {
        
        Request memory request = rideRequests[msg.sender];
        uint amount = request.cost;
        // check balance and driver address 
        require(_driver == request.driver, "driver address incorrect");
        require(amount <= balances[msg.sender], "Insufficient Balance");
        
        balances[msg.sender] -= amount;

        // transfer moeny to the driver
        _driver.transfer(amount);

        // add 
        History memory h =  History (
        {
        user: msg.sender,
        startPoint: request.startPoint,
        endPoint: request.endPoint,
        cost: amount,
        driver: _driver,
        timestamp: block.timestamp
        });


        emit PaymentSuccesful(msg.sender,_driver , amount);

        
        history.push(h);
    
          
    }


    function fetchHistory() view public returns(History[] memory){
        return history;
    }






    function setLocation(uint _latitude, uint _longtitude ) public  {
        locations[msg.sender].latitude = _latitude;
        locations[msg.sender].longtitude = _longtitude;

        emit LocationChanged(msg.sender, locations[msg.sender]);
    }

    function addDriverInformation(string memory _carPlate, uint8 _carSize) public {
        drivers[msg.sender].carSize = _carSize;
        drivers[msg.sender].carPlate = _carPlate;
        drivers[msg.sender].availabilty = false;
        drivers[msg.sender].id = msg.sender;

        if(!driverInserted[msg.sender]){
            driverInserted[msg.sender] = true;
            driverArray.push(msg.sender);
        }

        emit DriverAdded(msg.sender, _carPlate, _carSize);
    }

    function changeAvailabilty(bool _available) public isDriver(msg.sender) {
        drivers[msg.sender].availabilty = _available;
        emit AvailabiltyChanged(msg.sender, _available);
    }


    function rideRequest(uint256 _cost, uint  _startLongtitude,uint  _startLatitude ,uint  _endLongtitude,uint  _endLatitude, address payable _driver) public {
        require(msg.sender!= _driver, "driver can not request to himself/herself");
        require(balances[msg.sender]>= _cost, "Insufficient balance!");
        rideRequests[msg.sender].user = msg.sender;
        rideRequests[msg.sender].driver = _driver;

        // NEED TO REFACTORED
        rideRequests[msg.sender].startPoint.longtitude = _startLongtitude;
        rideRequests[msg.sender].startPoint.latitude = _startLatitude;
        rideRequests[msg.sender].endPoint.longtitude = _endLongtitude;
        rideRequests[msg.sender].endPoint.latitude = _endLatitude;
        // 
        
        rideRequests[msg.sender].cost = _cost;
        rideRequests[msg.sender].driverConfirmation = false;
        rideRequests[msg.sender].userConfirmation = false;
        
        if(!requestInserted[msg.sender]){
            requestArray.push(msg.sender);
            requestInserted[msg.sender] = true;
        }

        emit RideRequested(_driver, msg.sender, rideRequests[msg.sender].startPoint,  rideRequests[msg.sender].endPoint, _cost);
    }


    function fetchAllRequests() public view  isDriver(msg.sender) returns(Request[] memory ) {
        Request[] memory request = new Request[](requestArray.length);

         for (uint r = 0; r < requestArray.length; r++) {
             address dd = requestArray[r];
             if(rideRequests[dd].driver == msg.sender ){
                 request[r] = rideRequests[dd];
             }

         }
         return request;

    }

    function acceptRequest(address user) public {
        require(rideRequests[user].driver == msg.sender, "you are not the driver");
        rideRequests[user].driverConfirmation = true;

        emit RideAccepted(rideRequests[user].user, rideRequests[user].cost, rideRequests[user].startPoint);


    }


    

    function fetchAllDrivers() external returns( address[] memory){
        return driverArray;

    }
    function declineRequest(address user) public  isDriver(msg.sender){
        require(rideRequests[user].driver == msg.sender, "you are not the driver");

        delete rideRequests[user];
        RemoveRequestByValue(user);
        requestInserted[user] = false;

        emit RideRequestDeleted(user,msg.sender);


    }

    function cancelRequest() public {
        // address driver = rideRequests[msg.sender].driver;

        RemoveRequestByValue(msg.sender);
        requestInserted[msg.sender] = false;

        delete rideRequests[msg.sender];

        emit RideRequestCanceled(msg.sender);

    }

    
  /** Removes the given value in an array. */
  function RemoveRequestByValue(address value) private {
    uint i = IndexOf(value);
    RemoveRequestByIndex(i);
  }

  /** Removes the value at the given index in an array. */
  function RemoveRequestByIndex( uint i) private{
    while (i<requestArray.length-1) {
      requestArray[i] = requestArray[i+1];
      i++;
    }
    requestArray.length--;
    
  }

   function IndexOf(address value) private returns(uint) {
    uint i = 0;
    while (requestArray[i] != value) {
      i++;
    }
    return i;
  }



}