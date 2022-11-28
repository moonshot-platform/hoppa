import Phaser from 'phaser'

import Start from './scenes/Start'
import Level1 from './scenes/Level1'
import Level2 from './scenes/Level2'
import Level3 from './scenes/Level3'
import LogoScreen from './scenes/LogoScreen'
import HoppaScreen from './scenes/HoppaScreen'
import UI from './scenes/UI'
import GameOver from './scenes/GameOver'
import Win from './scenes/Win'
import Loader from './scenes/Loader'
import Bonus from './scenes/Bonus'
import Pause from './scenes/Pause'
import GameSettingsMenu from './scenes/GameSettingsMenu'
import Help from './scenes/Help'
import Story from './scenes/Story'
import Wallet from './scenes/Wallet'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	width: 1280,
	height: 720,
	render: {
		pixelArt: true,
		antialias: false,
		antialiasGL: false,
	},
	physics: {
		default: 'matter',
		matter: {
			gravity: { y: 2 },
			debug: false,
			runner: {
				isFixed: true,
				fps: 60
			}
		},
		
	},
	fps: {
		target: 30,
		forceSetTimeOut: false
	},
	input: {
		activePointers: 4,
	},
	scene: [ Loader,LogoScreen, HoppaScreen,Story, Wallet, GameSettingsMenu,Help, Start, Level1,Level2,Level3,Bonus, Win, UI,  Pause, GameOver],	
}

window.addEventListener('load', () => {
	window.setTimeout(() => {
	  
	  if( 'serviceWorker' in navigator ) {
		navigator.serviceWorker.register('sw.js',  { scope: "/hoppa/" } )
			.then( function(r) {
				console.log("Registered service worker ", r.scope);
			})
			.catch(function(e) {
				console.log("Service worker failed registration: ", e);
			});
	   }

	   new Phaser.Game(config);
	}, 2000)
});
