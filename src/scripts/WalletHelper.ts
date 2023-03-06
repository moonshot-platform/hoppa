import { ethers } from "ethers";

declare global {
    var moonshotBalance: number;
    var ra8bitBalance: number;
    var hasNFT: boolean;
    var selectedAddress: string;
    var provider: ethers.providers.Web3Provider;
    var signer: ethers.providers.JsonRpcSigner;
    var noWallet: boolean;
    var chainId: number;
    var changeEvent: number;
    var adReturn: string;
    interface Window {
        ethereum: import('ethers').providers.ExternalProvider;
    }
}

export function init() {

    if( window.ethereum === undefined) {
        globalThis.noWallet = true;
        console.log("No wallet found");
        return;
    }

    globalThis.provider = new ethers.providers.Web3Provider(window.ethereum);
    globalThis.moonshotBalance = 0;
    globalThis.ra8bitBalance = 0;
    globalThis.adReturn = "hoppa";
    globalThis.selectedAddress = "0x000000000000000000000000000000000000dead";
    
    (window.ethereum as any).on( 'accountsChanged', function(accounts) {
      if( accounts.length > 0 ) {
        getCurrentAccount();
        getMyNFTCollections();
        findCards();
        globalThis.changeEvent ++;
      }
    });

    (window.ethereum as any).on( 'network', (newNet,oldNet) => {
      if(newNet.chainId == 56) {
        getCurrentAccount();
        getMyNFTCollections();
        findCards();
        globalThis.changeEvent ++;
      }
    });

    findCards();

}

export async function getCurrentAccount() {
    if( globalThis.noWallet ) {
       console.log("No wallet found");
       return;
    }

    const { chainId } = await provider.getNetwork();

    globalThis.chainId = chainId;

    if(globalThis.chainId != 56) {
      console.log("Wallet is not connected with Binance Smart Chain: ", chainId);
      return;
    }

    await globalThis.provider.send("eth_requestAccounts", []);

    globalThis.signer = globalThis.provider.getSigner();
    // save the currently connected address
    globalThis.selectedAddress = await globalThis.signer.getAddress();
    
    const abi = [
        "function balanceOf(address account) external view returns (uint256)"
    ];
    
    // save the current balances of Moonshot and Ra8bit tokens
    const moonshotContract = new ethers.Contract("0x5298ad82dd7c83eeaa31dda9deb4307664c60534", abi , globalThis.signer );     
    globalThis.moonshotBalance = await moonshotContract.balanceOf( globalThis.selectedAddress );

    const ra8bitContract = new ethers.Contract("0x27424eE307488cA414f430b84A10483344E6d80a", abi , globalThis.signer );    
    globalThis.ra8bitBalance = await ra8bitContract.balanceOf( globalThis.selectedAddress );
    
}

export async function findCards() {
  await globalThis.provider.send("eth_requestAccounts", []);
  globalThis.signer = globalThis.provider.getSigner();
  // save the currently connected address
  globalThis.selectedAddress = await globalThis.signer.getAddress();
  
  const abi = [
      "function balanceOf(address _owner, uint256 _id) external view returns (uint256)",
  ];

  const c = new ethers.Contract("0xb8eB97a1d6393B087EEACb33c3399505a3219d3D", abi , globalThis.signer );
  let cards: string[] = new Array(10);
  cards[0] = "0";
  for( let i = 1; i < 10; i ++ ) {
    let balance = await c.balanceOf( globalThis.selectedAddress, i );
    if( balance > 0 ) 
      globalThis.hasNFT = true;
    let bn = "" + balance;
    cards[i]= bn;
  }
  
  const data = JSON.stringify(cards);
  window.localStorage.setItem( 'ra8bit.cards', data );
}

