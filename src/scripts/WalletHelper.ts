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
    globalThis.selectedAddress = "0x000000000000000000000000000000000000dead";
    
    (window.ethereum as any).on( 'accountsChanged', function(accounts) {
      if( accounts.length > 0 ) {
        getCurrentAccount();
        getMyNFTCollections();
      }
    });

    (window.ethereum as any).on( 'network', (newNet,oldNet) => {
      if(newNet.chainId == 56) {
        getCurrentAccount();
        getMyNFTCollections();
      }
    });

    console.log("Initialized wallet provider ", globalThis.provider);
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
    const url = 'https://moonboxes.io/api/api/userData?NSFW=undefined&userAddress=' + globalThis.selectedAddress;
    const { chainId }  = await provider.getNetwork();
    const response = await fetch( url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'blockchainId': ""  + chainId,
      },
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
  