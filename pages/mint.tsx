// Imports
declare const window: any;

import Layout from "@components/Layout"; // Layout wrapper
import { ethers } from 'ethers'

import Token from '../src/artifacts/contracts/WeedLoot.sol/WeedLoot.json'
const TokenAddress = '0xE884e9fC6823c00F7f82369049529A5A5adc157e'

// Types
import { useState } from "react";

export default function Admin() {
    const [tokenImages, setTokenImages] = useState([''])

    async function requestAccount() {
        return await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

    async function getMyLoot() {
        if (typeof window.ethereum !== 'undefined') {
            const [account] = await requestAccount()
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(TokenAddress, Token.abi, provider)
            const balance = await contract.balanceOf(account);

            const total = parseInt(balance.toString())

            const tokens = []

            for (let i = 0; i < total; i++) {
                const token = await contract.tokenOfOwnerByIndex(account, i)

                const tokenUri = await contract.tokenURI(token)

                const decoded = Buffer.from(tokenUri.split(',')[1], 'base64').toString()
                
                const obj = JSON.parse(decoded)
                
                console.log(obj)
                const encoded = Buffer.from(obj.image_data, 'binary').toString('base64')

                tokens.push('data:image/svg+xml;base64,' + encoded)

            }

            if(tokens.length) {
                setTokenImages(tokens)
            }

        }
    }

    async function mintMyOwn() {
            // const [account] = await requestAccount()
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const contract = new ethers.Contract(TokenAddress, Token.abi, signer)
            const res = await contract.costToMint()

            const overrides = {
            value: res.toString()
            }

        //   // console.log(account)
            await contract.claim(overrides)
    }

    return (
        <Layout>
            <div className="container">
                <div>
                    {tokenImages && tokenImages[0] !== '' && tokenImages.map((v,i) => {
                        
                        return (
                            <img src={v} alt="" key={i} width="300" className="lootImg"/>
                        )
                    })}
                </div>

                <div>
                    <button onClick={getMyLoot}>Show my Loot</button><br /><br />
                </div>

                <div>
                    <h1>Minting</h1>
                    <button onClick={mintMyOwn}>Mint My Own!</button><br /><br />
                </div>
            </div>
        </Layout>
    );
}
