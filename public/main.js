const pairSelector = document.getElementById('pair');
const bookSelector = document.getElementById('book');
const tipsContainer = document.getElementById('tipsContainer');
const pairName = document.getElementById('pairName');
const pairSubmitterButton = document.getElementById('pairSubmitter');
const pairStopperButton = document.getElementById('pairStopper');
const bookSubmitterButton = document.getElementById('bookSubmitter');
const effectivePriceSubmitter = document.getElementById('effectivePriceSubmitter');
const bookItemsByPair = document.getElementById('bookItemsByPair');
const lastPrice = document.getElementById('lastPrice');
const high = document.getElementById('high');
const low = document.getElementById('low');
const dailyChange = document.getElementById('dailyChange');
const bookTableRow = document.getElementById('bookTableRow');
const bidsTable = document.getElementById('bidsTable');
const bidsTableBody = document.getElementById('bidsTableBody');
const asksTable = document.getElementById('asksTable');
const asksTableBody = document.getElementById('asksTableBody');
const amountToBeTraded = document.getElementById('amountToBeTraded');
const operationTypeForEffectivePrice = document.getElementById('operationTypeForEffectivePrice')
const pairForEffectivePrice = document.getElementById('pairForEffectivePrice')




const checkIfDataIsBookSnapshot = bookData => {
  const parsedData = JSON.parse(bookData);
  return typeof parsedData[1][0] === 'object';
};

const formatBookData = bookData => {
  const parsedData = JSON.parse(bookData);
  console.log(typeof parsedData[1][0]);

  if (typeof parsedData[1][0] === 'object') {
    return {
      price: parsedData[1][0][1],
      count: parsedData[1][0][1],
      amount: parsedData[1][0][2],
    };
  }
};


pairSubmitterButton.addEventListener('click', async () => {
  const selectedPair = pairSelector.options[pairSelector.selectedIndex].value;
  const eventSource = new EventSource(`http://localhost:3000/sse/${selectedPair}`)
  // const eventSource = await fetch('http://localhost:3000/sse/BTCUSD')
  eventSource.onmessage = function (event) {
    console.log(JSON.parse(event.data))
    updateMessage(JSON.parse(event.data))
  }

  pairStopperButton.addEventListener('click', async () => {
    eventSource.close()
    })
 
  // console.log(eventSource.onmessage)
  // tipsContainer.style.display = 'flex';
  // pairName.innerHTML = `${selectedPair.slice(0, 3)}-${selectedPair.slice(3)} ${
  //   selectedPair === 'BTCUSD' ? '&#8383' : ''
  // } `;

  function updateMessage (message) {
    const {bids, asks} = message;
    bidsTableBody.innerHTML = ''
        Object.values(bids).forEach((bid) => {
            const bookTableRow = document.createElement('tr');
            const bidPriceCell = document.createElement('td');
            const bidCountCell = document.createElement('td');
            const bidAmountCell = document.createElement('td');
            bidPriceCell.innerText = `${bid.price}`;
            bidCountCell.innerText = `${bid.cnt}`;
            bidAmountCell.innerText = `${bid.amount}`;
            bookTableRow.appendChild(bidAmountCell);
            bookTableRow.appendChild(bidCountCell);
            bookTableRow.appendChild(bidPriceCell);
            bidsTableBody.appendChild(bookTableRow);
        })
        asksTableBody.innerHTML = ''
        Object.values(asks).forEach((ask) => {
            const bookTableRow = document.createElement('tr');
            const askPriceCell = document.createElement('td');
            const askCountCell = document.createElement('td');
            const askAmountCell = document.createElement('td');
            askPriceCell.innerText = `${ask.price}`;
            askCountCell.innerText = `${ask.cnt}`;
            askAmountCell.innerText = `${ask.amount}`;
            bookTableRow.appendChild(askPriceCell);
            bookTableRow.appendChild(askCountCell);
            bookTableRow.appendChild(askAmountCell);
            asksTableBody.appendChild(bookTableRow);
        })
  }

  // function formatTickerData (parsedData) {
     
  //     if (typeof parsedData[1] !== 'object') {
  //       return;
  //     }
    
  //     return {
  //       bid: parsedData[1][0],
  //       bidSize: parsedData[1][1],
  //       ask: parsedData[1][2],
  //       askSize: parsedData[1][3],
  //       dailyChange: parsedData[1][4],
  //       dailyChangeRelative: parsedData[1][5],
  //       lastPrice: parsedData[1][6],
  //       volume: parsedData[1][7],
  //       high: parsedData[1][8],
  //       low: parsedData[1][9],
  //     };
  //   };

  eventSource.onopen = function (event) {
    console.log(event)
  }

  eventSource.onerror = () => {
    console.log('server closed connection')
    eventSource.close()
  }
  

});

// bookSubmitterButton.addEventListener('click', () => {
//   const selectedBook = bookSelector.options[bookSelector.selectedIndex].value;
//   socket.emit('book', {
//     bookValue: selectedBook,
//   });
//   socket.emit('book2', {
//     bookValue: selectedBook,
//   });
//   /*     tipsContainer.style.display = "flex";
//     bookName.innerHTML = `${selectedBook.slice(0,3)}-${selectedBook.slice(3)} ${selectedBook === 'BTCUSD' ? '&#8383' : ''} `
//  */
// });

