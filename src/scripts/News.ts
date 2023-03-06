import * as Phaser from 'phaser';
import NewsBanner from './NewsBanner';
import * as SceneFactory from '../scripts/SceneFactory'; 

export default class News { 

  private banner1!: NewsBanner;
  private banner2!: NewsBanner;
  private banner3!: NewsBanner;
  private banner4!: NewsBanner;
  private banner5!: NewsBanner;
  private banner6!: NewsBanner;

  private parsedItems;
  constructor(scene: Phaser.Scene ) {
     
    const marginLeft = 4;

    this.banner3 = new NewsBanner(scene, {
        background: [0x000000],
        text: this.getTime(),
        textColor: 0xffffff,
        textSize: 10,
        margin: 4,
        x: marginLeft, 
        y: 320,
        expand: false
    });

    this.banner4 = new NewsBanner(scene, {
        background: [0xfeeb1a],
        text: 'This is some news',
        textColor: 0,
        textSize: 10,
        margin: 4,
        x: marginLeft + 30,
        y: 320,
        expand: true
    });

     this.banner2 = new NewsBanner(scene, {
        background: [0xdedede],
        text: 'This is a headline',
        textColor: 0,
        textSize: 22,
        margin: 8,
        x: marginLeft,
        y: 320 - this.banner4.getBannerHeight() - 1,
        expand: true
    });

    this.banner1 = new NewsBanner(scene, {
        background: [0xd72c24, 0x831a18],
        text: 'BREAKING NEWS',
        textColor: 0xffffff,
        textSize: 18,
        margin: 8,
        x: marginLeft,
        y: 320 - this.banner2.getBannerHeight() + 2,
        expand: false
    });

    this.banner5 = new NewsBanner( scene, {
      background: [0xd72c24],
      text: 'LIVE',
      textColor: 0xffffff,
      textSize: 18,
      margin: 8,
      x: marginLeft,
      y: 16, 
      expand: false
    });

    this.banner6 = new NewsBanner( scene, {
      background: [0x363535],
      text: 'MSHOT NEWSROOM',
      textColor: 0xacacac,
      textSize: 16,
      margin: 8,
      x: 500,
      y: 334,
      expand: false
    });

    this.parsedItems = this.items.map(item => JSON.parse(item));

    this.fetchNews();

    scene.time.addEvent({
      delay: 10000,
      loop: true,
      callback: this.fetchNews,
      callbackScope: this,
    });

  }

  destroy() {
    this.banner1.destroy();
    this.banner2.destroy();
    this.banner3.destroy();
    this.banner4.destroy();
    this.banner5.destroy();
    this.banner6.destroy();
  }

  private fetchNews() {
    
    let parsedItem = this.parsedItems[ SceneFactory.random(0, this.items.length - 1)];
    
    this.banner2.setText( parsedItem.title.toUpperCase() );
    this.banner4.setText( parsedItem.text.toUpperCase() );
    this.banner3.setText( this.getTime() );

  }  

  private getTime() {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return currentTime;
  }

