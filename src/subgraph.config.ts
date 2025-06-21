export default {
  contractAddress: "0xYourContractAddress",
  abi: "./abis/MyContract.json",
  startBlock: 12345678,
  providerUrl: "wss://mainnet.infura.io/ws/v3/YOUR_KEY",
  postgres: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "subgraph_db",
  },
};
