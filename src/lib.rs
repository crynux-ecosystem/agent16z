use anchor_lang::prelude::*;

declare_id!("7ooQgk2dzwGzW8T5GFiWP5iYdb2Nuppf81gtWQ8psCx9");

#[program]
pub mod agent16z {
    use super::*;

    pub fn book_hotel(ctx: Context<BookHotel>, timestamp: u8, num_person: u8) -> Result<()> {
        msg!("Booking hotel for {} person at {}", num_person, timestamp);
        let account_data = &mut ctx.accounts.hotel_account;
        account_data.user = ctx.accounts.user.key();
        account_data.timestamp = timestamp;
        account_data.num_person = num_person;
        account_data.bump = ctx.bumps.hotel_account;
        Ok(())
    }

    pub fn book_flight(ctx: Context<BookFlight>, timestamp: u8, num_passenger: u8) -> Result<()> {
        msg!(
            "Booking flight for {} passengers at {}",
            num_passenger,
            timestamp
        );
        let account_data = &mut ctx.accounts.flight_account;
        account_data.user = ctx.accounts.user.key();
        account_data.timestamp = timestamp;
        account_data.num_passenger = num_passenger;
        account_data.bump = ctx.bumps.flight_account;
        Ok(())
    }

    pub fn book_taxi(ctx: Context<BookTaxi>, timestamp: u8) -> Result<()> {
        msg!("Booking taxi at {}", timestamp);
        let account_data = &mut ctx.accounts.taxi_account;
        account_data.user = ctx.accounts.user.key();
        account_data.timestamp = timestamp;
        account_data.bump = ctx.bumps.taxi_account;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(timestamp: u8, num_person: u8)]
pub struct BookHotel<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        seeds = [b"hotel", user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + 32 + 1 + 1 + 1
    )]
    pub hotel_account: Account<'info, HotelAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(timestamp: u8, num_passenger: u8)]
pub struct BookFlight<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        seeds = [b"flight", user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + 32 + 1 + 1 + 1
    )]
    pub flight_account: Account<'info, FlightAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(timestamp: u8)]
pub struct BookTaxi<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        seeds = [b"taxi", user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + 32 + 1 + 1
    )]
    pub taxi_account: Account<'info, TaxiAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct HotelAccount {
    pub user: Pubkey,
    pub timestamp: u8,
    pub num_person: u8,
    pub bump: u8,
}

#[account]
pub struct FlightAccount {
    pub user: Pubkey,
    pub timestamp: u8,
    pub num_passenger: u8,
    pub bump: u8,
}

#[account]
pub struct TaxiAccount {
    pub user: Pubkey,
    pub timestamp: u8,
    pub bump: u8,
}
