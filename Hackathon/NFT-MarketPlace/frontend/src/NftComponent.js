import nftdata from './NFT.json';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';

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
                    <button className="btn btn-primary">Buy</button>
                </div>
                </div>)
            })
            }
      
      </div>
     );
};

export default NftCmponent;