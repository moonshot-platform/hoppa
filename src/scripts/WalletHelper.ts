import { ethers } from "ethers";

declare global {
    var moonshotBalance: number;
    var ra8bitBalance: number;
    var selectedAddress: string;
    var provider: ethers.providers.Web3Provider;
    var signer: ethers.providers.JsonRpcSigner;
    var noWallet: boolean;

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
        
    (window.ethereum as any).on( 'accountsChanged', function(accounts) {
      globalThis.selectedAddress = accounts[0];
      getCurrentAccount();
    });

    globalThis.moonshotBalance = 0;
    globalThis.ra8bitBalance = 0;
    globalThis.selectedAddress = "0x0";

    console.log("Initialized wallet provider ", globalThis.provider);
}

export async function getCurrentAccount() {
    if( globalThis.noWallet )
        return;

    await globalThis.provider.send("eth_requestAccounts", []);
    console.log("requested accounts");
    globalThis.signer = globalThis.provider.getSigner();
    console.log("requested signer");
    // save the currently connected address
    globalThis.selectedAddress = await globalThis.signer.getAddress();
    
    const abi = [
        "function balanceOf(address account) external view returns (uint256)"
    ];
    
    // save the current balances of Moonshot and Ra8bit tokens
    let moonshotContract = new ethers.Contract("0x5298ad82dd7c83eeaa31dda9deb4307664c60534", abi , globalThis.signer );     
    globalThis.moonshotBalance = await moonshotContract.balanceOf( globalThis.selectedAddress );

    let ra8bitContract = new ethers.Contract("0x27424eE307488cA414f430b84A10483344E6d80a", abi , globalThis.signer );    
    globalThis.ra8bitBalance = await ra8bitContract.balanceOf( globalThis.selectedAddress );

}
