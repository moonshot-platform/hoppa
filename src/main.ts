import Phaser from 'phaser'
import TestRoom from './scenes/TestRoom'
import Start from './scenes/Start'
import Level1 from './scenes/Level1'
import Level2 from './scenes/Level2'
import Level3 from './scenes/Level3'
import Level4 from './scenes/Level4'
import Level5 from './scenes/Level5'
import Level6 from './scenes/Level6'
import Level7 from './scenes/Level7'
import SelectPlayer from './scenes/SelectPlayer'
import LogoScreen from './scenes/LogoScreen'
import HoppaScreen from './scenes/HoppaScreen'
import UI from './scenes/UI'
import GameOver from './scenes/GameOver'
import Win from './scenes/Win'
import Loader from './scenes/Loader'
import Bonus from './scenes/Bonus'
import Bonus2 from './scenes/Bonus2'
import Pause from './scenes/Pause'
import GameSettingsMenu from './scenes/GameSettingsMenu'
import Help from './scenes/Help'
import Story from './scenes/Story'
import Wallet from './scenes/Wallet'
import Inventory from './scenes/Inventory'
import AdScene from './scenes/AdScene'
import HallOfFame from './scenes/HallOfFame'
import EnterHallOfFame from './scenes/EnterHallOfFame'
import Tournament from './scenes/Tournament'
import HoppaSelect from './scenes/HoppaSelect'
import TournamentIntro from './scenes/TournamentIntro'
import WarpLevel from './scenes/WarpLevel'

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
		gamepad: true,
	},
	scene: [Loader,LogoScreen,AdScene, HoppaScreen,HoppaSelect, Wallet,TournamentIntro,Tournament,HallOfFame,EnterHallOfFame, Inventory,Story,GameSettingsMenu,Help,Start,SelectPlayer,WarpLevel,Level1,Level2,Level3,Level4,Level5,Level6,Level7,Bonus,Bonus2,Win,UI,Pause,GameOver],	
}

window.addEventListener('load', () => {
	window.setTimeout(() => { 
		new Phaser.Game(config);
	}, 3000)
});
