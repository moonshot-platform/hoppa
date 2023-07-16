import { ethers, BigNumber } from "ethers";

const ERR_NO_WALLET = "No wallet found or permission denied";

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
    var totalTokensStaked: number;
    var allowance: number;
    var leavePenalty: number;
    var spawnLocation: number;
    interface Window {
        ethereum: import('ethers').providers.ExternalProvider;
    }
}

const hoppaTournamentContract = "0x4898e671d3d976fcE233d8C016278d493F99Cee3";
const moonshotTokenContract   = "0x5298ad82dd7c83eeaa31dda9deb4307664c60534";
const rabbitTokenContract     = "0x27424eE307488cA414f430b84A10483344E6d80a";
const hoppaCardsContract      = "0xb8eB97a1d6393B087EEACb33c3399505a3219d3D";
const rabbitFaucetContract    = "0x5620AF88096762868150100FA21797eCB49c5759";
const moonshotFaucetContract  = "0x23737b74C1026a8F3A038Af0F9752b7cbd75A76C";
const hallOfFameContract      = "0x9d811D1600236cE2874A1f3cA2E7318cABe2DB7d";

export function init() {

    if( window.ethereum === undefined) {
        globalThis.noWallet = true;
        console.log("No wallet installed");
        return;
    }

    globalThis.provider = new ethers.providers.Web3Provider(window.ethereum);
    globalThis.moonshotBalance = 0;
    globalThis.ra8bitBalance = 0;
    globalThis.changeEvent = 0;
    globalThis.adReturn = "hoppa";
    globalThis.selectedAddress = "0x000000000000000000000000000000000000dead";
    
    (window.ethereum as any).on( 'accountsChanged', function(accounts) {
      if( accounts.length > 0 ) {
        getCurrentAccount();
        getMyNFTCollections();
        findCards();
        isArenaPlayer();
        globalThis.changeEvent ++;
      }
    });

    (window.ethereum as any).on( 'network', (newNet,oldNet) => {
      if(newNet.chainId == 56) {
        getCurrentAccount();
        getMyNFTCollections();
        findCards();
        isArenaPlayer();
        globalThis.changeEvent ++;
      }
    });

    (window.ethereum as any).on( 'disconnect', (code,reason) => {
      if( globalThis.provider && globalThis.provider.close )
          globalThis.provider.close();
    });

    findCards();
    isArenaPlayer();
}

export async function requestAccounts() {
  try { 
    await globalThis.provider.send("eth_requestAccounts", []);
  
    globalThis.signer = globalThis.provider.getSigner();
    
    globalThis.selectedAddress = await globalThis.signer.getAddress();
    
    globalThis.noWallet = false;
  }
  catch(e) {
    globalThis.noWallet = true;
    console.log(e);
  }
  
}

export async function disconnectAccount() {
  if( globalThis.noWallet ) {
    return;
 }

 if( globalThis.provider && globalThis.provider.close )
     globalThis.provider.close();
}

export async function getCurrentAccount() {
    if( globalThis.noWallet ) {
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
        "function balanceOf(address account) external view returns (uint256)",
    ];
    
    // save the current balances of Moonshot and Ra8bit tokens
    const moonshotContract = new ethers.Contract(moonshotTokenContract, abi , globalThis.signer );     
    globalThis.moonshotBalance = await moonshotContract.balanceOf( globalThis.selectedAddress );

    const ra8bitContract = new ethers.Contract(rabbitTokenContract, abi , globalThis.signer );    
    globalThis.ra8bitBalance = await ra8bitContract.balanceOf( globalThis.selectedAddress );
    
}

export async function getMSHOTBalanceOfTournamentContract(): Promise<string> {
  if( globalThis.noWallet ) {
     return ERR_NO_WALLET;
  }

  await requestAccounts();

  
  const abi = [
      "function balanceOf(address account) external view returns (uint256)",
  ];
  
  // save the current balances of Moonshot and Ra8bit tokens
  const moonshotContract = new ethers.Contract(moonshotTokenContract, abi , globalThis.signer );     
  let val = await moonshotContract.balanceOf( hoppaTournamentContract );
  val = uint256Tonumber(val);
  return val;
}

