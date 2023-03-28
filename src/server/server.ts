import express from 'express'
import http from 'http'
import ws from 'ws'
import { orderBookPairs } from './models/orderBook'

const port: number = 3000

class App {
    private server: http.Server
    private port: number

    constructor(port: number) {
        this.port = port
        const app = express()
        app.use('/sse/:coin', (req, res) => {

            const supportedOrderBookPairs = [orderBookPairs.BTCUSD, orderBookPairs.ETHUSD]
            res.setHeader('Content-Type', 'text/event-stream')
            res.setHeader('Access-Control-Allow-Origin', '*')

            if (!supportedOrderBookPairs.includes(req.params.coin as orderBookPairs)){
                return res.status(400).json(`pair ${req.params.coin} is not allowed`)
            }

            const dataSupplier = new DataSupplier(
                `book-${req.params.coin}`,
                'book',
                `${req.params.coin}`
            );

            let msg = JSON.stringify({
                event: 'subscribe',
                channel: 'book',
                symbol: `t${req.params.coin}`,
                freq: 'F0',
            });

                setTimeout(() => {
                    dataSupplier.supplier.send(msg);
                }, 1500);

                setTimeout(() => {
                    dataSupplier.supplier.send(
                        JSON.stringify({
                            event: 'unsubscribe',
                            chanId: dataSupplier.chanId
                        }))
                }, 5000);
            //tengo que poner a correr el data supplier externamente cuando llega el request. luego tengo que poder acceder al book de alguna manera, que se va a estar actualizando dentro del data supplier
            

            dataSupplier.BOOK.bids = {};
            dataSupplier.BOOK.asks = {};
            dataSupplier.BOOK.snapshot = {};
            dataSupplier.BOOK.mcnt = 0;

            dataSupplier.supplier.on('message', (msg: any) => {
                
                console.log(JSON.parse(msg))
                msg = JSON.parse(msg);
    
                if (msg && msg.event === 'info') {
                    console.log('infomsg', msg);
                }

                if (msg && msg.event === 'subscribed') {
                    dataSupplier.chanId = msg.chanId;
                    console.log('msg suscribe', msg.event)
                }
                if (msg && msg.event === 'unsubscribed' && msg.status === 'OK') {
                    console.log('unsubsMsg', msg);
                }
    
                if (msg.event) return;
                if (msg[1] === 'hb') return;
                if (dataSupplier.BOOK.mcnt === 0) {
                    msg[1].forEach(pp => {
                        pp = { price: pp[0], cnt: pp[1], amount: pp[2] };
                        const side = pp.amount >= 0 ? 'bids' : 'asks';
                        pp.amount = Math.abs(pp.amount);
                        dataSupplier.BOOK[side][pp.price] = pp;
                    });
                } else {
                    msg = msg[1];
                    const pp = { price: msg[0], cnt: msg[1], amount: msg[2] };
    
                    // if count is zero, then delete price point
                    if (!pp.cnt) {
                        let found = true;
    
                        if (pp.amount > 0) {
                            if (dataSupplier.BOOK['bids'][pp.price]) {
                                delete dataSupplier.BOOK['bids'][pp.price];
                            } else {
                                found = false;
                            }
                        } else if (pp.amount < 0) {
                            if (dataSupplier.BOOK['asks'][pp.price]) {
                                delete dataSupplier.BOOK['asks'][pp.price];
                            } else {
                                found = false;
                            }
                        }
    
                        if (!found) {
                            console.error('Book delete failed. Price point not found');
                        }
                    } else {
                        // else update price point
                        const side = pp.amount >= 0 ? 'bids' : 'asks';
                        pp.amount = Math.abs(pp.amount);
                        dataSupplier.BOOK[side][pp.price] = pp;
                    }
    
                    // save price snapshots. Checksum relies on snapshots!
                    ['bids', 'asks'].forEach(side => {
                        const sbook = dataSupplier.BOOK[side];
                        const bprices = Object.keys(sbook);
                        const prices = bprices.sort(function (a, b) {
                            if (side === 'bids') {
                                return +a >= +b ? -1 : 1;
                            } else {
                                return +a <= +b ? -1 : 1;
                            }
                        });
                        dataSupplier.BOOK.snapshot[side] = prices;
                    });
                }
                dataSupplier.BOOK.mcnt++;
        
            })   
            
            const intervalId = setInterval(() => {
                res.write(`${dataSupplier.chanId} ////// ${JSON.stringify(dataSupplier.BOOK.bids)} \n\n`)
            }, 2000)

            res.on('close', () => {
                console.log('connection closed')
                clearInterval(intervalId)
                res.end()
            })

            setTimeout(() => {
                console.log('connection internally closed')
                clearInterval(intervalId)
                res.end()
            }, 10000);

            

            


        })
        
        this.server = new http.Server(app)
    }

    
    public Start() {
        this.server.listen(this.port)
        console.log(`Server listening on port ${this.port}.`)
    }
}

new App(port).Start()

export interface OrderBook {
    bids: {};
    asks: {};
    snapshot: {};
    mcnt: number;
}

class DataSupplier {
    constructor(name: string, type: string, pair: string) {
        this.name = name;
        this.type = type;
        this.pair = pair;
    }
    public name: string;
    public type: string;
    public pair: string;
    public chanId: string;

    BOOK = {} as OrderBook;

    supplier: ws = new ws('wss://api-pub.bitfinex.com/ws/2');

    };
