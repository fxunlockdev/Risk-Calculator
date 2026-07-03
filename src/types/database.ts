export interface Profile {
  readonly id: string;
  readonly email: string;
  readonly full_name: string | null;
  readonly avatar_url: string | null;
  readonly role: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export type Direction = "buy" | "sell";

export interface RiskCalculation {
  readonly id: string;
  readonly user_id: string;
  readonly instrument: string | null;
  readonly direction: Direction;
  readonly account_balance: number;
  readonly risk_percent: number;
  readonly entry_price: number;
  readonly stop_loss_price: number;
  readonly reward_ratio: number;
  readonly position_size: number;
  readonly dollar_risk: number;
  readonly reward_amount: number;
  readonly target_price: number;
  readonly pips_at_risk: number | null;
  readonly created_at: string;
}

export type RiskCalculationInsert = Omit<
  RiskCalculation,
  "id" | "user_id" | "created_at"
>;
