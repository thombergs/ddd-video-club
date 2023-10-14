import type { Rental } from './Rental';
import type { CreateRentalData, RentalRepository } from './RentalRepository';
import type { TransactionProvider } from '@ddd-video-club-v2/database';

export type RentMovieCommand = {
    customerId: string;
    movieId: string;
    movieCategoryName: string;
    movieTitle: string;
    startOfRental: Date;
    endOfRental: Date;
};

// @ReadModel
export type RentalViewingReadModel = Omit<Rental, 'createdAt' | 'updatedAt'>;

// @ApplicationService
export interface RentalAppService {
    rentMovie(command: RentMovieCommand): Promise<string>;
    viewRental(rentalId: string): Promise<RentalViewingReadModel | undefined>;
}

// @Factory
function buildEntityFromCommand(command: RentMovieCommand): CreateRentalData {
    const { customerId, movieCategoryName, movieId, movieTitle, startOfRental, endOfRental } =
        command;

    const timeDifference = endOfRental.getTime() - startOfRental.getTime();
    const rentalDays = timeDifference / (1000 * 60 * 60 * 24);

    return {
        customerId,
        movieCategoryName,
        movieId,
        movieTitle,
        rentalStart: startOfRental,
        rentalDays,
    };
}

// @Factory
function buildViewingReadModel(rental: Rental | undefined): RentalViewingReadModel | undefined {
    if (!rental) {
        return undefined;
    }

    const { id, customerId, movieCategoryName, movieTitle, movieId, rentalDays, rentalStart } =
        rental;

    return { id, customerId, movieId, movieTitle, movieCategoryName, rentalStart, rentalDays };
}

/**
 * Inject the necessary dependencies and return a fully usable application service.
 */
export function getRentalAppService(
    repo: RentalRepository,
    transact: TransactionProvider,
): RentalAppService {
    return {
        async rentMovie(command) {
            return transact(async (trx) =>
                repo.createRental(trx, buildEntityFromCommand(command)).then((rental) => rental.id),
            );
        },

        async viewRental(rentalId) {
            return transact(async (trx) =>
                repo.getRentalById(trx, rentalId).then(buildViewingReadModel),
            );
        },
    };
}
