// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract TicketSale {
    address public owner;
    uint public ticketPrice;
    uint public totalTickets;
    uint public serviceFee;
    
    enum TicketStatus { Unsold, Sold, Available }
    mapping(uint => TicketStatus) public ticketStatus;
    mapping(address => uint) public ticketOf;
    
    struct SwapOffer {
        address offerer;
        uint ticketToSwap;
    }
    
    mapping(address => SwapOffer) public swapOffers;
    
    constructor(uint numTickets, uint price) {
        owner = msg.sender;
        totalTickets = numTickets;
        ticketPrice = price;
        serviceFee = price / 10; // 10% service fee
        for (uint i = 1; i <= numTickets; i++) {
            ticketStatus[i] = TicketStatus.Available;
        }
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    
    function buyTicket(uint ticketId) public payable {
        ticketStatus[ticketId] = TicketStatus.Sold;
        ticketOf[msg.sender] = ticketId;
    }
    
    function getTicketOf(address person) public view returns (uint) {
        return ticketOf[person];
    }
    
    function offerSwap(address /*partner*/) public {
        swapOffers[msg.sender] = SwapOffer(msg.sender, ticketOf[msg.sender]);
    }
    
    function acceptSwap(address partner) public {
        uint myTicket = ticketOf[msg.sender];
        uint partnerTicket = ticketOf[partner];
        
        require(swapOffers[partner].ticketToSwap == myTicket, "Invalid swap offer");
        
        ticketOf[msg.sender] = partnerTicket;
        ticketOf[partner] = myTicket;
        delete swapOffers[partner];
    }
    
    function returnTicket(uint ticketId) public {
        require(ticketOf[msg.sender] == ticketId, "You don't own this ticket");
        
        ticketStatus[ticketId] = TicketStatus.Available;
        uint refundAmount = ticketPrice - serviceFee;
        payable(owner).transfer(serviceFee);
        payable(msg.sender).transfer(refundAmount);
        ticketOf[msg.sender] = 0;
    }
}