// effectivePriceSubmitter.addEventListener('click', () => {
//   const amount = amountToBeTraded.value;
//   const selectedPair = pairForEffectivePrice.options[pairForEffectivePrice.selectedIndex].value;
//   const selectedOperation = operationTypeForEffectivePrice.options[operationTypeForEffectivePrice.selectedIndex].value;

//   socket.emit('effectivePrice', {
//     amount,
//     selectedPair,
//     selectedOperation
//   });

//   console.log('amount: ', amount, ' pair: ', selectedPair, ' op: ', selectedOperation )

// })


// socket.on('pair', data => {
//   console.log(data)
//   const formattedBookData = formatTickerData(data);
//   lastPrice.innerHTML = `${formattedBookData.lastPrice}`;
//   high.innerHTML = `${formattedBookData.high}`;
//   low.innerHTML = `${formattedBookData.low}`;
//   dailyChange.innerHTML = `${formattedBookData.dailyChange} ${
//     Number(formattedBookData.dailyChange) < 0 ? '&#8615' : '&#8613'
//   }`;
//   bookItemsByPair.innerText = '';
//   bookItemsByPair.innerText = `
//                     - Bid (Price of last highest bid): ${formattedBookData.bid}
//                     - Bid Size (Sum of the 25 highest bid sizes): ${formattedBookData.bidSize}
//                     - Ask (Price of last lowest ask): ${formattedBookData.ask}
//                     - Ask Size (Sum of the 25 lowest ask sizes): ${formattedBookData.askSize}
//                     - Daily Change (Amount that the last price has changed since yesterday): ${formattedBookData.dailyChange}
//                     - Daily Change Relative (Relative price change since yesterday (*100 for percentage change): ${formattedBookData.dailyChangeRelative}
//                     - Last Price (Price of the last trade): ${formattedBookData.lastPrice}
//                     - Volume (BTC - 24h): ${formattedBookData.volume}
//                     - High (Daily high): ${formattedBookData.high}
//                     - Low (Daily Low): ${formattedBookData.low}
//                     `;
// });

// socket.on('book', data => {
//   console.log('bookData', data)
//     const {bids, asks} = data;
//     bidsTableBody.innerHTML = ''
//         Object.values(bids).forEach((bid) => {
//             const bookTableRow = document.createElement('tr');
//             const bidPriceCell = document.createElement('td');
//             const bidCountCell = document.createElement('td');
//             const bidAmountCell = document.createElement('td');
//             bidPriceCell.innerText = `${bid.price}`;
//             bidCountCell.innerText = `${bid.cnt}`;
//             bidAmountCell.innerText = `${bid.amount}`;
//             bookTableRow.appendChild(bidAmountCell);
//             bookTableRow.appendChild(bidCountCell);
//             bookTableRow.appendChild(bidPriceCell);
//             bidsTableBody.appendChild(bookTableRow);
//         })
//         asksTableBody.innerHTML = ''
//         Object.values(asks).forEach((ask) => {
//             const bookTableRow = document.createElement('tr');
//             const askPriceCell = document.createElement('td');
//             const askCountCell = document.createElement('td');
//             const askAmountCell = document.createElement('td');
//             askPriceCell.innerText = `${ask.price}`;
//             askCountCell.innerText = `${ask.cnt}`;
//             askAmountCell.innerText = `${ask.amount}`;
//             bookTableRow.appendChild(askPriceCell);
//             bookTableRow.appendChild(askCountCell);
//             bookTableRow.appendChild(askAmountCell);
//             asksTableBody.appendChild(bookTableRow);
//         })

          
//       } 



// /*    if (checkIfDataIsBookSnapshot(data)) {
//     const parsedData = JSON.parse(data);
//     for (let i = 0; i < parsedData[1].length; i++) {
//       if (parsedData[1][i][1] !== 0) {
//         const bookTableRow = document.createElement('tr');
//         const bookPriceCell = document.createElement('td');
//         const bookCountCell = document.createElement('td');
//         const bookAmountCell = document.createElement('td');
//         bookPriceCell.innerText = `${parsedData[1][i][0]}`;
//         bookCountCell.innerText = `${parsedData[1][i][1]}`;
//         bookAmountCell.innerText = `${parsedData[1][i][2]}`;
//         bookTableRow.appendChild(bookPriceCell);
//         bookTableRow.appendChild(bookCountCell);
//         bookTableRow.appendChild(bookAmountCell);
//         bookTable.appendChild(bookTableRow);
//       }
//     }
//   }  */

// );

// socket.on('effectivePriceBook', data => {
//   const {bids, asks} = data.book;
//   console.log(asks)

//   if (data.input.selectedOperation === 'buy') {
//     Object.values(asks)[0].amount > data.input.amount ? console.log('se vende a ', Object.values(asks)[0].price ) : console.log('hay que iterar')

//   }

    
//     } 

// );
