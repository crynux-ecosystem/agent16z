// Client
import { PublicKey } from "@solana/web3.js";

const program = pg.program;
const wallet = pg.wallet;

console.log("My address:", wallet.publicKey.toString());
const balance = await pg.connection.getBalance(wallet.publicKey);
console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

const [flightPda, flightBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("flight"), wallet.publicKey.toBuffer()],
  program.programId
);

const transactionSignature = await program.methods
  .bookFlight(2, 2)
  .accounts({
    flightAccount: flightPda,
  })
  .rpc({ commitment: "confirmed" });

const flightAccount = await program.account.flightAccount.fetch(
  flightPda,
  "confirmed"
);

console.log(JSON.stringify(flightAccount, null, 2));
console.log(
  "Transaction Signature:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
);
