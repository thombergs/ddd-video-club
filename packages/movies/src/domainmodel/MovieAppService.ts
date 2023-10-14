import type { MovieRepository } from './MovieRepository';
import type { TransactionProvider } from '@ddd-video-club-v2/database';
import type { Movie } from './Movie';

// @ReadModel
export type MovieSelectionReadModel = {
    id: string;
    title: string;
    description: string;
    posterUrl: string;
    publicationDate: Date;
    category: string;
};

// @ReadModel
export type MovieViewingReadModel = {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    publicationDate: Date;
    category: string;
};

// @Factory
function buildSelectionReadModels(movies: Movie[]): MovieSelectionReadModel[] {
    return movies.map(({ id, title, description, posterUrl, publicationDate, category }) => ({
        id,
        title,
        description,
        posterUrl,
        publicationDate,
        category,
    }));
}

// @Factory
function buildViewingReadModel(movie: Movie | undefined): MovieViewingReadModel | undefined {
    if (!movie) {
        return undefined;
    }

    const { id, title, description, videoUrl, publicationDate, category } = movie;
    return { id, title, description, videoUrl, publicationDate, category };
}

// @ApplicationService
export interface MovieAppService {
    findMoviesToSelectFrom(): Promise<MovieSelectionReadModel[]>;
    findMovieForViewing(movieId: string): Promise<MovieViewingReadModel | undefined>;
}

/**
 * Inject the necessary dependencies and return a fully usable application service.
 */
export function getMovieAppService(
    repo: MovieRepository,
    transact: TransactionProvider,
): MovieAppService {
    return {
        async findMoviesToSelectFrom() {
            return transact(async (trx) => repo.findMovies(trx).then(buildSelectionReadModels));
        },

        async findMovieForViewing(movieId) {
            return transact(async (trx) =>
                repo.getMovieById(trx, movieId).then(buildViewingReadModel),
            );
        },
    };
}
