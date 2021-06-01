import { AccountLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Account, Connection, Commitment, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import BN from "bn.js";
import * as BufferLayout from "buffer-layout";
import { useWallet, WALLET_PROVIDERS } from "../contexts/wallet";
import { GenericAccountParser } from "../contexts/accounts";



//import { ESCROW_ACCOUNT_DATA_LAYOUT, EscrowLayout } from "./layout";
const publicKey = (property = "publicKey") => {
    return BufferLayout.blob(32, property);
  };
  //const { wallet, connected, connect, select, provider } = useWallet();

  //const walletPubKey: PublicKey =  wallet.publicKey;
const connection = new Connection("http://localhost:8899", 'confirmed');
//const walletAcc = GenericAccountParser

const uint64 = (property = "uint64") => {
    return BufferLayout.blob(8, property);
  };

export const STAKING_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
    BufferLayout.u8("isInitialized"),
 BufferLayout.u8("vesting_period"), 
 BufferLayout.u8("amount_currently_locked"),   
  publicKey("initializer_token_to_receive_account_pubkey"),
  ]);
  
  export interface StakingLayout {
    isInitialized: number,
    vesting_period: Uint8Array,
    amount_currently_locked: Uint8Array,
    initializer_token_to_receive_account_pubkey: Uint8Array,
  }