export async function findCards() {
  
  await requestAccounts();
  
  const abi = [
      "function balanceOf(address _owner, uint256 _id) external view returns (uint256)",
  ];

  const c = new ethers.Contract(hoppaCardsContract, abi , globalThis.signer );
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

  await requestAccounts();

  if( globalThis.noWallet )
    return ERR_NO_WALLET;
  
  const abi = [
      "function canWithdraw(address addr) public view returns (bool)",
      "function getFreeRa8bit() external"
  ];

  const faucetContract = new ethers.Contract(rabbitFaucetContract, abi , globalThis.signer );     
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
 
  await requestAccounts();

  if( globalThis.noWallet ) {
    return "No wallet found";
  }
 
  const abi = [
      "function canWithdraw(address addr) public view returns (bool)",
      "function getFreeMoonshot() external"
  ];

  const faucetContract = new ethers.Contract(moonshotFaucetContract, abi , globalThis.signer );     
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
  
  await requestAccounts();

  if( globalThis.noWallet )
    return ERR_NO_WALLET;
  
  const abi = [
      "function updateScore(string memory initials, uint256 score) public",
  ];

  const hallOfFame = new ethers.Contract(hallOfFameContract, abi , globalThis.signer );

  try {
    const tx = await hallOfFame.updateScore( name, score );
    await tx.wait();
  }
  catch( error: any ) {
    return error.reason;
  }

  return "OK";
}

const hallOfFameABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"}],"name":"GameMakerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"}],"name":"GameMakerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"},{"indexed":false,"internalType":"uint8","name":"position","type":"uint8"}],"name":"HighscoreRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"maker","type":"address"}],"name":"HighscoreReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"initials","type":"string"},{"indexed":false,"internalType":"uint256","name":"score","type":"uint256"},{"indexed":false,"internalType":"address","name":"player","type":"address"}],"name":"HighscoreUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"gamemaker","type":"address"}],"name":"addGameMaker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"clearHallOfFame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"gameMakers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getHallOfFame","outputs":[{"components":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"score","type":"uint256"},{"internalType":"string","name":"initials","type":"string"}],"internalType":"struct HallOfFame.HighScores[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"hallOfFame","outputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"score","type":"uint256"},{"internalType":"string","name":"initials","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"gamemaker","type":"address"}],"name":"removeGameMaker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"score","type":"uint256"}],"name":"removeScore","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"initials","type":"string"},{"internalType":"uint256","name":"score","type":"uint256"}],"name":"updateScore","outputs":[],"stateMutability":"nonpayable","type":"function"}];


export async function getHighscores(): Promise<string> {

  await requestAccounts();

  if( globalThis.noWallet )
    return ERR_NO_WALLET;
  
 
  const hallOfFame = new ethers.Contract(hallOfFameContract, hallOfFameABI , globalThis.signer );

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
  await requestAccounts();

  if( globalThis.noWallet )
    return false;

  await globalThis.provider.send("eth_requestAccounts", []);
  globalThis.signer = globalThis.provider.getSigner();
  // save the currently connected address
  globalThis.selectedAddress = await globalThis.signer.getAddress();
 
  const hallOfFame = new ethers.Contract(hallOfFameContract, hallOfFameABI , globalThis.signer );

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

const hoppaTournamentABI = 
     [{"inputs":[{"internalType":"address","name":"_tokenContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ApprovedTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newPenaltyPercentage","type":"uint256"}],"name":"DeserterPenaltyChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"}],"name":"EnterArena","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"gamemaker","type":"address"}],"name":"GameMakerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"gamemaker","type":"address"}],"name":"GameMakerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"player","type":"address"}],"name":"LeaveArena","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"player","type":"address"}],"name":"PlayerRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"SelectWinner","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newTokenContract","type":"address"}],"name":"SetTokenAddress","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"endAt","type":"uint256"}],"name":"TournamentOpenUntil","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newWinnerPercentage","type":"uint256"}],"name":"WinnerPercentageChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"WithdrawBNB","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"tokenContractAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"WithdrawTokens","type":"event"},{"inputs":[{"internalType":"address","name":"_gameMaker","type":"address"}],"name":"addGameMaker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"closeArena","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"enterArena","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"estimateReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"estimateUnstakeAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"gameEndTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"gameMakers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getClosingDate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentStake","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPenaltyPercentage","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalAmountStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalPlayers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWinningsPercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hasJoined","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isGameMaker","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isUnderPenalty","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"leaveArena","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"daysDuration","type":"uint256"}],"name":"openArena","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"penaltyPercentage","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"playerHasJoined","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_gameMaker","type":"address"}],"name":"removeGameMaker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"removePlayer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_winner","type":"address"}],"name":"selectWinner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"winners","type":"address[]"}],"name":"selectWinners","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"penalty","type":"uint8"}],"name":"setPenaltyPercentage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newTokenContract","type":"address"}],"name":"setTokenAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"winnings","type":"uint256"}],"name":"setWinnerPercentage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stakedTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenContract","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalPlayers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTokensStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"winnerPercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawBNB","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContractAddress","type":"address"}],"name":"withdrawTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}];

