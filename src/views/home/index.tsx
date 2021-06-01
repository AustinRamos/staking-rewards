import { Button, Col, Row } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ConnectButton } from "../../components/ConnectButton";
import { StakeButton } from "../../components/StakeButton";
import { TokenIcon } from "../../components/TokenIcon";
import { useConnectionConfig } from "../../contexts/connection";
import { useMarkets } from "../../contexts/market";
import { WalletProvider,useWallet } from "../../contexts/wallet";
import { useUserBalance, useUserTotalBalance } from "../../hooks";
import { WRAPPED_SOL_MINT } from "../../utils/ids";
import { formatUSD } from "../../utils/utils";

export const HomeView = () => {
  const { marketEmitter, midPriceInUSD } = useMarkets();
  const { tokenMap } = useConnectionConfig();
  const TokA_ADDRESS = 'DmYZEwa1MF4TCsy98AaTFe9z7hpTUFPukJVptz6JCrHy';
  const TokA = useUserBalance(TokA_ADDRESS);
  const xTokA_ADDRESS = 'EVSALVSPTjCFbBh7nu6QFcX9omKRkEowbNmFZrTp6pE3';
  const xTokA = useUserBalance(xTokA_ADDRESS);
  const SOL = useUserBalance(WRAPPED_SOL_MINT);
  const { balanceInUSD: totalBalanceInUSD } = useUserTotalBalance();

  const [amount, setAmount] = useState(0); // or so useStaet({amount: 0})
  useEffect(() => {
    const refreshTotal = () => {};
    const dispose = marketEmitter.onMarket(() => {
      refreshTotal();
    });

    refreshTotal();

    return () => {
      dispose();
    };
  }, [marketEmitter, midPriceInUSD, tokenMap]);
  // const handleClick = () => {
  //   console.log(amount);
  //   props.send(amount);
  // }
  const handleChange = (event: React.ChangeEvent<any>) => { //right type of event?
    console.log("handleChange**: amount: " + amount);
    setAmount(event.target.value);
  }
  return (
    <Row gutter={[16, 16]} align="middle">
            <Col span={24}>
      <h2>Total Staked: </h2> {/*saw a great example of this. something just like getAccountinfo or getBalance? total amount of xTokA in circ is staked supply*/ }
      <h2>Total Supply: </h2>
      <h2>Rewards Minted: </h2>
      </Col>
      <Col span={24}>
        <h2>SOL: {SOL.balance} </h2>
        <h2 style={{ display: 'inline-flex', alignItems: 'center' }}>
          <TokenIcon mintAddress={TokA_ADDRESS} /> TokA: {TokA?.balance} 

        </h2>
        <h2 style={{ display: 'inline-flex', alignItems: 'center' }}>
        <TokenIcon mintAddress={xTokA_ADDRESS} /> xTokA: {xTokA?.balance} 

        </h2>

       <label>
         Amount:
         <input onChange={handleChange} placeholder="Type a message..." />  </label>
        <h2>
        <StakeButton value = {amount}> Stake</StakeButton> 
        </h2>
        <h2 style={{ display: 'inline-flex', alignItems: 'center' }}>
    <Button> Unstake</Button> 
          </h2>
      </Col>


     
  
      <Col span={12}>
        <ConnectButton />
      </Col>
      <Col span={12}>
        <Link to="/faucet">
          <Button>Faucet</Button>
        </Link>
      </Col>
      <Col span={24}>
        <div className="builton" />
      </Col>
    </Row>
  );
};