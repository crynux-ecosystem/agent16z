import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
// Client
import { PublicKey } from "@solana/web3.js";
import type { Agentz } from "../target/types/agentz";
import { Mistral } from "@mistralai/mistralai";
import * as dotenv from "dotenv";
import axios from "axios";
dotenv.config({ path: ".env" });


// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Agentz as anchor.Program<Agentz>;
const wallet = anchor.AnchorProvider.env().wallet;


(async () => {
  console.log("My address:", wallet.publicKey.toString());
  const balance = await program.provider.connection.getBalance(wallet.publicKey);
  console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);
})().then().catch(console.error);

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

const mistral = new Mistral({
  apiKey: process.env["MISTRAL_API_KEY"],
});

const user_selected_chain = "polygon";
const user_selected_currency = "usdc";
const user_selected_wallet_address = "";

const sp_chain = "solana";
const sp_currency = "usdc";
const sp_address = "";

const request_payment = async (amount) => {
  const resp = await axios.post("https://api.bridge.xyz/v0/transfers", {
    "amount": amount,
    "on_behalf_of": "service_provider",
    "source": {
      "payment_rail": user_selected_chain,
      "currency": user_selected_currency,
      "from_address": user_selected_wallet_address
    },
    "destination": {
      "payment_rail": sp_chain,
      "currency": sp_currency,
      "to_address": sp_address,
    }
  }, {
    headers: {
      "Content-Type": "application/json",
      "Api-Key": process.env["BRIDGE_API_KEY"],
    }
  });

  const instructions = resp.data.source_deposit_instructions;
  console.log("Token transfer instructions: ");
  console.log("Chain: " + instructions.payment_rail);
  console.log("Currency: " + instructions.currency);
  console.log("Amount: " + instructions.amount);
  console.log("From address: " + instructions.from_address);
  console.log("To address: " + instructions.to_address);
};

(async () => {
  // await init_accounts(); // Call only once on the contracts

  const result = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      {
        content:
          "Who is the best French painter? Answer in one short sentence.",
        role: "user",
      },
    ],
  });

  // Handle the result
  console.log(result);

  await book_hotel(2, 173);
  await book_flight(2, 173);
  await book_taxi(173);

  await request_payment(0.5);

})().then().catch(console.error);