  // Hardcode some news items here, RSS feeds don't work because of CORS and no back-end
  private items = [
    `{
        "title": "Crypto Investors Panic Over 'Meme Coin Apocalypse'",
        "text": "As meme coins continue to flood the market, experts warn of a looming 'meme coin apocalypse'. Panic selling ensues."
    }`,
    `{
        "title": "Bitcoin Plummets After Influencer Reveals Doge Investment",
        "text": "Bitcoin's price drops as popular influencer admits to selling BTC to invest in Dogecoin."
    }`,
    `{
        "title": "Crypto Mining Causes Alien Invasion",
        "text": "Experts link recent surge in extraterrestrial activity to massive energy consumption required for cryptocurrency mining."
    }`,
    `{
        "title": "Crypto Investors Struggle to Keep Up with New Coins",
        "text": "As new cryptocurrencies emerge daily, investors struggle to keep track.Some resort to buying every new coin just in case."
    }`,
    `{
        "title": "Elon Musk's Dog Launches Own Cryptocurrency",
        "text": "In a surprise move, Elon Musk's dog has launched its own cryptocurrency,'Dogecoin for Dogs'. The market eagerly awaits."
    }`,
    `{
      "title": "Dogecoin hits $1",
      "text": "In a stunning turn of events, Dogecoin has reached the $1 mark, leaving many investors speechless."
    }`,
    `{
      "title": "Local man loses life savings",
      "text": "A local man is devastated after losing his entire life savings to a cryptocurrency scam."
    }`,
    `{
      "title": "Ethereum creator found",
      "text": "The real Vitalik Buterin has been found living in a remote village in Russia."
    }`,
    `{
      "title": "Bitcoin price crashes",
      "text": "Bitcoin has experienced a massive price crash, leaving many investors in a state of panic."
    }`,
    `{
      "title": "Crypto exchange hacked",
      "text": "A major cryptocurrency exchange has been hacked, resulting in the loss of millions of dollars worth of assets."
    }`,
    `{
      "title": "NFT of cat meme sells for $500k",
      "text": "In a sign of the times, an NFT of a cat meme has sold for half a million dollars."
    }`,
    `{
      "title": "Crypto mining farm discovered",
      "text": "Authorities have uncovered a massive cryptocurrency mining farm operating illegally in a rural area."
    }`,
    `{
      "title": "Crypto regulations introduced",
      "text": "New regulations governing the use of cryptocurrencies have been introduced by the government."
    }`,
    `{
      "title": "Bitcoin billionaire goes bankrupt",
      "text": "A well-known Bitcoin billionaire has declared bankruptcy after losing his entire fortune to bad investments."
    }`,
    `{
      "title": "Ethereum flips Bitcoin",
      "text": "For the first time ever, ETH has surpassed BTC in market capitalization, causing shockwaves throughout the industry."
    }`,
    `{
      "title": "Crypto conference cancelled",
      "text": "A major cryptocurrency conference has been cancelled due to concerns over COVID-19."
    }`,
    `{
      "title": "Local business accepts Bitcoin",
      "text": "A local business has started accepting Bitcoin as a form of payment, much to the delight of crypto enthusiasts."
    }`,
    `{
      "title": "Crypto startup raises $10 million",
      "text": "A new cryptocurrency startup has raised $10 million in funding from a group of prominent investors."
    }`,
    `{
      "title": "Crypto investment fund launched",
      "text": "A new investment fund focused on cryptocurrencies has been launched, attracting interest from institutional investors."
    }`,
    `{
      "title": "Bitcoin price hits all-time high",
      "text": "Bitcoin has reached a new all-time high, prompting predictions of even further growth in the coming months."
    }`,
    `{
      "title": "Crypto market crashes",
      "text": "The entire cryptocurrency market has experienced a major crash, wiping out billions of dollars in value."
    }`,
    `{
      "title": "Crypto millionaire gives back",
      "text": "A wealthy crypto investor has pledged to donate a portion of his fortune to charity."
    }`,
    `{
      "title": "Crypto exchange goes offline",
      "text": "A major cryptocurrency exchange has gone offline, leaving many users unable to access their funds."
    }`,
    `{
      "title": "Crypto wallet hacked",
      "text": "A popular cryptocurrency wallet has been hacked, resulting in the theft of millions of dollars worth of assets."
    }`,       
    `{
      "title": "Crypto ad banned",
      "text": "A controversial cryptocurrency ad has been banned from airing on television."
    }`,
    `{
      "title": "Crypto used for money laundering",
      "text": "Authorities have uncovered a major money laundering operation using cryptocurrencies."
    }`,
    `{
      "title": "Bitcoin accepted at major retailer",
      "text": "A major retailer has started accepting Bitcoin as a form of payment, signaling a shift towards mainstream adoption."
    }`,
    `{
      "title": "Crypto mining now profitable",
      "text": "After months of losses, cryptocurrency mining has become profitable again due to rising prices."
    }`,
    `{
      "title": "Crypto artist gains fame",
      "text": "A little-known artist who creates NFTs has gained widespread fame and fortune in the crypto community."
    }`,
    `{
      "title": "Crypto used to buy real estate",
      "text": "A luxury real estate property has been purchased using Bitcoin, marking a significant milestone for the industry."
    }`,
    `{
      "title": "Crypto investor becomes youngest billionaire",
      "text": "A teenage crypto investor has become the youngest billionaire in history after a massive price surge in his portfolio."
    }`,
    `{
      "title": "Crypto used to fundraise for charity",
      "text": "A charity fundraiser using cryptocurrencies has raised millions of dollars for a worthy cause."
    }`,
    `{
      "title": "Crypto exchange expands to new markets",
      "text": "A major cryptocurrency exchange has announced plans to expand its services to new markets in the coming months."
    }`,
    `{
      "title": "Dogecoin founder adopts Shiba Inu",
      "text": "Believes it will bring luck to new crypto venture."
    }`,
    `{
      "title": "Crypto enthusiasts turn to potato mining",
      "text": "Tubers discovered to be more valuable than expected."
    }`,
    `{
      "title": "Man loses fortune on NFT of his own sneeze",
      "text": "Bidding war leaves him with nothing but allergies."
    }`,
    `{
      "title": "Crypto bros trade pizza for Dogecoin",
      "text": "Say it's the ultimate currency for fast food purchases."
    }`,
    `{
      "title": "Experts predict rise of Purr-fect coin",
      "text": "Cat lovers eagerly await feline-themed crypto."
    }`,
    `{
      "title": "Crypto millionaire buys moon with Bitcoin",
      "text": "Elon Musk denies any involvement, calls it 'lunacy'."
    }` ,
    `{
      "title": "Bitcoin now accepted at Area 51 gift shop",
      "text": "Alien merchandise sales skyrocket as crypto gains popularity."
    }`,
    `{
      "title": "Woman turns NFT collection into wedding ring",
      "text": "Says it's a symbol of love and decentralization."
    }`,
  `{
    "title": "Crypto investor becomes space tourist",
    "text": "Says crypto profits were out of this world."
  }`,
  `{
    "title": "Blockchain used to track Bigfoot sightings",
    "text": "Crypto enthusiasts turn their attention to cryptozoology."
  }`,
  `{
    "title": "Investor loses fortune on meme crypto",
    "text": "Says he didn't realize it was just a joke."
  }`,
  `{
    "title": "Crypto used to buy naming rights for newborn",
    "text": "Parents hope it will pay for college someday."
  }`,
  `{
    "title": "Dogecoin now accepted at pet stores",
    "text": "Dogecoin holders rejoice, can now buy dog food with DOGE."
  }`,
  `{
    "title": "Bitcoin mine discovered in abandoned pizza shop",
    "text": "Crypto miners say it's the cheesiest find of the century."
  }`,
  `{
    "title": "Crypto expert predicts rise of 'HODL coin'",
    "text": "Says it's the ultimate hodler's dream come true."
  }`,
 `{
    "title": "Investor accidentally sends crypto to wrong address",
    "text": "Says he should have used copy and paste instead of typing it out."
  }`,
 `{
    "title": "Crypto used to buy pirate treasure map",
    "text": "Investor says he's taking a chance on X marks the spot."
  }`,
 `{
    "title": "Crypto used to buy entire town",
    "text": "Investor says he plans to rename it Crypto City."
  }`,
 `{
    "title": "Crypto guru predicts end of fiat currency",
    "text": "Says it's time for the dollar to be decentralize or die."
  }`,
 `{
    "title": "Crypto used to fund search for Bigfoot",
    "text": "Investors hope to find the cryptozoological creature and profit from it."
  }`,
 `{
    "title": "Crypto investor builds mansion entirely out of Bitcoin",
    "text": "Says it's the ultimate symbol of crypto success."
  }`,
 `{
    "title": "Investor loses fortune on 'Meme of the Month' crypto",
    "text": "Says he should have known better than to invest in a meme."
  }`,
  `{
    "title": "Institutional Money Pours In",
    "text": "Large financial firms invest billions in Bitcoin and other cryptos."
   }`,
  `{
    "title": "Crypto Adoption Skyrockets",
    "text": "Major retailers announce plans to accept cryptocurrencies as payment."
   }`,
  `{
    "title": "Crypto Becomes Safe Haven",
    "text": "As stock market plunges, investors flock to Bitcoin and other cryptos."
   }`,
  `{
    "title": "DeFi Revolutionizes Finance",
    "text": "Decentralized finance projects attract billions in investment."
   }`,
  `{
    "title": "Crypto Regulations Favorable",
    "text": "New regulations support the growth of the crypto industry."
   }`,
  `{
    "title": "Crypto Industry Booms",
    "text": "Record-breaking volumes and market caps show crypto is here to stay."
   }`,
  `{
    "title": "Major companies accept crypto",
    "text": "Experts predict widespread adoption within next 5 years"
  }`,
  `{
    "title": "Crypto mining profits soar",
    "text": "Rising demand for mining hardware drives up prices"
  }`,
  `{
    "title": "Decentralized exchange booms",
    "text": "Trading volume exceeds centralized exchanges for first time"
  }`,
  `{
    "title": "Crypto hedge funds outperform",
    "text": "Investors flock to high-risk, high-reward crypto funds"
  }`,
  `{
    "title": "Central banks explore crypto",
    "text": "Industry insiders predict crypto will replace SWIFT within a decade"
  }`,
  `{
    "title": "Crypto community celebrates",
    "text": "Major scaling solution goes live; Fees drop to all-time lows"
  }`,
  `{
    "title": "Crypto regulations become lenient",
    "text": "Governments embrace the industry; Investors embrace bullish sentiment"
  }`,
  `{
    "title": "Crypto projects see massive adoption",
    "text": "NFTs explode in popularity; Artists and creators earn millions"
  }`,
  `{
    "title": "Altcoin market sees massive bull run",
    "text": "Newly-minted crypto millionaires emerge as coins like Dogecoin skyrocket"
  }`,
  `{
    "title": "Crypto market reaches new all-time high",
    "text": "Investors rejoice as Bitcoin hits $100K"
  }`,
  `{
    "title": "Ethereum 2.0 goes live",
    "text": "Scalability and security upgrades drive price surge"
  }`,
  `{
    "title": "Institutional adoption skyrockets",
    "text": "Major banks and corporations invest billions in crypto"
  }`,
  `{
    "title": "Crypto regulation clears uncertainty",
    "text": "Investors gain confidence as governments embrace crypto"
  }`,
  `{
    "title": "Crypto exchange breaks trading volume record",
    "text": "Market volatility leads to surge in trading activity"
  }`,
  `{
    "title": "New crypto unicorn emerges",
    "text": "Startup reaches $1 billion valuation in record time"
  }`,
  `{
    "title": "Crypto payments go mainstream",
    "text": "Major retailers accept Bitcoin and other cryptocurrencies"
  }`,
  `{
    "title": "Crypto market cap hits $5 trillion",
    "text": "Experts predict continued growth in 2023"
  }`,
  `{
    "title": "Crypto market dominates finance",
    "text": "Traditional finance industry struggles to keep up"
  }`,
  `{
    "title": "Bitcoin named 'asset of the year'",
    "text": "Investors reap massive profits from cryptocurrency"
  }`,
  `{
    "title": "Crypto influencer predicts",
    "text": "Moon will be reached by December."
  }`,
  `{
    "title": "Crypto conference attendee",
    "text": "Mistakes Elon Musk for Satoshi Nakamoto."
  }`,
  `{
    "title": "Crypto trader admits",
    "text": "Lost all savings on Dogecoin."
  }`,
  `{
    "title": "Crypto exchange hacked",
    "text": "Hackers stole $100M in worthless tokens."
  }`,
  `{
    "title": "Crypto investor",
    "text": "Pays $1M for a tweet from Elon Musk about Bitcoin."
  }`,
  `{
    "title": "Crypto startup founder",
    "text": "Tells investors 'we'll make you rich!' in whitepaper."
  }`,
  `{
    "title": "Crypto whale",
    "text": "Sells entire portfolio for a single NFT of a banana."
  }`,
  `{
    "title": "Bitcoin pizza guy' revealed to be a time traveler",
    "text": "'I thought it was 2010, I had no idea Bitcoin would be worth so much,' he explains."
   }`,
  `{
    "title": "Crypto investors shocked",
    "text": "ICO was Nigerian Prince scam"
  }`,
  `{
    "title": "Investor millionaire accident",
    "text": "buys wrong coin, makes fortune"
  }`,
  `{
    "title": "Ethereum Smart Contracts: The Future of Finance?",
    "text": "Ethereum's smart contract capabilities have the potential to revolutionize the financial industry."
  }`,
  `{
    "title": "Ethereum Smart Contracts: The Lawyers' Nightmare",
    "text": "Ethereum's smart contracts: the future of finance or the lawyers' nightmare? As the code rules, legal disputes drop."
  }`,
  `{
    "title": "Crypto Zombies Rise, Bitcoin Leads the Horde",
    "text": "Crypto zombies rise from the grave, led by Bitcoin's undead army. HODLers stock up on weapons and memes."
  }`,
  `{
    "title": "Ethereum Gas Fees Skyrocket, Turn to Bike-Powered Mining",
    "text": "Ethereum gas fees skyrocket, prompting crypto users to turn to bike-powered mining. Green energy or sweaty desperation?"
  }`,
  `{
    "title": "Crypto Investors Go Bananas for Monkeycoin",
    "text": "Crypto investors go bananas for Monkeycoin. As the market swings, will they hold on or fling their poo?"
  }`,
  `{
    "title": "Crypto Influencers Fight to Be Queen Bee of Honeycoin",
    "text": "Crypto influencers fight to be queen bee of Honeycoin. The hive is buzzing, as they compete for sweet success."
  }`,
  `{
    "title": "Crypto Experts Discover New Altcoin: Chuck Norriscoin",
    "text": "Crypto experts discover new altcoin: Chuck Norriscoin. The value can't be measured in dollars, only roundhouse kicks."
  }`,
  `{
    "title": "Crypto Exchange Hacked, Hackers Steal All the Garlicoin",
    "text": "Crypto exchange hacked, hackers steal all the Garlicoin. Italian grandmothers everywhere are outraged."
  }`,
  `{
    "title": "Crypto Investors Panic Sell, Stock Up on Ramen Noodles",
    "text": "Crypto investors panic sell, stocking up on Ramen noodles. The college student diet goes mainstream."
  }`,
  `{
    "title": "AI Develops Sense of Humor, Humans Still Dont Find it Funny",
    "text": "AI develops sense of humor, humans still don't find it funny. Looks like the robots still have some work to do!"
  }`,
 `{
  "title": "Crypto Investor Buys Lamborghini, Forgets Keys on Blockchain",
  "text": "Crypto investor buys Lamborghini, forgets keys on blockchain. Looks like he needs to mine some more memory."
  }`,

  ];
}