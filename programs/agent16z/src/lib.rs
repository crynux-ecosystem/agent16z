use anchor_lang::prelude::*;

declare_id!("Hbt9TACtpjJSuFUu9esQ5DJSwx77dd7kHXvkCToRQNya");

#[program]
pub mod agent_16z {
    use super::*;

    pub fn init_hotel(ctx: Context<InitHotel>) -> Result<()> {
        msg!("Init hotel account");
        let account_data = &mut ctx.accounts.hotel_account;
        account_data.user = ctx.accounts.user.key();
        account_data.timestamp = 0;
        account_data.num_person = 0;
        account_data.bump = ctx.bumps.hotel_account;
        Ok(())
    }

    pub fn book_hotel(ctx: Context<BookHotel>, timestamp: u8, num_person: u8) -> Result<()> {
        msg!("Booking hotel for {} person at {}", num_person, timestamp);
        let account_data = &mut ctx.accounts.hotel_account;
        account_data.timestamp = timestamp;
        account_data.num_person = num_person;
        Ok(())
    }

    pub fn init_flight(ctx: Context<InitFlight>) -> Result<()> {
        msg!("Init flight account");
        let account_data = &mut ctx.accounts.flight_account;
        account_data.user = ctx.accounts.user.key();
        account_data.timestamp = 0;
        account_data.num_passenger = 0;
        account_data.bump = ctx.bumps.flight_account;
        Ok(())
    }

    pub fn book_flight(ctx: Context<BookFlight>, timestamp: u8, num_passenger: u8) -> Result<()> {
        msg!(
            "Booking flight for {} passengers at {}",
            num_passenger,
            timestamp
        );
        let account_data = &mut ctx.accounts.flight_account;
        account_data.timestamp = timestamp;
        account_data.num_passenger = num_passenger;
        Ok(())
    }

    pub fn init_taxi(ctx: Context<InitTaxi>) -> Result<()> {
        msg!("Init taxi account");
        let account_data = &mut ctx.accounts.taxi_account;
        account_data.user = ctx.accounts.user.key();
        account_data.timestamp = 0;
        account_data.bump = ctx.bumps.taxi_account;
        Ok(())
    }

    pub fn book_taxi(ctx: Context<BookTaxi>, timestamp: u8) -> Result<()> {
        msg!("Booking taxi at {}", timestamp);
        let account_data = &mut ctx.accounts.taxi_account;
        account_data.timestamp = timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitHotel<'info> {
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
#[instruction(timestamp: u8, num_person: u8)]
pub struct BookHotel<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"hotel", user.key().as_ref()],
        bump = hotel_account.bump,
        realloc = 8 + 32 + 1 + 1 + 1,
        realloc::payer = user,
        realloc::zero = true,
    )]
    pub hotel_account: Account<'info, HotelAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitFlight<'info> {
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
#[instruction(timestamp: u8, num_passenger: u8)]
pub struct BookFlight<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"flight", user.key().as_ref()],
        bump = flight_account.bump,
        realloc = 8 + 32 + 1 + 1 + 1,
        realloc::payer = user,
        realloc::zero = true,
    )]
    pub flight_account: Account<'info, FlightAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitTaxi<'info> {
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

#[derive(Accounts)]
#[instruction(timestamp: u8)]
pub struct BookTaxi<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"taxi", user.key().as_ref()],
        bump = taxi_account.bump,
        realloc = 8 + 32 + 1 + 1,
        realloc::payer = user,
        realloc::zero = true,
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