export async function getSomeRa8bitTokens() {
  if( globalThis.noWallet )
    return "No wallet found";

  await globalThis.provider.send("eth_requestAccounts", []);
  globalThis.signer = globalThis.provider.getSigner();
  // save the currently connected address
  globalThis.selectedAddress = await globalThis.signer.getAddress();
  
  const abi = [
      "function canWithdraw(address addr) public view returns (bool)",
      "function getFreeRa8bit() external"
  ];

  const faucetContract = new ethers.Contract("0x5620AF88096762868150100FA21797eCB49c5759", abi , globalThis.signer );     
  const canWithdraw = await faucetContract.canWithdraw( globalThis.selectedAddress );

  if( canWithdraw ) {

    try {

      const tx = await faucetContract.getFreeRa8bit();
      await tx.wait();
    
      await getCurrentAccount();
    }
    catch( error: any ) {
      return error.reason;
    }
  }

  return "You received $RA8BIT tokens";
}

export async function getSomeMoonshotTokens(): Promise<string> {
  if( globalThis.noWallet ) {
    return "No wallet found";
  }

  await globalThis.provider.send("eth_requestAccounts", []);
  globalThis.signer = globalThis.provider.getSigner();
  // save the currently connected address
  globalThis.selectedAddress = await globalThis.signer.getAddress();
  
  const abi = [
      "function canWithdraw(address addr) public view returns (bool)",
      "function getFreeMoonshot() external"
  ];

  const faucetContract = new ethers.Contract("0x23737b74C1026a8F3A038Af0F9752b7cbd75A76C", abi , globalThis.signer );     
  const canWithdraw = await faucetContract.canWithdraw( globalThis.selectedAddress );

  if( canWithdraw ) {

    try {

      const tx = await faucetContract.getFreeMoonshot();
      await tx.wait();

      await getCurrentAccount();
    }
    catch( error: any ) {
      return error.reason;
    }
  }

  return "You received $MSHOT tokens";

}

export async function updateHighscore( name, score ): Promise<string> {
  if( globalThis.noWallet ) {
    return "No wallet found";
  }

  await globalThis.provider.send("eth_requestAccounts", []);
  globalThis.signer = globalThis.provider.getSigner();
  // save the currently connected address
  globalThis.selectedAddress = await globalThis.signer.getAddress();
  
  const abi = [
      "function updateScore(string memory initials, uint256 score) public",
  ];

  const hallOfFame = new ethers.Contract("0x9d811D1600236cE2874A1f3cA2E7318cABe2DB7d", abi , globalThis.signer );

  try {
    const tx = await hallOfFame.updateScore( name, score );
    await tx.wait();
  }
  catch( error: any ) {
    return error.reason;
  }

  return "OK";
}

export async function getHighscores(): Promise<string> {
  if( globalThis.noWallet ) {
    return "No wallet found";
  }

  await globalThis.provider.send("eth_requestAccounts", []);
  globalThis.signer = globalThis.provider.getSigner();
  // save the currently connected address
  globalThis.selectedAddress = await globalThis.signer.getAddress();
  
  const abi = 
      [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"}],"name":"GameMakerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"}],"name":"GameMakerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"},{"indexed":false,"internalType":"uint8","name":"position","type":"uint8"}],"name":"HighscoreRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"}],"name":"HighscoreReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"initials","type":"string"},{"indexed":false,"internalType":"uint256","name":"score","type":"uint256"},{"indexed":false,"internalType":"address","name":"player","type":"address"}],"name":"HighscoreUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"gamemaker","type":"address"}],"name":"addGameMaker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"clearHallOfFame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"gameMakers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getHallOfFame","outputs":[{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"score","type":"uint256"},{"internalType":"string","name":"initials","type":"string"}],"internalType":"struct HallOfFame.HighScores[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"hallOfFame","outputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"score","type":"uint256"},{"internalType":"string","name":"initials","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"gamemaker","type":"address"}],"name":"removeGameMaker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"score","type":"uint256"}],"name":"removeScore","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"initials","type":"string"},{"internalType":"uint256","name":"score","type":"uint256"}],"name":"updateScore","outputs":[],"stateMutability":"nonpayable","type":"function"}];

  const hallOfFame = new ethers.Contract("0x9d811D1600236cE2874A1f3cA2E7318cABe2DB7d", abi , globalThis.signer );

  try {
    const highscores = await hallOfFame.getHallOfFame( );
    
    return highscores;
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return error.reason;
  }

  return "OK";
}

