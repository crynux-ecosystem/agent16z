import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
// Client
import { PublicKey, Keypair, Transaction } from "@solana/web3.js";
import type { Agent16z } from "../target/types/agent16z";

import fs from "fs";


// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Agent16z as anchor.Program<Agent16z>;

const secretKey: number[] = JSON.parse(fs.readFileSync('../target/deploy/agent16z-keypair.json', 'utf8'));
const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
interface Wallet {
  publicKey: typeof keypair.publicKey;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

// Create a wallet object from the Keypair
const wallet: Wallet = {
  publicKey: keypair.publicKey,
  signTransaction: async (transaction: Transaction): Promise<Transaction> => {
    transaction.partialSign(keypair);
    return transaction;
  },
  signAllTransactions: async (transactions: Transaction[]): Promise<Transaction[]> => {
    return transactions.map((transaction) => {
      transaction.partialSign(keypair);
      return transaction;
    });
  },
};



console.log("My address:", wallet.publicKey.toString());
const balance = await program.provider.connection.getBalance(wallet.publicKey);
console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

const [hotelAgent, hotelBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("hotel"), wallet.publicKey.toBuffer()],
  program.programId
);

const [flightAgent, flightBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("flight"), wallet.publicKey.toBuffer()],
  program.programId
);

const [taxiAgent, taxiBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("taxi"), wallet.publicKey.toBuffer()],
  program.programId
);

const show_account = async (account, agent) => {
  const accountData = await account.fetch(agent, "confirmed");
  console.log(JSON.stringify(accountData, null, 2));
};

const init_accounts = async () => {
  const tx = await program.methods
    .initHotel()
    .accounts({ hotelAccount: hotelAgent })
    .rpc({ commitment: "confirmed" });
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${tx}?cluster=devnet-solana`
  );

  await show_account(program.account.hotelAccount, hotelAgent);

  const tx2 = await program.methods
    .initFlight()
    .accounts({ flightAccount: flightAgent })
    .rpc({ commitment: "confirmed" });
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${tx2}?cluster=devnet-solana`
  );

  await show_account(program.account.flightAccount, flightAgent);

  const tx3 = await program.methods
    .initTaxi()
    .accounts({ taxiAccount: taxiAgent })
    .rpc({ commitment: "confirmed" });
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${tx3}?cluster=devnet-solana`
  );

  await show_account(program.account.taxiAccount, taxiAgent);
};

const book_flight = async (num_passengers, timestamp) => {
  const tx = await program.methods
    .bookFlight(timestamp, num_passengers)
    .accounts({ flightAccount: flightAgent })
    .rpc({ commitment: "confirmed" });
  console.log(">>> Book Flight: ", `${num_passengers}`);
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${tx}?cluster=devnet-solana`
  );

  await show_account(program.account.flightAccount, flightAgent);
};

const book_hotel = async (num_person, timestamp) => {
  const tx = await program.methods
    .bookHotel(timestamp, num_person)
    .accounts({ hotelAccount: hotelAgent })
    .rpc({ commitment: "confirmed" });
  console.log(">>> Book hotel: ", `${num_person}`);
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${tx}?cluster=devnet-solana`
  );

  await show_account(program.account.hotelAccount, hotelAgent);
};

const book_taxi = async (timestamp) => {
  const tx = await program.methods
    .bookTaxi(timestamp)
    .accounts({ taxiAccount: taxiAgent })
    .rpc({ commitment: "confirmed" });
  console.log(">>> Book taxi");
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${tx}?cluster=devnet-solana`
  );

  await show_account(program.account.taxiAccount, taxiAgent);
};

await init_accounts(); // Call only once on the contracts

await book_hotel(2, 173);
await book_flight(2, 173);
await book_taxi(173);
