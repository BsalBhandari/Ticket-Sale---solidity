const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require('web3');
// const web3 = new Web3('http://localhost:8545');


const web3 = new Web3(ganache.provider());
console.log(web3)
const { abi, bytecode } = require('../compile');
const TicketSale = require('../contracts/TicketSale.sol');
const { TicketStatus } = TicketSale;

let accounts;
let ticketSale;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    ticketSale = await new web3.eth.Contract(abi)
        .deploy({
            data: bytecode,
            arguments: [10, 100], 
        })
        .send({ from: accounts[0], gasPrice: '1000000000', gas: 2000000 });
});

describe('TicketSale Contract', () => {
    it('should deploy TicketSale contract', () => {
        assert.ok(ticketSale.options.address);
    });

    it('should allow buying a ticket', async () => {
        const ticketId = 1;
        await ticketSale.methods.buyTicket(ticketId).send({
            from: accounts[1],
            value: 100 
        });

        const ticketStatus = await ticketSale.methods.ticketStatus(ticketId).call();
        const ticketOwner = await ticketSale.methods.ticketOf(accounts[1]).call();

        assert.strictEqual(ticketStatus, TicketStatus.Sold);
        assert.strictEqual(Number(ticketOwner), ticketId);
    });

    it('should return the correct ticket of an address', async () => {
        const ticketId = 2;
        await ticketSale.methods.buyTicket(ticketId).send({
            from: accounts[2],
            value: 100
        });

        const result = await ticketSale.methods.getTicketOf(accounts[2]).call();

        assert.strictEqual(Number(result), ticketId);
    });

    it('should allow offering a swap', async () => {
        const ticketId = 3;
        await ticketSale.methods.buyTicket(ticketId).send({
            from: accounts[3],
            value: 100
        });

        await ticketSale.methods.offerSwap(accounts[4]).send({
            from: accounts[3]
        });

        const swapOffer = await ticketSale.methods.swapOffers(accounts[3]).call();

        assert.strictEqual(swapOffer.offerer, accounts[3]);
        assert.strictEqual(Number(swapOffer.ticketToSwap), ticketId);
    });

    it('should allow accepting a swap', async () => {
        const ticketId1 = 4;
        const ticketId2 = 5;

        await ticketSale.methods.buyTicket(ticketId1).send({
            from: accounts[4],
            value: 100
        });
        await ticketSale.methods.buyTicket(ticketId2).send({
            from: accounts[5],
            value: 100
        });

        await ticketSale.methods.offerSwap(accounts[5]).send({
            from: accounts[4]
        });

        await ticketSale.methods.acceptSwap(accounts[4]).send({
            from: accounts[5]
        });

        const ownerOfTicket1 = await ticketSale.methods.ticketOf(accounts[4]).call();
        const ownerOfTicket2 = await ticketSale.methods.ticketOf(accounts[5]).call();

        assert.strictEqual(Number(ownerOfTicket1), ticketId2);
        assert.strictEqual(Number(ownerOfTicket2), ticketId1);
    });
});

