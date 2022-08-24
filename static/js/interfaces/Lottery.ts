export enum LotteryStatus {
    Pending,
    Open,
    Close
}

export default interface Lottery {
    _id?: string;
    lotteryCount?: number;
    status?: LotteryStatus;
    startedAt?: number;
    endedAt?: number;
    priceTicketInGame?: number;
    discountDivisor?: number;
    maxAmountPerBuy?:number;
    rewardBreadkdown?: number[];
    solPerBracket?: number[];
    countWinnersPerBracket?: number[];
    amountCollectedInGame?: number;
    winningNumber?: number[];
    nextLotteryPendingAmount?: number;
    startLotteryAmount?: number;
    ticketCount?: number;
    createdAt?: number;
    updatedAt?: number;
}