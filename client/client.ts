import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
// Client
import { PublicKey, Keypair, Transaction } from "@solana/web3.js";
import type { Agentz } from "../target/types/agentz";
import { Mistral } from "@mistralai/mistralai";
import { ToolTypes, FunctionT, FunctionT$inboundSchema } from "@mistralai/mistralai/models/components";
import * as dotenv from "dotenv";
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


const tools = [
  {
      type: ToolTypes.Function,
      function: {
        name: "book_hotel",
        description: "Book a hotel for users",
        parameters: {
            type: "object",
            properties: {
                num_person: {
                    type: "integer",
                    description: "Num of people to live in",
                }
            },
            required: ["num_person"],
        },
      },
  },
  {
      type: ToolTypes.Function,
      function: {
          name: "book_flight",
          description: "Book a flight with the constraints",
          parameters: {
              type: "object",
              properties: {
                  num_passengers: {
                      type: "integer",
                      description: "Num of passengers to book a flight.",
                  }
              },
              required: ["num_passengers"],
          }
      }
  },
  {
    type: ToolTypes.Function,
    function: {
        name: "book_taxi",
        description: "Book a taxi",
        parameters: {},
    },
  }
];


(async () => {
  // await init_accounts(); // Call only once on the contracts

  const result = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      {
        content: "Help me to book a trip to new york, including flight, accommodation and traffic to the airport",
        role: "user",
      },
    ],
    tools: tools,
    toolChoice: "any",
  });

  // Handle the result
  console.log(result);
  console.log(result.choices[0].message.toolCalls);

  var f2sc = {
    "book_hotel": book_hotel,
    "book_flight": book_flight,
    "book_taxi": book_taxi,
  }


  for (var idx in result.choices[0].message.toolCalls) {
    let f = result.choices[0].message.toolCalls[idx];
    let args: Record<string, any> = JSON.parse(f.function["arguments"] as string);
    args["timestamp"] = 173;
    await f2sc[f.function.name](args);
  }
})().then().catch(console.error);