export async function isArenaPlayer(): Promise<boolean> {
  await requestAccounts();

  if( globalThis.noWallet )
    return false;
    
  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    let v = await hoppaTournament.hasJoined( );
    if(v) {
      globalThis.hasNFT = true; // to allow user in, if entire balance is staked
    }
    return v;
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return false;
  }
}

export async function isArenaUnderPenalty(): Promise<boolean> {
  await requestAccounts();

  if( globalThis.noWallet )
    return false;
    
  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    return await hoppaTournament.isUnderPenalty( );
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return false;
  }
}

export async function getGameEndTime(): Promise<number> {

  await requestAccounts();

  if( globalThis.noWallet )
    return 0;
    
  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    let val = await hoppaTournament.gameEndTime();
    val = parseInt( val.toString() );
    return val;
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return 0;
  }
}

export async function getTotalAmountStaked(): Promise<string> {
  await requestAccounts();

  if( globalThis.noWallet )
    return "";
    
  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    let val = await hoppaTournament.getTotalAmountStaked();
    val = uint256Tonumber(val);
    globalThis.totalTokensStaked = val;
    return val;
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return "";
  }
}

export async function getMyStake(): Promise<string> {
  await requestAccounts();

  if( globalThis.noWallet )
    return "";
    
  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    let val = await hoppaTournament.getCurrentStake();
    val = uint256Tonumber(val);
    return val;
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return "";
  }
}


export async function getPenaltyPercentage(): Promise<string> {
  await requestAccounts();

  if( globalThis.noWallet )
    return "";
    
  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    let val = await hoppaTournament.getPenaltyPercentage();
    globalThis.leavePenalty = val;
    return val;
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return "";
  }
}



export async function getEstimatedReward(): Promise<string> {
  await requestAccounts();

  if( globalThis.noWallet )
    return "";
    
  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    let staked = await hoppaTournament.getTotalAmountStaked();
    staked = uint256Tonumber(staked);
    if( staked > 0 ) {
        let val = await hoppaTournament.estimateReward();
        val = uint256Tonumber(val);
        return val;
    }
    return "0";
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return "";
  }
}

export async function getEstimatedUnstakedAmount(): Promise<string> {
  await requestAccounts();

  if( globalThis.noWallet )
    return "";
    
  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    let val = await hoppaTournament.estimateUnstakeAmount();
    val = uint256Tonumber(val);
    return val;
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return "";
  }
}

export async function getTotalPlayers(): Promise<string> {
  await requestAccounts();

  if( globalThis.noWallet )
    return "";
    
  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    let val = await hoppaTournament.getTotalPlayers();
    return val;
  }
  catch( error: any ) {
    console.log( "error " + error.reason );
    return "";
  }
}

export async function enterArena( amount ): Promise<string> {
  await requestAccounts();

  if( globalThis.noWallet )
    return "";

  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    const bigAmount = numberToUint256( amount );   
    const tx = await hoppaTournament.enterArena( bigAmount );
    await tx.wait();
  }
  catch( error: any ) {
    return error.reason;
  }

  return "OK";
}

export async function leaveArena(): Promise<string> {
  await requestAccounts();

  if( globalThis.noWallet )
    return "";

  const hoppaTournament = new ethers.Contract(hoppaTournamentContract, hoppaTournamentABI , globalThis.signer );

  try {
    const tx = await hoppaTournament.leaveArena();
    await tx.wait();
  }
  catch( error: any ) {
    return error.reason;
  }

  return "OK";
}

export async function isArenaApproved(amount): Promise<boolean> {
  await requestAccounts();

  if( globalThis.noWallet )
    return false;

  const abi = [
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)"
  ];
  const moonshotContract = new ethers.Contract("0x5298ad82dd7c83eeaa31dda9deb4307664c60534", abi , globalThis.signer );     


  try {
    const allowance = await moonshotContract.allowance( globalThis.selectedAddress, hoppaTournamentContract );
    globalThis.allowance =  uint256Tonumber(allowance);
    if( allowance < numberToUint256(amount) ) {
      return false;
    }
    return true; 
  }
  catch( error: any ) {
    return error.reason;
  }
}

export async function approveForArena(amount): Promise<string> {
  await requestAccounts();

  if( globalThis.noWallet )
    return "";

  const abi = [
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)"
  ];
  const moonshotContract = new ethers.Contract(moonshotTokenContract, abi , globalThis.signer );     


  try {

    const tx = await moonshotContract.approve( hoppaTournamentContract, numberToUint256(amount) );
    await tx.wait();
  }
  catch( error: any ) {
    return error.reason;
  }

  return "OK";
}


function numberToUint256(value: number): BigNumber {
  
  return ethers.utils.parseUnits( value.toString(), 9 );
}

function uint256Tonumber(big: BigNumber): number {

  return parseInt( big.toString() ) / 1e9;

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