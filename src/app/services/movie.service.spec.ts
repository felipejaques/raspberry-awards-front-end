import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MovieService, YearWithMultipleWinners, Studio, ProducerInterval, MovieWinner, MoviesPageResponse } from './movie.service';

describe(MovieService.name, () => {
  let service: MovieService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'https://challenge.outsera.tech/api/movies';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MovieService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getYearsWithMultipleWinners', () => {
    it('should fetch years with multiple winners', () => {
      const mockResponse = {
        years: [
          { year: 1986, winnerCount: 2 },
          { year: 1990, winnerCount: 2 },
        ] as YearWithMultipleWinners[],
      };

      service.getYearsWithMultipleWinners().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.years.length).toBe(2);
        expect(response.years[0].year).toBe(1986);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}/yearsWithMultipleWinners`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getStudiosWithWinCount', () => {
    it('should fetch studios with win counts', () => {
      const mockResponse = {
        studios: [
          { name: 'Columbia Pictures', winCount: 7 },
          { name: 'Paramount Pictures', winCount: 6 },
          { name: 'Warner Bros.', winCount: 5 },
        ] as Studio[],
      };

      service.getStudiosWithWinCount().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.studios.length).toBe(3);
        expect(response.studios[0].name).toBe('Columbia Pictures');
      });

      const req = httpMock.expectOne(`${apiBaseUrl}/studiosWithWinCount`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getProducersIntervals', () => {
    it('should fetch producers min and max intervals', () => {
      const mockResponse = {
        min: [
          { producer: 'Joel Silver', interval: 1, previousWin: 1990, followingWin: 1991 },
        ] as ProducerInterval[],
        max: [
          { producer: 'Matthew Vaughn', interval: 13, previousWin: 2002, followingWin: 2015 },
        ] as ProducerInterval[],
      };

      service.getProducersIntervals().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.min.length).toBe(1);
        expect(response.max.length).toBe(1);
        expect(response.min[0].interval).toBe(1);
        expect(response.max[0].interval).toBe(13);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}/maxMinWinIntervalForProducers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMovieWinnersByYear', () => {
    it('should fetch movie winners by year', () => {
      const mockResponse: MovieWinner[] = [
        { id: 1, year: 2000, title: 'Movie A' },
        { id: 2, year: 2000, title: 'Movie B' },
      ];

      service.getMovieWinnersByYear(2000).subscribe((movies) => {
        expect(movies).toEqual(mockResponse);
        expect(movies.length).toBe(2);
        expect(movies[0].year).toBe(2000);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}?page=9&size=99&winner=true&year=2000`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include year parameter in URL', () => {
      service.getMovieWinnersByYear(1985).subscribe();

      const req = httpMock.expectOne(`${apiBaseUrl}?page=9&size=99&winner=true&year=1985`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getMovies', () => {
    const mockMoviesResponse: MoviesPageResponse = {
      content: [
        {
          id: 1,
          year: 1980,
          title: 'Can\'t Stop the Music',
          studios: ['Associated Film Distribution'],
          producers: ['Allan Carr'],
          winner: true,
        },
      ],
      pageable: { pageNumber: 0, pageSize: 15 },
      totalPages: 5,
      totalElements: 75,
      first: true,
      last: false,
      number: 0,
      size: 15,
    };

    it('should fetch movies with default parameters', () => {
      service.getMovies().subscribe((response) => {
        expect(response).toEqual(mockMoviesResponse);
        expect(response.content.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}?page=0&size=15`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMoviesResponse);
    });

    it('should fetch movies with custom page and size', () => {
      service.getMovies(2, 20).subscribe((response) => {
        expect(response).toEqual(mockMoviesResponse);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}?page=2&size=20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMoviesResponse);
    });

    it('should include year parameter when provided', () => {
      service.getMovies(0, 15, 1990).subscribe((response) => {
        expect(response).toEqual(mockMoviesResponse);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}?page=0&size=15&year=1990`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMoviesResponse);
    });

    it('should include winner parameter when provided', () => {
      service.getMovies(0, 15, undefined, true).subscribe((response) => {
        expect(response).toEqual(mockMoviesResponse);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}?page=0&size=15&winner=true`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMoviesResponse);
    });

    it('should include both year and winner parameters when provided', () => {
      service.getMovies(1, 10, 1985, false).subscribe((response) => {
        expect(response).toEqual(mockMoviesResponse);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}?page=1&size=10&year=1985&winner=false`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMoviesResponse);
    });

    it('should not include year parameter when null', () => {
      service.getMovies(0, 15, null as any).subscribe((response) => {
        expect(response).toEqual(mockMoviesResponse);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}?page=0&size=15`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMoviesResponse);
    });

    it('should not include winner parameter when null', () => {
      service.getMovies(0, 15, undefined, null as any).subscribe((response) => {
        expect(response).toEqual(mockMoviesResponse);
      });

      const req = httpMock.expectOne(`${apiBaseUrl}?page=0&size=15`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMoviesResponse);
    });
  });
});