export async function hasNewHighScore(score): Promise<boolean> {
  if( globalThis.noWallet ) {
    return false;
  }

  await globalThis.provider.send("eth_requestAccounts", []);
  globalThis.signer = globalThis.provider.getSigner();
  // save the currently connected address
  globalThis.selectedAddress = await globalThis.signer.getAddress();
  
  const abi = 
      [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"}],"name":"GameMakerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"}],"name":"GameMakerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"},{"indexed":false,"internalType":"uint8","name":"position","type":"uint8"}],"name":"HighscoreRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"}],"name":"HighscoreReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"initials","type":"string"},{"indexed":false,"internalType":"uint256","name":"score","type":"uint256"},{"indexed":false,"internalType":"address","name":"player","type":"address"}],"name":"HighscoreUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"gamemaker","type":"address"}],"name":"addGameMaker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"clearHallOfFame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"gameMakers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getHallOfFame","outputs":[{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"score","type":"uint256"},{"internalType":"string","name":"initials","type":"string"}],"internalType":"struct HallOfFame.HighScores[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"hallOfFame","outputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"score","type":"uint256"},{"internalType":"string","name":"initials","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"gamemaker","type":"address"}],"name":"removeGameMaker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"score","type":"uint256"}],"name":"removeScore","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"initials","type":"string"},{"internalType":"uint256","name":"score","type":"uint256"}],"name":"updateScore","outputs":[],"stateMutability":"nonpayable","type":"function"}];

  const hallOfFame = new ethers.Contract("0x9d811D1600236cE2874A1f3cA2E7318cABe2DB7d", abi , globalThis.signer );

  try {
    const highscores = await hallOfFame.getHallOfFame( );
    for( let i = 0; i < highscores.length; i ++ ) {
      let p = highscores[i];
      if( score > p[1].toNumber() )
        return true;
    }
    return highscores;
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return false;
  }

  return false;
}


export function isNotEligible(): boolean {
    return globalThis.noWallet || (globalThis.moonshotBalance == 0 && globalThis.ra8bitBalance == 0 && !globalThis.hasNFT );
}

export async function getMyNFTCollections() {
  let numCollections = 0;
  const nftAddress = [
    '0x82A3E038048CF02C19e60856564bE209899d4F12',
    '0x0CBd80abc67d403E4258894E62235DbaF93F2779',
    '0xa552F4c1eD2115779c19B835dCF5A895Cdc25624',
    '0xa8e67efd3DDAD234947d8BC80F36aa8F9eb35dF0',
    '0x8004d73663F03Bc6dDB84d316ba0929240F6a8BA',
    '0x67af3a5765299a3E2F869C3002204c749BD185E9',
    '0xa15803a167A94E5d19F320c7F3b421be4C5CA1B5',
  ];

  newRequest().then( data => { 
    if( data == null ) {
      console.log("Server Error. Please try again later.");
      return;
    }
    const arr = data.data;
   
    for( const d of arr.data ) {
        if( nftAddress.includes( d.ArtistNFTAddress ) )
          numCollections ++;
    }
  });

  if(numCollections > 0)
    globalThis.hasNFT = true;
}

export async function newRequest() {
    const { chainId }  = await provider.getNetwork();
    const url = 'https://moonboxes.io/api/api/userNftData?blockchainId=' + chainId + '&userAddress=' + globalThis.selectedAddress;
    const response = await fetch( url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
    }).then( (response) => {
      if( response.status >= 400 && response.status < 600) {
        console.log("Oops try again later ", response);
        return null;
      }
      return response;
    }).then( (returnedResponse) => {
      return returnedResponse?.json();
    }).catch( (error) => {
       console.log("Oops try again much later:",error);
    });
    return response;
}
  