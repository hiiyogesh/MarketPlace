import "./App.css";
import idl from "./idl.json";
import nftdata from './NFT.json';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, transfer } from  "@solana/spl-token";
import { Connection, PublicKey, clusterApiUrl , Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {AnchorProvider} from "@project-serum/anchor";
import FrontComponent from './frontComponent';



// import {
// 	Program,
// 	AnchorProvider,
// 	web3,
// 	utils,
// 	BN,
// } from "@project-serum/anchor";
import { useEffect, useState ,useMemo} from "react";
import { Buffer } from "buffer";
import WalletComponent from "./wallet";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    GlowWalletAdapter,
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    //TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider , useConnection, useWallet} from '@solana/wallet-adapter-react';
import { WalletModalProvider , WalletMultiButton} from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');

window.Buffer = Buffer;

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
	preflightCommitment: "processed",
};
// const { SystemProgram } = web3;

const App = () => {

	const solNetwork = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
    // initialise all the wallets you want to use
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ solNetwork }),
           // new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletExtensionWalletAdapter(),
            new SolletWalletAdapter(),
        ],
        [solNetwork]
    );
     
	const MyComponent = () => {
		const { connection } = useConnection();
		const { publicKey, sendTransaction } = useWallet();
		
		return (
			<div>
				<WalletMultiButton />
			</div>
		)
	}

	const [fromWallet, setFromWallet] = useState(null);
	const [walletAddress, setWalletAddress] = useState(null);
	const [connection, setConnection] = useState(null);
	const [campaigns, setCampaigns] = useState([]);
	const getProvider = () => {
		
		const connection = new Connection(network, opts.preflightCommitment);
		const provider = new AnchorProvider(
			connection,
			window.solana,
			opts.preflightCommitment
		);
		return provider;
	};
	const checkIfWalletIsConnected = async () => {
		try {
      debugger;
			const { solana } = window;
			if (solana) {
				if (solana.isPhantom) {
					console.log("Phantom wallet found!");
					const response = await solana.connect({
						onlyIfTrusted: true,
					});
					console.log(
						"Connected with public key:",
						response.publicKey.toString()
					);
					setWalletAddress(response.publicKey.toString());
			
				}
			} else {
				alert("Solana object not found! Get a Phantom wallet");
			}
		} catch (error) {
			console.error(error);
		}
	};
    
	const butDirect = async ()=> {
           // Connect to cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Generate a new wallet keypair and airdrop SOL
    const fromWallet = Keypair.generate();
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);

    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature);

    // Generate a new wallet to receive newly minted token
    const toWallet = Keypair.generate();
	const toAirdropSignature = await connection.requestAirdrop(toWallet.publicKey, LAMPORTS_PER_SOL);

    // Wait for airdrop confirmation
    await connection.confirmTransaction(toAirdropSignature);
    console.log("To wallet", toWallet);
	console.log("To wallet Public Key",toWallet.publicKey.toString());
    // Create new token mint
    const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);

    // Get the token account of the fromWallet address, and if it does not exist, create it
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );

    // Get the token account of the toWallet address, and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey);

    // Mint 1 new token to the "fromTokenAccount" account we just created
    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        fromWallet.publicKey,
        1000000000
    );
    console.log('mint tx:', signature);

    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        50
    );
	};

	const buyNFT = async () => {
		const connection = new Connection(network, opts.preflightCommitment);
		// Generate a new wallet keypair and airdrop SOL
		const fromWallet = Keypair.generate();
		const fromAirdropSignature = await connection.requestAirdrop(
		  fromWallet.publicKey,
		  LAMPORTS_PER_SOL
		);
	  
		// Wait for airdrop confirmation
		await connection.confirmTransaction(fromAirdropSignature);
	  
		// Create a new token 
		const mint = await createMint(
		  connection, 
		  fromWallet,            // Payer of the transaction
		  fromWallet.publicKey,  // Account that will control the minting 
		  null,                  // Account that will control the freezing of the token 
		  0                      // Location of the decimal place 
		);
		
	   console.log("Mint Token:",mint.toString()); 
		// Get the token account of the fromWallet Solana address. If it does not exist, create it.
		const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
		  connection,
		  fromWallet,
		  mint,
		  fromWallet.publicKey
		);
		console.log("From Token Account:",fromWallet.publicKey.toString());
		// Generate a new wallet to receive the newly minted token
		const toWallet = new PublicKey(walletAddress.publicKey);//Keypair.generate();
	  
		// Get the token account of the toWallet Solana address. If it does not exist, create it.
		const toTokenAccount = await getOrCreateAssociatedTokenAccount(
		  connection,
		  fromWallet,
		  mint,
		  toWallet
		);
		console.log("To Token Account:",toWallet.toString());
		// Minting 1 new token to the "fromTokenAccount" account we just returned/created.
		let signature = await mintTo(
		  connection,
		  fromWallet,               // Payer of the transaction fees 
		  mint,                     // Mint for the account 
		  fromTokenAccount.address, // Address of the account to mint to 
		  fromWallet.publicKey,     // Minting authority
		  1                         // Amount to mint 
		);
	  
		await setAuthority(
		  connection,
		  fromWallet,            // Payer of the transaction fees
		  mint,                  // Account 
		  fromWallet.publicKey,  // Current authority 
		  0,                     // Authority type: "0" represents Mint Tokens 
		  null                   // Setting the new Authority to null
		);
	  
		signature = await transfer(
		  connection,
		  fromWallet,               // Payer of the transaction fees 
		  fromTokenAccount.address, // Source account 
		  toTokenAccount.address,   // Destination account 
		  fromWallet.publicKey,     // Owner of the source account 
		  1                         // Number of tokens to transfer 
		);
		/*  try{
			
			//const connection = new Connection(network, opts.preflightCommitment);
			// Create new token mint
			const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);

			// Get the token account of the fromWallet address, and if it does not exist, create it
			const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
				connection,
				fromWallet,
				mint,
				fromWallet.publicKey
			);
            const provider = getProvider();
			// Get the token account of the toWallet address, and if it does not exist, create it
			const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, provider.wallet.publicKey);

			// Mint 1 new token to the "fromTokenAccount" account we just created
			let signature = await mintTo(
				connection,
				fromWallet,
				mint,
				fromTokenAccount.address,
				fromWallet.publicKey,
				1000000000
			);
			console.log('mint tx:', signature);

			// Transfer the new token to the "toTokenAccount" we just created
			signature = await transfer(
				connection,
				fromWallet,
				fromTokenAccount.address,
				toTokenAccount.address,
				fromWallet.publicKey,
				50
			);

			
		  }
		  catch(error){
			console.log(error);
		  }
		  */
		    
	}

	const createFromWallet = async () => {
		const connection = new Connection(network, opts.preflightCommitment);
		// Generate a new wallet keypair and airdrop SOL
		const fromWallet = Keypair.generate();
		const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
	 
		// Wait for airdrop confirmation
		await connection.confirmTransaction(fromAirdropSignature);
		console.log("From Wallet Key",fromWallet.publicKey.toString());
		setFromWallet(fromWallet); 
		setConnection(connection);
	}
	const connectWallet = async () => {
		const { solana } = window;
		if (solana) {
			//createFromWallet();
			const response = await solana.connect();
			console.log(
				"Connected with public key:",
				response.publicKey.toString()
			);
			setWalletAddress(response);
		}
	};
    

	const NftCmponent = () => {
      	return(
			<div className="container row ">
				{
				nftdata.map((data) => {
					return (<div className="card" style={{"width": "18rem"}}>
					<img src={require(`${data.image}`)} className="card-img-top" alt={data.name}/>
					<div className="card-body">
						<h5 className="card-title">{data.name}</h5>
						<p className="card-text">{data.description}</p>
						<button className="btn btn-primary" onClick={buyNFT}>Buy</button>
					</div>
					</div>)
				})
				}
		  
		  </div>
		 );
	};

	const getCampaigns = async () => {
		// const connection = new Connection(network, opts.preflightCommitment);
		// const provider = getProvider();
		// const program = new Program(idl, programID, provider);
		// Promise.all(
		// 	(await connection.getProgramAccounts(programID)).map(
		// 		async (campaign) => ({
		// 			...(await program.account.campaign.fetch(campaign.pubkey)),
		// 			pubkey: campaign.pubkey,
		// 		})
		// 	)
		// ).then((campaigns) => setCampaigns(campaigns));
	};
	const createCampaign = async () => {
		// try {
		// 	const provider = getProvider();
		// 	const program = new Program(idl, programID, provider);
		// 	const [campaign] = await PublicKey.findProgramAddress(
		// 		[
		// 			utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
		// 			provider.wallet.publicKey.toBuffer(),
		// 		],
		// 		program.programId
		// 	);
		// 	await program.rpc.create("campaign name", "campaign description", {
		// 		accounts: {
		// 			campaign,
		// 			user: provider.wallet.publicKey,
		// 			systemProgram: SystemProgram.programId,
		// 		},
		// 	});
		// 	console.log(
		// 		"Created a new campaign w/ address:",
		// 		campaign.toString()
		// 	);
		// } catch (error) {
		// 	console.error("Error creating campaign account:", error);
		// }
	};

	const donate = async (publicKey) => {
		try {
			const provider = getProvider();
			// const program = new Program(idl, programID, provider);

			// await program.rpc.donate(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
			// 	accounts: {
			// 		campaign: publicKey,
			// 		user: provider.wallet.publicKey,
			// 		systemProgram: SystemProgram.programId,
			// 	},
			// });
			console.log("Donated some money to:", publicKey.toString());
			getCampaigns();
		} catch (error) {
			console.error("Error donating:", error);
		}
	};

	const withdraw = async (publicKey) => {
		try {
			const provider = getProvider();
			// const program = new Program(idl, programID, provider);
			// await program.rpc.withdraw(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
			// 	accounts: {
			// 		campaign: publicKey,
			// 		user: provider.wallet.publicKey,
			// 	},
			// });
			console.log("Withdrew some money from:", publicKey.toString());
		} catch (error) {
			console.error("Error withdrawing:", error);
		}
	};

	const renderNotConnectedContainer = () => (
		<button className="btn btn-primary" onClick={connectWallet}>Connect to Wallet</button>
	);
	const renderConnectedContainer = () => (
		<>
			<button onClick={createCampaign}>Create a campaign…</button>
			<button onClick={getCampaigns}>Get a list of campaigns…</button>
			<br />
			{campaigns.map((campaign) => (
				<>
					<p>Campaign ID: {campaign.pubkey.toString()}</p>
					<p>
						{/* Balance:{" "}
						{(
							campaign.amountDonated / web3.LAMPORTS_PER_SOL
						).toString()} */}
					</p>
					<p>{campaign.name}</p>
					<p>{campaign.description}</p>
					<button onClick={() => donate(campaign.pubkey)}>
						Click to donate!
					</button>
					<button onClick={() => withdraw(campaign.pubkey)}>
						Click to withdraw!
					</button>
					<br />
				</>
			))}
		</>
	);
	useEffect(() => {
		const onLoad = async () => {
			await checkIfWalletIsConnected();
		};
		window.addEventListener("load", onLoad);
		return () => window.removeEventListener("load", onLoad);
	}, []);

	return (
		<>
		<FrontComponent />
		
		{/* <div className="App">
		 
			{!walletAddress && renderNotConnectedContainer()}
			{walletAddress && NftCmponent()}
			 
			
		</div> */}
      
		{/* <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    <div className="App">
						{MyComponent()}
				
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider> */}

		</>
	);
};

export default App;