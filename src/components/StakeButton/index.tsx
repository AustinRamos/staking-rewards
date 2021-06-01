import { Button, Dropdown, Menu } from "antd";
import { ButtonProps } from "antd/lib/button";
import React from "react";
import { LABELS } from "../../constants";
import { useWallet } from "../../contexts/wallet";
import {Stake_tx} from "../../actions/index"

export interface StakeButtonProps
  extends ButtonProps,
    React.RefAttributes<HTMLElement> {
  amount?: number;
}
{/* just so i know for wallet all that matters is waller is a WalletAdapter
  export interface WalletAdapter extends EventEmitter {
publicKey: PublicKey | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  connect: () => any;
  disconnect: () => any;
*/}
 interface StakingState {
  StakingAccountPubkey: null | string;
  isInitialized: null | boolean;
  vesting_period: null | number;
  initializer_token_to_receive_account_pubkey: null | string;
 // expectedAmount: null | number;
}
const StakingState: StakingState = {
  StakingAccountPubkey: null,
  isInitialized: null,
  vesting_period: null,
  initializer_token_to_receive_account_pubkey: null,
};

export const StakeButton = (props: StakeButtonProps) => {
  const { wallet, connected, connect, select, provider } = useWallet();
  const { onClick, children, disabled, amount, ...rest } = props;

  // only show if wallet selected or user connected


    return (
      <Button
        {...rest}
        onClick={onStake_tx}
      >
       Stake {/*connected ? props.children : LABELS.CONNECT_LABEL*/}
      </Button>
    );
  

//const onStake_tx = async () => {
  async function onStake_tx () {
    console.log("wallet: " + wallet );
    console.log("pubkey: " + wallet.publicKey);

try {
    const { 
      StakingAccountPubkey,
      isInitialized,
      vesting_period,
      amount_currently_locked,
      initializer_token_to_receive_account_pubkey
    } = await Stake_tx(
      wallet,//wallet,
      9,//amount, //dont think this currently references teh correct amount
      604800,//*** VESTING PERIOD CURRENTLY HARD SET TO ... 1 week in seconds */
      wallet?.publicKey.toString(),//initializer_xTokA_account this is a hard one to get, will take some wallet manipulation, finding token accnt? shuodlnt be too bad actually some good apis here.
      LABELS.STAKING_REWARD_PROG_ID
    );
    //console.log("after async call")
    StakingState.StakingAccountPubkey = StakingAccountPubkey.toString();
    StakingState.isInitialized = isInitialized;
    StakingState.vesting_period = vesting_period;
    StakingState.initializer_token_to_receive_account_pubkey = initializer_token_to_receive_account_pubkey;
  } catch(err) {
    console.log(err)
    console.log(err.message)

    // alert(err.message);
  }
}

// return {
//   formState,
//   resetAliceUI,
//   onInitEscrow,
//   escrowState
// }

}//Not sure if this method up here should be inside or outside the ol bracket.