export const Stake_tx = async (
  //  privateKeyByteArray: string,
    wallet:any,
    amount_to_stake: number,
    vesting_period: number,
    initializer_token_to_receive_account_pubkey: string,
    StakeProgramIdString: string) => {
      console.log("INSIDE STAKE")
    const initializer_TokenA_Pubkey = wallet.publicKey;
    console.log("after allet.publlickKey: " + wallet.publicKey);
//so stake tx has 3 instructions
///  1- create staking-program account to hold data
///  2- transfer TokA to vault(and initialize staking program accnt) 
///  3- recieve a mint of xTokA.


//***** unsure about this... */
/*
        //@ts-expect-error
  //  const XTokenMintAccountPubkey = new PublicKey((await connection.getParsedAccountInfo(wallet.publicKey, 'singleGossip')).value!.data.parsed.info.mint);
    */
  //  const privateKeyDecoded = privateKeyByteArray.split(',').map(s => parseInt(s));
  //  const initializerAccount = new Account(walletPubKey);

        // const transfer_Toka_to_vault_ix = Token
        // .createTransferInstruction(TOKEN_PROGRAM_ID, initializer_TokenA_Pubkey, tempTokenAccount.publicKey, initializerAccount.publicKey, [], amount_to_stake);
    
    const stakingAccount = new Account();
    const stakingProgramId = new PublicKey(StakeProgramIdString);

   // and Create Account!
   const createStakingAccountIx = SystemProgram.createAccount({
    space:STAKING_ACCOUNT_DATA_LAYOUT.span,
    lamports: await connection.getMinimumBalanceForRentExemption(STAKING_ACCOUNT_DATA_LAYOUT.span, 'singleGossip'),
    fromPubkey: wallet.publicKey, //fromPubkey: initializerAccount.publicKey, 
    newAccountPubkey: stakingAccount.publicKey,
    programId: stakingProgramId
});



    const DepositToVault_ix = new TransactionInstruction({
        programId: stakingProgramId,
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
            { pubkey: initializer_TokenA_Pubkey, isSigner: false, isWritable: true },
            { pubkey: new PublicKey(initializer_token_to_receive_account_pubkey), isSigner: false, isWritable: false },
            { pubkey: stakingAccount.publicKey, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false},
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.from(Uint8Array.of(0, ...new BN(amount_to_stake).toArray("le", 8)))
    })
    console.log("Stake.tx AMOUNT_TO_STAKE: " + amount_to_stake );

        ///accounts expected:
    ///  0. '[signer]' the xTokenA minting authority
    ///  1. '[writable]' the mint
    ///  2. [writable] the initializers main account to mint tokens to
    ///  3. '[writable]' the staking program account, holds (and eventually reward stuff)
    ///  4. '[writable]' the initializers xTokA account.
    ///  5. '[]' rent sysvar
    ///  6. '[]' the token program



    // const Mint_xTokA_ix = new TransactionInstruction({
    //     programId: stakingProgramId,
    //     keys: [
    //         { pubkey: initializerAccount.publicKey, isSigner: true, isWritable: false },
    //         { pubkey: tempTokenAccount.publicKey, isSigner: false, isWritable: true },
    //         { pubkey: new PublicKey(initializerReceivingTokenAccountPubkeyString), isSigner: false, isWritable: false },
    //         { pubkey: escrowAccount.publicKey, isSigner: false, isWritable: true },
    //         { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false},
    //         { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    //     ],
    //     data: Buffer.from(Uint8Array.of(0, ...new BN(amount_to_stake).toArray("le", 8)))
    // })

//um maybe just try the create account first, then try the create account and deposit.

//prolly best practice to use other accounts...


//***idk what to do anbout this i cant get initializer account just the dumb fuckign wallet. just gonna try to sign transaction. */

//*but staking accnt neds to be a signber as well? 

// const tx = new Transaction()
// .add(createStakingAccountIx ,DepositToVault_ix/*, Mint_xTokA_ix*/);
// await connection.sendTransaction(tx, [initializerAccount, stakingAccount], {skipPreflight: false, preflightCommitment: 'singleGossip'});
const tx = new Transaction()
.add(createStakingAccountIx ,DepositToVault_ix/*, Mint_xTokA_ix*/);

tx.recentBlockhash = (await connection.getRecentBlockhash("confirmed")).blockhash
tx.feePayer = wallet.publicKey
//so what keys ddoes it expect?
tx.partialSign(stakingAccount);

//wallet.conbnect or nah?
let signed_tx= await wallet.signTransaction(tx);
console.log("stake.tx tx signers: " + signed_tx);
//console.log(tx.verifySignatures());


let txid = await connection.sendRawTransaction(tx.serialize(), {skipPreflight: false, preflightCommitment: 'confirmed'});
await new Promise((resolve) => setTimeout(resolve, 1000));

console.log("signed transaction sent, txid: " + txid);
try{
await connection.confirmTransaction(txid, 'confirmed');
console.log('Transaction ' + txid + ' confirmed');
} catch (e) {
console.warn(e);
console.error('Error: ' + e.message);
}
//console.log(await connection.confirmTransaction(txid));
//let confirmedtx = await connection.getConfirmedTransaction(txid);
//console.log(( confirmedtx).transaction);
//connection.

const encodedStakingState = (await connection.getAccountInfo(stakingAccount.publicKey, 'confirmed'))!.data;

const decodedStakingState = STAKING_ACCOUNT_DATA_LAYOUT.decode(encodedStakingState) as StakingLayout;
console.log("DecodedState: " + initializer_token_to_receive_account_pubkey);
console.log("amount curr locked: " + new BN(decodedStakingState.amount_currently_locked, 10, "le").toNumber());
//rly could be an number of issues of problems with my main program... maybe account doesnt own necessary accounts? random shit going on? maybe simplify, write another insruction 5 whihc does something very simple.

return {
    StakingAccountPubkey: stakingAccount.publicKey,//stakingAccount.publicKey.toBase58(),
    isInitialized: !!decodedStakingState.isInitialized,
    vesting_period: new BN(decodedStakingState.vesting_period, 10, "le").toNumber(),
    amount_currently_locked: new BN(decodedStakingState.amount_currently_locked, 10, "le").toNumber(),
    initializer_token_to_receive_account_pubkey: initializer_token_to_receive_account_pubkey,//new PublicKey(decodedStakingState.initializer_token_to_receive_account_pubkey).toBase58(),
};
//data: [Exception: AssertionError {name: "AssertionError", actual: false, expected: true, operator: "==", message: "false == true", …}]
//programId: [Exception: AssertionError {name: "AssertionError", actual: false, expected: true, operator: "==", message: "false == true", …}]

    }